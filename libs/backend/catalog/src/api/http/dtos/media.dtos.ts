import { t, type Static } from 'elysia';

/**
 * Enumération TypeBox pour le type de média.
 */
export const MediaTypeEnum = t.Union([
    t.Literal('game'),
    t.Literal('movie'),
    t.Literal('tv'),
    t.Literal('book'),
]);

/**
 * Schéma de validation pour la recherche de médias.
 * Utilise TypeBox pour la compatibilité avec Elysia.
 */
export const SearchMediaSchema = t.Object({
    query: t.Object({
        q: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
        type: t.Optional(MediaTypeEnum),
        tag: t.Optional(t.String({ pattern: '^[a-z0-9-]+$' })),
    }),
});

/**
 * Schéma de validation pour l'import de médias.
 */
export const ImportMediaSchema = t.Object({
    body: t.Object({
        mediaId: t.String({ minLength: 1 }),
        type: MediaTypeEnum,
    }),
});

/** DTO pour les critères de recherche validés. */
export type SearchMediaDto = Static<typeof SearchMediaSchema>;

/** DTO pour le body de la requête d'import. */
export type ImportMediaDto = Static<typeof ImportMediaSchema>;
