import { ExternalReference } from '../../domain/value-objects/external-reference.vo';
import type { ProviderMetadata } from '../types/raw-responses';

/**
 * Mappeur d'Infrastructure.
 * Convertit les Value Objects du Domaine vers les DTOs d'Infrastructure (structure JSONB utilisée en base).
 * Empêche le Repository de porter la logique de conversion.
 */
export class ProviderMetadataMapper {
    /**
     * Convertit une ExternalReference (Domaine) vers ProviderMetadata (Infra).
     */
    static toProviderMetadata(ref: ExternalReference): ProviderMetadata {
        if (ref.provider === 'igdb') {
            return {
                source: 'IGDB',
                igdbId: Number(ref.id),
            };
        } else if (ref.provider === 'tmdb') {
            // Note : le mediaType doit être déduit du contexte ou passé séparément.
            // Par défaut 'movie', mais doit être amélioré.
            return {
                source: 'TMDB',
                tmdbId: Number(ref.id),
                mediaType: 'movie', // TODO: Passer en paramètre
            };
        } else if (ref.provider === 'google_books') {
            return {
                source: 'GOOGLE_BOOKS',
                googleId: ref.id,
            };
        }

        throw new Error(`Fournisseur inconnu : ${ref.provider}`);
    }

    /**
     * Convertit une ExternalReference avec contexte de type média explicite.
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

        throw new Error(`Fournisseur inconnu : ${ref.provider}`);
    }

    /**
     * Convertit ProviderMetadata (Infra) vers ExternalReference (Domaine).
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
