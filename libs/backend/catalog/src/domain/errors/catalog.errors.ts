/**
 * Domain Exceptions for Catalog Module
 * These exceptions represent business rule violations and domain-specific errors.
 */

/**
 * Thrown when attempting to import a media that already exists in the catalog.
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
 * Thrown when a media cannot be found in the external provider.
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
 * Thrown when an external provider is unavailable or returns an error.
 */
export class ProviderUnavailableError extends Error {
    constructor(
        public readonly provider: string,
        public readonly cause?: Error
    ) {
        super(`Provider ${provider} is unavailable`);
        this.name = 'ProviderUnavailableError';
        if (cause) {
            this.cause = cause;
        }
    }
}

/**
 * Thrown when data from a provider fails validation.
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
 * Thrown when attempting an operation on an unsupported media type.
 */
export class UnsupportedMediaTypeError extends Error {
    constructor(
        public readonly mediaType: string
    ) {
        super(`Unsupported media type: ${mediaType}`);
        this.name = 'UnsupportedMediaTypeError';
    }
}
