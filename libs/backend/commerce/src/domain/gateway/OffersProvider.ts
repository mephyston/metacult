import { Offer } from '../Offer';

export interface OffersProvider {
  /**
   * Fetches offers (streaming providers) for a given media.
   * @param tmdbId - The TMDB ID of the media.
   * @param type - The type of media ('movie' or 'tv').
   * @param internalMediaId - The internal UUID of the media (to hydrate the Offer entity).
   */
  getOffers(
    tmdbId: string,
    type: 'movie' | 'tv',
    internalMediaId: string,
  ): Promise<Offer[]>;
}
