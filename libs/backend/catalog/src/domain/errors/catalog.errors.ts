/**
 * Exceptions du Domaine pour le module Catalogue.
 * Représentent des violations de règles métier ou erreurs spécifiques au domaine.
 */

/**
 * Le média existe déjà dans le catalogue.
 */
export class MediaAlreadyExistsError extends Error {
    constructor(
        public readonly provider: string,
        public readonly externalId: string,
        public readonly internalId: string
    ) {
        super(`Media already exists: ${provider}/${externalId} (internal ID: ${internalId})`);
        this.name = 'MediaAlreadyExistsError';
    }
}

/**
 * Média introuvable chez le fournisseur externe.
 */
export class MediaNotFoundInProviderError extends Error {
    constructor(
        public readonly provider: string,
        public readonly externalId: string
    ) {
        super(`Media not found in ${provider}: ${externalId}`);
        this.name = 'MediaNotFoundInProviderError';
    }
}

/**
 * Le fournisseur externe est indisponible ou a retourné une erreur.
 */
export class ProviderUnavailableError extends Error {
    constructor(
        public readonly provider: string,
        public override readonly cause?: Error
    ) {
        super(`Provider ${provider} is unavailable`);
        this.name = 'ProviderUnavailableError';
        if (cause) {
            this.cause = cause;
        }
    }
}

/**
 * Les données retournées par le fournisseur sont invalides.
 */
export class InvalidProviderDataError extends Error {
    constructor(
        public readonly provider: string,
        public readonly reason: string
    ) {
        super(`Invalid data from ${provider}: ${reason}`);
        this.name = 'InvalidProviderDataError';
    }
}

/**
 * Type de média non supporté.
 */
export class UnsupportedMediaTypeError extends Error {
    constructor(
        public readonly mediaType: string
    ) {
        super(`Unsupported media type: ${mediaType}`);
        this.name = 'UnsupportedMediaTypeError';
    }
}
