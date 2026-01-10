import {
  AppError,
  NotFoundError,
  DomainError,
  InfrastructureError,
} from '@metacult/shared-core';

/**
 * Exceptions du Domaine pour le module Catalogue.
 * Représentent des violations de règles métier ou erreurs spécifiques au domaine.
 * All errors extend AppError for Result pattern compatibility.
 */

/**
 * Le média existe déjà dans le catalogue.
 * HTTP 409 Conflict
 */
export class MediaAlreadyExistsError extends AppError {
  constructor(
    public readonly provider: string,
    public readonly externalId: string,
    public readonly internalId: string,
  ) {
    super(
      `Media already exists: ${provider}/${externalId} (internal ID: ${internalId})`,
      'MEDIA_ALREADY_EXISTS',
      409,
      { provider, externalId, internalId },
    );
  }
}

/**
 * Média introuvable chez le fournisseur externe.
 * HTTP 404 Not Found
 */
export class MediaNotFoundInProviderError extends NotFoundError {
  constructor(
    public readonly provider: string,
    public readonly externalId: string,
  ) {
    super(`Media not found in ${provider}: ${externalId}`, {
      provider,
      externalId,
    });
  }
}

/**
 * Le fournisseur externe est indisponible ou a retourné une erreur.
 * HTTP 503 Service Unavailable
 */
export class ProviderUnavailableError extends InfrastructureError {
  constructor(
    public readonly provider: string,
    public override readonly cause?: Error,
  ) {
    super(`Provider ${provider} is unavailable`, { provider, cause });
  }
}

/**
 * Les données retournées par le fournisseur sont invalides.
 * HTTP 400 Bad Request
 */
export class InvalidProviderDataError extends DomainError {
  constructor(
    public readonly provider: string,
    public readonly reason: string,
  ) {
    super(`Invalid data from ${provider}: ${reason}`, { provider, reason });
  }
}

/**
 * Type de média non supporté.
 * HTTP 400 Bad Request
 */
export class UnsupportedMediaTypeError extends DomainError {
  constructor(public readonly mediaType: string) {
    super(`Unsupported media type: ${mediaType}`, { mediaType });
  }
}
