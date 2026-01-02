import type { IMediaRepository } from '../../ports/media.repository.interface';
import type { SearchMediaQuery } from './search-media.query';
import type { GroupedSearchResponseDto, SearchResultItemSchema } from '../../../api/http/dtos/media.dtos';
import type { Static } from 'elysia';
import type { Redis } from 'ioredis';
import type { IgdbAdapter, TmdbAdapter, GoogleBooksAdapter } from '../../../infrastructure/adapters/media.adapters';
import { MediaType } from '../../../domain/entities/media.entity';

type SearchResultItem = Static<typeof SearchResultItemSchema>;

/**
 * Handler pour la requête de recherche de médias (Query Handler).
 * Implémente une stratégie de cache agressive et une recherche hybride (Locale + Distante).
 */
export class SearchMediaHandler {
    constructor(
        private readonly mediaRepository: IMediaRepository,
        private readonly redis: Redis,
        private readonly igdbAdapter: IgdbAdapter,
        private readonly tmdbAdapter: TmdbAdapter,
        private readonly googleBooksAdapter: GoogleBooksAdapter
    ) { }

    /**
     * Exécute la logique de recherche unifiée.
     */
    async execute(query: SearchMediaQuery): Promise<GroupedSearchResponseDto> {
        const searchTerm = query.search?.trim();

        // FEATURE: Random Feed support
        if (query.orderBy === 'random') {
            return this.mapLocalToGrouped(
                await this.mediaRepository.findRandom({
                    excludedIds: query.excludedIds,
                    limit: query.limit ?? 10
                })
            );
        }

        // FEATURE: If search is empty, return "Discovery" feed (Most Recent)
        if (!searchTerm) {
            const recent = await this.mediaRepository.findMostRecent(20);
            return this.mapLocalToGrouped(recent);
        }

        if (searchTerm.length < 3) {
            return this.emptyResponse();
        }

        const normalizedQuery = searchTerm.toLowerCase();
        const cacheKey = `search:unified:${normalizedQuery}`;

        // 1. Check Redis Cache
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            console.log(`[Search] Cache Hit pour "${searchTerm}"`);
            return JSON.parse(cached);
        }

        console.log(`[Search] Cache Miss pour "${searchTerm}" - Lancement recherche hybride`);

        // 2. Parallel Execution (Local DB + Remote Providers if needed)
        // On lance toujours la locale. Pour la distante, on pourrait optimiser, 
        // mais pour le parallélisme demandé, on lance tout si c'est pertinent.

        // D'abord, on cherche en local pour voir si on a assez de résultats
        // Note: Pour une vraie expérience "Unified", on veut souvent mélanger.
        // La règle demandée est: SI (résultats locaux < 5) => Appelle Distant

        const localResults = await this.mediaRepository.searchViews({ search: searchTerm });

        const shouldCallRemote = localResults.length < 5;
        // Si filtre par type spécifique, on peut ajuster, mais ici on reste simple.

        const groupedResponse = this.mapLocalToGrouped(localResults);

        if (shouldCallRemote) {
            console.log(`[Search] Résultats locaux insuffisants (${localResults.length}), appel providers distants...`);

            // Promise.allSettled pour ne pas fail si un provider est down (429, 500...)
            const results = await Promise.allSettled([
                this.igdbAdapter.search(searchTerm),
                this.tmdbAdapter.search(searchTerm),
                this.googleBooksAdapter.search(searchTerm)
            ]);

            // Traitement des résultats distants
            const [igdbRes, tmdbRes, gbooksRes] = results;

            if (igdbRes.status === 'fulfilled') {
                this.mergeRemoteResults(groupedResponse.games, igdbRes.value, MediaType.GAME);
            } else {
                console.error(`[Search] IGDB Error:`, igdbRes.reason);
            }

            if (tmdbRes.status === 'fulfilled') {
                // TMDB retourne Movies et TV mélangés par l'adapter search() ? 
                // Vérifions l'adapter... TmdbAdapter.search renvoie Media[] (Movie | TV).
                // On doit les trier.

                for (const media of tmdbRes.value) {
                    const item = this.mapRemoteToItem(media);
                    if (media.type === MediaType.MOVIE) {
                        this.addUnique(groupedResponse.movies, item);
                    } else if (media.type === MediaType.TV) {
                        this.addUnique(groupedResponse.shows, item);
                    }
                }
            } else {
                console.error(`[Search] TMDB Error:`, tmdbRes.reason);
            }

            if (gbooksRes.status === 'fulfilled') {
                this.mergeRemoteResults(groupedResponse.books, gbooksRes.value, MediaType.BOOK);
            } else {
                console.error(`[Search] GoogleBooks Error:`, gbooksRes.reason);
            }
        }

        // 3. Save to Cache (TTL 1h)
        await this.redis.set(cacheKey, JSON.stringify(groupedResponse), 'EX', 3600);

        return groupedResponse;
    }

    private emptyResponse(): GroupedSearchResponseDto {
        return { games: [], movies: [], shows: [], books: [] };
    }

    private mapLocalToGrouped(localResults: any[]): GroupedSearchResponseDto {
        const response = this.emptyResponse();

        for (const res of localResults) {
            const item: SearchResultItem = {
                id: res.id,
                title: res.title,
                slug: res.slug,
                year: res.releaseYear,
                poster: res.coverUrl,
                type: res.type,
                isImported: true, // Local DB items are imported
                externalId: res.externalReference?.id ?? null
            };

            switch (res.type) {
                case 'game': response.games.push(item); break;
                case 'movie': response.movies.push(item); break;
                case 'tv': response.shows.push(item); break;
                case 'book': response.books.push(item); break;
            }
        }
        return response;
    }

    private mergeRemoteResults(targetArray: SearchResultItem[], remoteItems: any[], type: MediaType) {
        for (const remote of remoteItems) {
            const exists = targetArray.some(local =>
                local.title.toLowerCase() === remote.title.toLowerCase() &&
                (local.year && remote.releaseYear?.value ? local.year === remote.releaseYear.value : true)
            );

            if (!exists) {
                targetArray.push(this.mapRemoteToItem(remote));
            }
        }
    }

    private mapRemoteToItem(media: any): SearchResultItem {
        // media is a Domain Entity (Media/Game/Movie/etc)
        // console.log(`[Debug] Mapping Remote Item: ${media.title}, ExternalRef:`, media.externalReference);
        const extId = media.externalReference?.id;
        if (!extId) {
            console.warn(`[Warning] Missing externalId for remote item: ${media.title}`);
        }
        return {
            id: media.id, // Internal UUID (Generated by adapter)
            externalId: extId || null, // Real Provider ID
            title: media.title,
            slug: media.slug, // Entity has slug
            year: media.releaseYear ? media.releaseYear.value : null,
            poster: media.coverUrl ? media.coverUrl.value : null,
            type: media.type,
            isImported: false
        };
    }

    private addUnique(target: SearchResultItem[], item: SearchResultItem) {
        if (!target.some(t => t.title.toLowerCase() === item.title.toLowerCase())) {
            target.push(item);
        }
    }
}
