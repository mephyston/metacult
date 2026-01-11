/**
 * DTO de Lecture (Read Model).
 * Optimisé pour l'affichage et le transfert réseau (sérialisation JSON).
 * Ne contient pas de logique métier, juste des données.
 */
import { z } from 'zod';
import { selectMediaSchema } from '../db/media.schema';

/**
 * DTO de Lecture (Read Model).
 * Optimisé pour l'affichage et le transfert réseau (sérialisation JSON).
 * Ne contient pas de logique métier, juste des données.
 */
export const MediaReadSchema = selectMediaSchema
  .pick({
    id: true,
    slug: true,
    title: true,
  })
  .extend({
    type: z.enum(['game', 'movie', 'tv', 'book']),
    coverUrl: z.string().nullable(),
    rating: z.number().nullable(),
    releaseYear: z.number().nullable(),
    description: z.string().nullable(),
    isImported: z.boolean(),
    eloScore: z.number().optional(),
  });

export type MediaReadDto = z.infer<typeof MediaReadSchema>;
