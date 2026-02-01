import type { IMediaRepository } from '../../ports/media.repository.interface';
import type { SearchMediaQuery } from './search-media.query';
import type {
  GroupedSearchResponse,
  PaginatedSearchResponse,
  SearchMediaReadModel,
} from '../../../domain/read-models/search-media.read-model';
import type { MediaReadModel } from '../../../domain/read-models/media-read.model';

import type { Redis } from 'ioredis';
import type { IMediaProvider } from '../../ports/media-provider.interface';
import { MediaType, Media } from '../../../domain/entities/media.entity';
import { logger } from '@metacult/backend-infrastructure';
import { Result, AppError, InfrastructureError } from '@metacult/shared-core';

/**
 * Handler pour la requête de recherche de médias (Query Handler).
 * Implémente une stratégie de cache agressive et une recherche hybride (Locale + Distante).
 */
export class SearchMediaHandler {
  constructor(
    private readonly mediaRepository: IMediaRepository,
    private readonly redis: Redis,
    private readonly igdbAdapter: IMediaProvider,
    private readonly tmdbAdapter: IMediaProvider,
    private readonly googleBooksAdapter: IMediaProvider,
  ) {}

  /**
   * Exécute la logique de recherche unifiée.
   */
  async execute(
    query: SearchMediaQuery,
  ): Promise<
    Result<GroupedSearchResponse | PaginatedSearchResponse, AppError>
  > {
    try {
      const searchTerm = query.search?.trim();

      // Normalize types (Debt cleanup: prefer types array over single type)
      const effectiveTypes =
        query.types && query.types.length > 0
          ? query.types
          : query.type
            ? [query.type]
            : undefined;

      // Check Advanced Filters
      const isAdvancedFilterActive =
        !!query.minElo ||
        !!query.releaseYear ||
        (!!query.tags && query.tags.length > 0) ||
        (!!effectiveTypes && effectiveTypes.length > 0) ||
        !!query.page;

      if (isAdvancedFilterActive || !searchTerm) {
        // --- MODE B: Advanced Search (Local Only) ---
        const page = query.page || 1;
        const limit = query.limit || 20;

        const { items, total } = await this.mediaRepository.searchAdvanced({
          search: searchTerm,
          minElo: query.minElo,
          releaseYear: query.releaseYear,
          tags: query.tags,
          // type: query.type, // Legacy support removed (using normalized types)
          types: effectiveTypes,
          excludedIds: query.excludedIds,
          page: page,
          limit: limit,
          orderBy: query.orderBy,
        });

        const dtos = items.map((entity) => this.mapEntityToItem(entity));

        return Result.ok({
          items: dtos,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        });
      }

      // --- MODE A: Simple Text Search (Hybrid + Grouped) ---

      // 1. Random Feed specific case (Legacy)
      if (query.orderBy === 'random') {
        return Result.ok(
          this.mapLocalToGrouped(
            await this.mediaRepository.findRandom({
              excludedIds: query.excludedIds,
              limit: query.limit ?? 10,
              types: effectiveTypes,
            }),
          ),
        );
      }

      // 2. Short Query Check
      if (!searchTerm || searchTerm.length < 3) {
        return Result.ok(this.emptyResponse());
      }

      const normalizedQuery = searchTerm.toLowerCase();
      const cacheKey = `search:unified:${normalizedQuery}`;

      // 3. Check Redis Cache
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        logger.info({ searchTerm }, '[Search] Cache Hit');
        return Result.ok(JSON.parse(cached));
      }

      logger.info(
        { searchTerm },
        '[Search] Cache Miss - Launching hybrid search',
      );

      // 4. Local Search
      const localResults = await this.mediaRepository.searchViews({
        search: searchTerm,
        // type: query.type, // Legacy support removed
        types: effectiveTypes,
        limit: query.limit, // Legacy limit support
      });

      const shouldCallRemote = localResults.length < 5;
      const groupedResponse = this.mapLocalToGrouped(localResults);

      // 5. Remote Search (if needed)
      if (shouldCallRemote) {
        logger.info(
          { localResults: localResults.length },
          '[Search] Insufficient local results - calling remote providers',
        );

        const results = await Promise.allSettled([
          this.igdbAdapter.search(searchTerm),
          this.tmdbAdapter.search(searchTerm),
          this.googleBooksAdapter.search(searchTerm),
        ]);

        const [igdbRes, tmdbRes, gbooksRes] = results;

        if (igdbRes.status === 'fulfilled') {
          this.mergeRemoteResults(groupedResponse.games, igdbRes.value);
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
          this.mergeRemoteResults(groupedResponse.books, gbooksRes.value);
        } else {
          logger.error({ err: gbooksRes.reason }, '[Search] GoogleBooks Error');
        }
      }

      // 6. Save to Cache
      await this.redis.set(
        cacheKey,
        JSON.stringify(groupedResponse),
        'EX',
        3600,
      );

      return Result.ok(groupedResponse);
    } catch (error) {
      return Result.fail(
        error instanceof AppError
          ? error
          : new InfrastructureError(
              error instanceof Error ? error.message : 'Unknown error',
            ),
      );
    }
  }

  private emptyResponse(): GroupedSearchResponse {
    return { games: [], movies: [], shows: [], books: [] };
  }

  private mapLocalToGrouped(
    localResults: MediaReadModel[],
  ): GroupedSearchResponse {
    const response = this.emptyResponse();

    for (const res of localResults) {
      const item: SearchMediaReadModel = {
        id: res.id,
        title: res.title,
        slug: res.slug,
        year: res.releaseYear,
        poster: res.coverUrl,
        type: res.type,
        isImported: true, // Local DB items are imported
        externalId: null, // Not available in simple ReadDto
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
    targetArray: SearchMediaReadModel[],
    remoteItems: Media[],
  ) {
    for (const remote of remoteItems) {
      const exists = targetArray.some(
        (local) =>
          local.title.toLowerCase() === remote.title.toLowerCase() &&
          (local.year && remote.releaseYear?.getValue()
            ? local.year === remote.releaseYear.getValue()
            : true),
      );

      if (!exists) {
        targetArray.push(this.mapRemoteToItem(remote));
      }
    }
  }

  private mapEntityToItem(entity: Media): SearchMediaReadModel {
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

  private mapRemoteToItem(media: Media): SearchMediaReadModel {
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
      year: media.releaseYear ? media.releaseYear.getValue() : null,
      poster: media.coverUrl ? media.coverUrl.getValue() : null,
      type: media.type,
      isImported: false,
    };
  }

  private addUnique(
    target: SearchMediaReadModel[],
    item: SearchMediaReadModel,
  ) {
    if (
      !target.some((t) => t.title.toLowerCase() === item.title.toLowerCase())
    ) {
      target.push(item);
    }
  }
}
