import { NotFoundError } from '@metacult/shared-core';

/**
 * Thrown when media(s) are not found during ranking operations.
 * HTTP 404 Not Found
 */
export class MediaNotFoundError extends NotFoundError {
  constructor(ids: string[]) {
    super(`Media(s) not found for IDs: ${ids.join(', ')}`, { ids });
  }
}
