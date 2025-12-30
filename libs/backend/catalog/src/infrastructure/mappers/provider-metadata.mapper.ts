import { ExternalReference } from '../../domain/value-objects/external-reference.vo';
import type { ProviderMetadata } from '../types/raw-responses';

/**
 * Infrastructure Mapper: Converts between Domain Value Objects and Infrastructure DTOs.
 * This prevents the repository from handling conversion logic directly.
 */
export class ProviderMetadataMapper {
    /**
     * Converts an ExternalReference (domain) to ProviderMetadata (infrastructure).
     */
    static toProviderMetadata(ref: ExternalReference): ProviderMetadata {
        if (ref.provider === 'igdb') {
            return {
                source: 'IGDB',
                igdbId: Number(ref.id),
            };
        } else if (ref.provider === 'tmdb') {
            // Note: mediaType needs to be inferred from context or passed separately
            // For now, we'll default to 'movie' but this should be enhanced
            return {
                source: 'TMDB',
                tmdbId: Number(ref.id),
                mediaType: 'movie', // TODO: This should be passed as parameter
            };
        } else if (ref.provider === 'google_books') {
            return {
                source: 'GOOGLE_BOOKS',
                googleId: ref.id,
            };
        }
        
        throw new Error(`Unknown provider: ${ref.provider}`);
    }

    /**
     * Converts an ExternalReference with explicit media type context.
     */
    static toProviderMetadataWithType(
        ref: ExternalReference,
        mediaType?: 'movie' | 'tv'
    ): ProviderMetadata {
        if (ref.provider === 'igdb') {
            return {
                source: 'IGDB',
                igdbId: Number(ref.id),
            };
        } else if (ref.provider === 'tmdb') {
            return {
                source: 'TMDB',
                tmdbId: Number(ref.id),
                mediaType: mediaType || 'movie',
            };
        } else if (ref.provider === 'google_books') {
            return {
                source: 'GOOGLE_BOOKS',
                googleId: ref.id,
            };
        }
        
        throw new Error(`Unknown provider: ${ref.provider}`);
    }

    /**
     * Converts ProviderMetadata (infrastructure) to ExternalReference (domain).
     */
    static toExternalReference(metadata: ProviderMetadata): ExternalReference {
        if (metadata.source === 'IGDB') {
            return new ExternalReference('igdb', String(metadata.igdbId));
        } else if (metadata.source === 'TMDB') {
            return new ExternalReference('tmdb', String(metadata.tmdbId));
        } else if (metadata.source === 'GOOGLE_BOOKS') {
            return new ExternalReference('google_books', metadata.googleId);
        }
        
        throw new Error(`Unknown metadata source: ${(metadata as any).source}`);
    }
}
