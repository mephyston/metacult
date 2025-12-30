import type { IMediaRepository } from '../../application/ports/media.repository.interface';
import { MediaAlreadyExistsError } from '../errors/catalog.errors';

/**
 * Service de Domaine (Domain Service).
 * Encapsule les règles métier qui ne peuvent pas appartenir naturellement à une Entité seule.
 * Ici: La politique d'unicité (on ne peut pas importer un média s'il existe déjà).
 */
export class MediaImportPolicy {
    constructor(private readonly repository: IMediaRepository) { }

    /**
     * Vérifie si un import est autorisé selon les règles métier.
     * 
     * Règle Métier : Un média ne doit pas être importé s'il existe déjà
     * pour le même provider avec le même ID externe.
     * 
     * @throws MediaAlreadyExistsError si le média existe déjà
     */
    async validateImport(provider: string, externalId: string): Promise<void> {
        const existing = await this.repository.findByProviderId(provider, externalId);

        if (existing) {
            throw new MediaAlreadyExistsError(provider, externalId, existing.id);
        }
    }

    /**
     * Vérifie l'existence sans lever d'exception.
     * Utile pour des logiques conditionnelles.
     */
    async mediaExists(provider: string, externalId: string): Promise<boolean> {
        const existing = await this.repository.findByProviderId(provider, externalId);
        return existing !== null;
    }
}
