import { fetchWithRetry } from '@metacult/shared-core';
import type { OffersProvider } from '../../domain/gateway/OffersProvider';
import { Offer, type OfferType } from '../../domain/Offer';

interface TmdbProviderItem {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

interface TmdbProvidersResponse {
  id: number;
  results: {
    [countryCode: string]: {
      link: string;
      flatrate?: TmdbProviderItem[];
      rent?: TmdbProviderItem[];
      buy?: TmdbProviderItem[];
    };
  };
}

export class TmdbOffersProvider implements OffersProvider {
  private readonly apiUrl = 'https://api.themoviedb.org/3';
  private readonly defaultRegion = 'FR';

  constructor(private readonly apiKey: string) {}

  async getOffers(
    tmdbId: string,
    type: 'movie' | 'tv',
    internalMediaId: string,
  ): Promise<Offer[]> {
    if (!this.apiKey) {
      console.warn('[TmdbOffersProvider] No API key provided');
      return [];
    }

    try {
      const endpoint =
        type === 'movie'
          ? `movie/${tmdbId}/watch/providers`
          : `tv/${tmdbId}/watch/providers`;
      const url = `${this.apiUrl}/${endpoint}?api_key=${this.apiKey}`;

      const response = await fetchWithRetry(url, { timeoutMs: 5000 });

      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = (await response.json()) as TmdbProvidersResponse;
      const frData = data.results[this.defaultRegion];

      if (!frData) {
        return [];
      }

      const offers: Offer[] = [];
      const link = frData.link;

      // Helper to map and push offers
      const addOffers = (
        items: TmdbProviderItem[] | undefined,
        offerType: OfferType,
      ) => {
        if (!items) return;
        items.forEach((item) => {
          offers.push(
            Offer.create({
              id: `${internalMediaId}-${item.provider_id}-${offerType}`, // Synthetic ID
              mediaId: internalMediaId,
              provider: item.provider_name,
              category: type === 'movie' ? 'movie' : 'show',
              type: offerType,
              price: null, // TMDB doesn't provide price
              currency: 'EUR',
              url: link, // TMDB provides a generic link to the providers page
              isAffiliated: false,
              lastUpdated: new Date(),
            }),
          );
        });
      };

      addOffers(frData.flatrate, 'subscription');
      addOffers(frData.rent, 'rent');
      addOffers(frData.buy, 'purchase');

      // Deduplicate if necessary? Usually different types are distinct offers.
      // Same provider could be in flatrate and rent (e.g. Amazon Prime vs Amazon Video rent).

      return offers;
    } catch (error) {
      console.error('[TmdbOffersProvider] Error fetching offers', error);
      return [];
    }
  }
}
