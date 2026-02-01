import {
  Game,
  Movie,
  TV,
  Book,
  Media,
  Rating,
  CoverUrl,
  ReleaseYear,
  ExternalReference,
  asMediaId,
} from '../../index';
import * as schema from '../db/media.schema';
import { ProviderMetadataMapper } from './provider-metadata.mapper';

export class MediaMapper {
  static toDomain(row: {
    medias: typeof schema.medias.$inferSelect;
    games: typeof schema.games.$inferSelect | null;
    movies: typeof schema.movies.$inferSelect | null;
    tv: typeof schema.tv.$inferSelect | null;
    books: typeof schema.books.$inferSelect | null;
  }): Media {
    const id = asMediaId(row.medias.id);
    const title = row.medias.title;
    const slug = row.medias.slug;
    const description = null;

    // Use mapper to convert ProviderMetadata back to ExternalReference
    let externalReference: ExternalReference;
    const metadata = row.medias.providerMetadata;

    if (metadata) {
      try {
        externalReference =
          ProviderMetadataMapper.toExternalReference(metadata);
      } catch {
        externalReference = new ExternalReference('unknown', 'unknown');
      }
    } else {
      externalReference = new ExternalReference('unknown', 'unknown');
    }

    const coverUrl = MediaMapper.createCoverUrl(metadata?.coverUrl || null);
    const rating = MediaMapper.createRating(row.medias.globalRating);
    const releaseYear = MediaMapper.createReleaseYear(row.medias.releaseDate);

    switch (row.medias.type) {
      case 'GAME':
        if (!row.games)
          throw new Error(
            `Data integrity error: Media ${id} is TYPE GAME but has no games record.`,
          );
        return new Game({
          id,
          title,
          slug,
          description,
          coverUrl,
          rating,
          releaseYear,
          externalReference,
          platform: row.games.platform as string[],
          developer: row.games.developer,
          timeToBeat: row.games.timeToBeat,
        });

      case 'MOVIE':
        if (!row.movies)
          throw new Error(
            `Data integrity error: Media ${id} is TYPE MOVIE but has no movies record.`,
          );
        return new Movie({
          id,
          title,
          slug,
          description,
          coverUrl,
          rating,
          releaseYear,
          externalReference,
          director: row.movies.director,
          durationMinutes: row.movies.durationMinutes,
        });

      case 'TV':
        if (!row.tv)
          throw new Error(
            `Data integrity error: Media ${id} is TYPE TV but has no tv record.`,
          );
        return new TV({
          id,
          title,
          slug,
          description,
          coverUrl,
          rating,
          releaseYear,
          externalReference,
          creator: row.tv.creator,
          episodesCount: row.tv.episodesCount,
          seasonsCount: row.tv.seasonsCount,
        });

      case 'BOOK':
        if (!row.books)
          throw new Error(
            `Data integrity error: Media ${id} is TYPE BOOK but has no books record.`,
          );
        return new Book({
          id,
          title,
          slug,
          description,
          coverUrl,
          rating,
          releaseYear,
          externalReference,
          author: row.books.author,
          pages: row.books.pages,
        });

      default:
        throw new Error(`Unknown media type: ${row.medias.type}`);
    }
  }

  // Helpers safely encapsulated within the Mapper
  private static createRating(val: number | null): Rating | null {
    if (val === null) return null;
    try {
      return new Rating(val);
    } catch {
      return null;
    }
  }

  private static createCoverUrl(val: string | null): CoverUrl | null {
    if (!val) return null;
    try {
      return new CoverUrl(val);
    } catch {
      return null;
    }
  }

  private static createReleaseYear(date: Date | null): ReleaseYear | null {
    if (!date) return null;
    try {
      return new ReleaseYear(date.getFullYear());
    } catch {
      return null;
    }
  }
}
