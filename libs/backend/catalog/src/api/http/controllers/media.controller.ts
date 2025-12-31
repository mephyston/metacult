import { SearchMediaHandler } from '../../../application/queries/search-media/search-media.handler';
import { ImportMediaHandler } from '../../../application/commands/import-media/import-media.handler';
import { GetRecentMediaHandler } from '../../../application/queries/get-recent-media/get-recent-media.handler';
import type { SearchMediaDto, ImportMediaDto } from '../dtos/media.dtos';
import { MediaType } from '../../../domain/entities/media.entity';

/**
 * Contrôleur HTTP pour le Catalogue.
 * Orchestre les requêtes entrantes vers les Handlers (CQRS).
 * Découplé du framework HTTP (Elysia) autant que possible.
 */
export class MediaController {
    constructor(
        private readonly searchHandler: SearchMediaHandler,
        private readonly importHandler: ImportMediaHandler,
        private readonly recentMediaHandler: GetRecentMediaHandler
    ) { }

    /**
     * Recherche de médias (Jeux, Films, etc.).
     * @param {SearchMediaDto['query']} query 
     */
    async search(query: SearchMediaDto['query']) {
        const { q, type, tag } = query;
        const mediaType = type as MediaType | undefined;

        const medias = await this.searchHandler.execute({
            search: q,
            type: mediaType,
            tag
        });

        return medias;
    }

    /**
     * Import manuel d'un média.
     * @param {ImportMediaDto['body']} body 
     */
    async import(body: ImportMediaDto['body']) {
        const { mediaId, type } = body;
        console.log(`[MediaController] Received import request for ${type}/${mediaId}`);

        await this.importHandler.execute({
            mediaId,
            type: type as MediaType
        });

        return { success: true, message: `Imported ${type}: ${mediaId}` };
    }

    /**
     * Récupère les médias récemment ajoutés.
     */
    async getRecent() {
        return this.recentMediaHandler.execute({ limit: 10 });
    }
}
