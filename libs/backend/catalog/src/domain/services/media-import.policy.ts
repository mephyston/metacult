import type { IMediaRepository } from '../../application/ports/media.repository.interface';
import { MediaAlreadyExistsError } from '../errors/catalog.errors';

/**
 * Domain Service that encapsulates business rules for media imports.
 * This service ensures that domain invariants are respected.
 */
export class MediaImportPolicy {
    constructor(private readonly repository: IMediaRepository) {}

    /**
     * Determines if a media can be imported based on business rules.
     * 
     * Business Rule: A media should not be imported if it already exists
     * from the same provider with the same external ID.
     * 
     * @throws MediaAlreadyExistsError if the media already exists
     */
    async validateImport(provider: string, externalId: string): Promise<void> {
        const existing = await this.repository.findByProviderId(provider, externalId);
        
        if (existing) {
            throw new MediaAlreadyExistsError(provider, externalId, existing.id);
        }
    }

    /**
     * Checks if a media already exists without throwing.
     * Useful for conditional logic without exception handling.
     */
    async mediaExists(provider: string, externalId: string): Promise<boolean> {
        const existing = await this.repository.findByProviderId(provider, externalId);
        return existing !== null;
    }
}
