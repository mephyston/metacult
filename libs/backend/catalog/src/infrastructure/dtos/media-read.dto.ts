/**
 * DTO de Lecture (Read Model).
 * Optimisé pour l'affichage et le transfert réseau (sérialisation JSON).
 * Ne contient pas de logique métier, juste des données.
 */
import { z } from 'zod';
import { selectMediaSchema } from '../db/media.schema';
import type { MediaReadModel } from '../../domain/read-models/media-read.model';

/**
 * DTO de Lecture (Read Model).
 * Optimisé pour l'affichage et le transfert réseau (sérialisation JSON).
 * Ne contient pas de logique métier, juste des données.
 */
export type MediaReadDto = MediaReadModel;
