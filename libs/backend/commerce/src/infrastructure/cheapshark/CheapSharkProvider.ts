import { fetchWithRetry } from '@metacult/shared-core';
import { Offer } from '../../domain/Offer';
import type { GameOffersProvider } from '../../domain/gateway/GameOffersProvider';

interface CheapSharkGame {
  gameID: string;
  steamAppID: string;
  cheapest: string;
  cheapestDealID: string;
  external: string;
  thumb: string;
}

export class CheapSharkProvider {
  private readonly apiUrl = 'https://www.cheapshark.com/api/1.0';

  async getBestDeal(
    title: string,
    internalMediaId: string,
  ): Promise<Offer | null> {
    try {
      const url = `${this.apiUrl}/games?title=${encodeURIComponent(title)}&limit=1`;
      const response = await fetchWithRetry(url, { timeoutMs: 5000 });

      if (!response.ok) {
        return null;
      }

      const games = (await response.json()) as CheapSharkGame[];
      if (!games || games.length === 0) {
        return null;
      }

      const bestDeal = games[0];
      if (!bestDeal) return null;
      const price = parseFloat(bestDeal.cheapest);
      const dealUrl = `https://www.cheapshark.com/redirect?dealID=${bestDeal.cheapestDealID}`;

      return Offer.create({
        id: `${internalMediaId}-cheapshark`,
        mediaId: internalMediaId,
        provider: 'CheapShark (Best Deal)',
        category: 'game',
        type: 'purchase', // Assuming best deal is a purchase/key
        price: isNaN(price) ? null : price,
        currency: 'USD', // CheapShark is mainly USD
        url: dealUrl,
        isAffiliated: true, // CheapShark redirection is often affiliated implicitly or we treat it as commercial
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error('[CheapSharkProvider] Error fetching deal', error);
      return null;
    }
  }
}
