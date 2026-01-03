/**
 * DTO de Lecture (Read Model).
 * Optimisé pour l'affichage et le transfert réseau (sérialisation JSON).
 * Ne contient pas de logique métier, juste des données.
 */
export interface MediaReadDto {
  id: string;
  slug: string; // Added slug
  title: string;
  type: 'game' | 'movie' | 'tv' | 'book';
  coverUrl: string | null;
  rating: number | null;
  releaseYear: number | null;
  description: string | null;
  isImported: boolean;
  eloScore?: number; // Added for trends ranking
}
