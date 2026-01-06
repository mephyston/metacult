import type { IMediaRepository } from '../../ports/media.repository.interface';
import type { SearchMediaQuery } from './search-media.query';
import type {
  GroupedSearchResponseDto,
  PaginatedSearchResponseDto,
  SearchResultItemSchema,
} from '../../../api/http/dtos/media.dtos';
import type { Static } from 'elysia';
import type { Redis } from 'ioredis';
import type {
  IgdbAdapter,
  TmdbAdapter,
  GoogleBooksAdapter,
} from '../../../infrastructure/adapters/media.adapters';
import { MediaType, Media } from '../../../domain/entities/media.entity';
import { logger } from '@metacult/backend-infrastructure';

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
    private readonly googleBooksAdapter: GoogleBooksAdapter,
  ) {}

  /**
   * Exécute la logique de recherche unifiée.
   */
  async execute(
    query: SearchMediaQuery,
  ): Promise<GroupedSearchResponseDto | PaginatedSearchResponseDto> {
    const searchTerm = query.search?.trim();

    // Mode B: Advanced Search / Exploration
    // Condition: Filters present OR Empty Search (if specific filters used like years)
    // Note: User spec says "Mode B: Des filtres sont présents (minElo, year, etc.) OU query.search est vide."
    // But earlier "Mode A: ... ET aucun filtre avancé n'est actif".
    // So presence of ANY advanced filter => Mode B.
    const hasAdvancedFilters =
      !!query.minElo ||
      !!query.releaseYear ||
      (query.tags && query.tags.length > 0) ||
      !!query.page ||
      !!query.type; // Type is also a filter but existed before. Assuming Type -> Mode B if strict?
    // User spec: "Mode A ... ET aucun filtre avancé (minElo, tags, year) n'est actif."
    // Does 'type' count as advanced?
    // Logic: If 'type' is set, we usually want a list of that type, not a grouped response of empty arrays except one.
    // Let's treat 'type' as trigger for flat list (Mode B) OR keep it compatible.
    // BUT user said "Mode A ... (existant) ... Garde la logique actuelle".
    // Existing logic DID handle `type` (passed to local searchViews).
    // Let's stick to user explicit list: `minElo`, `tags`, `year`.
    // If query.search is empty, User says Mode B? "OU query.search est vide".
    // Existing code handled empty search -> `findMostRecent` (Discovery Feed).
    // Let's refactor:
    // if (advanced) -> Mode B
    // else -> Mode A (includes empty search logic which calls findMostRecent -> Grouped)

    // User Spec Refined:
    // Mode A: `query.search` present AND NO `minElo`, `tags`, `year`.
    // Mode B: (`minElo` OR `year` OR `tags` active) OR (`query.search` empty).

    // Check Advanced Filters
    const isAdvancedFilterActive =
      !!query.minElo ||
      !!query.releaseYear ||
      (!!query.tags && query.tags.length > 0) ||
      !!query.page;
    // Note: I included `page` as advanced because Mode A (Grouped) probably doesn't support pagination cleanly in legacy.

    if (isAdvancedFilterActive || !searchTerm) {
      // --- MODE B: Advanced Search (Local Only) ---
      // Also handles "Empty Search" (Discovery) but now paginated if page provided?
      // User said: "Mode B ... OU query.search est vide".
      // Existing empty search was `findMostRecent`.
      // `searchAdvanced` can handle empty search (returns all/recent).

      const page = query.page || 1;
      const limit = query.limit || 20;

      const { items, total } = await this.mediaRepository.searchAdvanced({
        search: searchTerm,
        minElo: query.minElo,
        releaseYear: query.releaseYear,
        tags: query.tags, // Assuming convert to array if needed or already array
        type: query.type,
        excludedIds: query.excludedIds,
        page: page,
        limit: limit,
        orderBy: query.orderBy,
      });

      const dtos = items.map((entity) => this.mapEntityToItem(entity));

      return {
        items: dtos,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }

    // --- MODE A: Simple Text Search (Hybrid + Grouped) ---
    // Should behave exactly as before.

    // 1. Random Feed specific case (Legacy)
    if (query.orderBy === 'random') {
      return this.mapLocalToGrouped(
        await this.mediaRepository.findRandom({
          excludedIds: query.excludedIds,
          limit: query.limit ?? 10,
        }),
      );
    }

    // 2. Short Query Check
    if (searchTerm!.length < 3) {
      return this.emptyResponse();
    }

    const normalizedQuery = searchTerm!.toLowerCase();
    const cacheKey = `search:unified:${normalizedQuery}`;

    // 3. Check Redis Cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      logger.info({ searchTerm }, '[Search] Cache Hit');
      return JSON.parse(cached);
    }

    logger.info(
      { searchTerm },
      '[Search] Cache Miss - Launching hybrid search',
    );

    // 4. Local Search
    const localResults = await this.mediaRepository.searchViews({
      search: searchTerm,
      type: query.type, // Legacy support for type in simple search
      limit: query.limit, // Legacy limit support
    });

    const shouldCallRemote = localResults.length < 5;
    const groupedResponse = this.mapLocalToGrouped(localResults);

    // 5. Remote Search (if needed)
    if (shouldCallRemote) {
      // NOTE: We DO NOT send advanced filters to remote providers, consistent with spec.
      // But query.type IS a legacy filter we might want to respect if possible?
      // Handler logic filters results by type AFTER remote call currently (in `mergeRemoteResults/addUnique`? No, logic below does explicit type checks).

      logger.info(
        { localResults: localResults.length },
        '[Search] Insufficient local results - calling remote providers',
      );

      const results = await Promise.allSettled([
        this.igdbAdapter.search(searchTerm!),
        this.tmdbAdapter.search(searchTerm!),
        this.googleBooksAdapter.search(searchTerm!),
      ]);

      const [igdbRes, tmdbRes, gbooksRes] = results;

      if (igdbRes.status === 'fulfilled') {
        this.mergeRemoteResults(
          groupedResponse.games,
          igdbRes.value,
          MediaType.GAME,
        );
      } else {
        logger.error({ err: igdbRes.reason }, '[Search] IGDB Error');
      }

      if (tmdbRes.status === 'fulfilled') {
        for (const media of tmdbRes.value) {
          const item = this.mapRemoteToItem(media);
          if (media.type === MediaType.MOVIE) {
            this.addUnique(groupedResponse.movies, item);
          } else if (media.type === MediaType.TV) {
            this.addUnique(groupedResponse.shows, item);
          }
        }
      } else {
        logger.error({ err: tmdbRes.reason }, '[Search] TMDB Error');
      }

      if (gbooksRes.status === 'fulfilled') {
        this.mergeRemoteResults(
          groupedResponse.books,
          gbooksRes.value,
          MediaType.BOOK,
        );
      } else {
        logger.error({ err: gbooksRes.reason }, '[Search] GoogleBooks Error');
      }
    }

    // 6. Save to Cache
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
        externalId: res.externalReference?.id ?? null,
      };

      switch (res.type) {
        case 'game':
          response.games.push(item);
          break;
        case 'movie':
          response.movies.push(item);
          break;
        case 'tv':
          response.shows.push(item);
          break;
        case 'book':
          response.books.push(item);
          break;
      }
    }
    return response;
  }

  private mergeRemoteResults(
    targetArray: SearchResultItem[],
    remoteItems: any[],
    type: MediaType,
  ) {
    for (const remote of remoteItems) {
      const exists = targetArray.some(
        (local) =>
          local.title.toLowerCase() === remote.title.toLowerCase() &&
          (local.year && remote.releaseYear?.value
            ? local.year === remote.releaseYear.value
            : true),
      );

      if (!exists) {
        targetArray.push(this.mapRemoteToItem(remote));
      }
    }
  }

  private mapEntityToItem(entity: Media): SearchResultItem {
    return {
      id: entity.id,
      title: entity.title,
      slug: entity.slug,
      year: entity.releaseYear?.getValue() ?? null,
      poster: entity.coverUrl?.getValue() ?? null,
      type: entity.type,
      isImported: true,
      externalId: entity.externalReference?.id ?? null,
    };
  }

  private mapRemoteToItem(media: any): SearchResultItem {
    // media is a Domain Entity (Media/Game/Movie/etc) or similar shape from remote adapter
    const extId = media.externalReference?.id;
    if (!extId) {
      logger.warn(
        { title: media.title },
        '[Warning] Missing externalId for remote item',
      );
    }
    return {
      id: media.id, // Internal UUID (Generated by adapter)
      externalId: extId || null, // Real Provider ID
      title: media.title,
      slug: media.slug, // Entity has slug
      year: media.releaseYear ? media.releaseYear.value : null,
      poster: media.coverUrl ? media.coverUrl.value : null,
      type: media.type,
      isImported: false,
    };
  }

  private addUnique(target: SearchResultItem[], item: SearchResultItem) {
    if (
      !target.some((t) => t.title.toLowerCase() === item.title.toLowerCase())
    ) {
      target.push(item);
    }
  }
}
