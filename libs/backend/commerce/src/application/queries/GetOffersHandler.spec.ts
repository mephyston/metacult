import { describe, it, expect, vi } from 'vitest';
import { GetOffersHandler } from './GetOffersHandler';
import type { OffersProvider } from '../../domain/gateway/OffersProvider';
import { Offer } from '../../domain/Offer';
import { CheapSharkProvider } from '../../infrastructure/cheapshark/CheapSharkProvider';
import { AffiliateLinkService } from '../../domain/service/AffiliateLinkService';

class MockOffersProvider implements OffersProvider {
  async getOffers(
    tmdbId: string,
    type: 'movie' | 'tv',
    internalMediaId: string,
  ): Promise<Offer[]> {
    if (tmdbId === '550') {
      return [
        Offer.create({
          id: 'test-offer',
          mediaId: internalMediaId,
          provider: 'Netflix',
          category: 'movie',
          type: 'subscription',
          price: null,
          currency: 'EUR',
          url: 'http://netflix.com',
          isAffiliated: false,
          lastUpdated: new Date(),
        }),
        Offer.create({
          id: 'test-offer-amazon',
          mediaId: internalMediaId,
          provider: 'Amazon',
          category: 'movie',
          type: 'purchase', // changed to purchase for variety
          price: 10,
          currency: 'USD',
          url: 'http://amazon.com/product',
          isAffiliated: false,
          lastUpdated: new Date(),
        }),
      ];
    }
    return [];
  }
}

// Mock CheapShark provider
const mockCheapSharkProvider = {
  getBestDeal: vi.fn(),
} as unknown as CheapSharkProvider;

// Mock Affiliate Service
const mockAffiliateService = new AffiliateLinkService(
  'my-ig-ref',
  'my-amazon-tag',
);

describe('GetOffersHandler', () => {
  it('should return empty array for unknown mediaId', async () => {
    const provider = new MockOffersProvider();
    const handler = new GetOffersHandler(
      provider,
      mockCheapSharkProvider,
      mockAffiliateService,
    );
    const result = await handler.execute('unknown-id');
    expect(result).toEqual([]);
  });

  it('should return mocked offer for test-media-id (Movie) with amazon tag and isAffiliated true', async () => {
    const provider = new MockOffersProvider();
    const handler = new GetOffersHandler(
      provider,
      mockCheapSharkProvider,
      mockAffiliateService,
    );
    const result = await handler.execute('test-media-id');
    expect(result).toHaveLength(2);

    const amazonOffer = result.find((o) => o.provider === 'Amazon');
    expect(amazonOffer).toBeDefined();
    expect(amazonOffer?.url).toContain('tag=my-amazon-tag');
    expect(amazonOffer?.isAffiliated).toBe(true);

    const netflixOffer = result.find((o) => o.provider === 'Netflix');
    expect(netflixOffer?.isAffiliated).toBe(false);
  });

  it('should return offers for test-game-id (Game) including IG link and CheapShark', async () => {
    const provider = new MockOffersProvider();

    // Setup CheapShark mock
    vi.spyOn(mockCheapSharkProvider, 'getBestDeal').mockResolvedValue(
      Offer.create({
        id: 'cs-offer',
        mediaId: 'test-game-id',
        provider: 'CheapShark (Best Deal)',
        category: 'game',
        type: 'purchase',
        price: 45.0,
        currency: 'USD',
        url: 'http://cheapshark.com/redirect',
        isAffiliated: true,
        lastUpdated: new Date(),
      }),
    );

    const handler = new GetOffersHandler(
      provider,
      mockCheapSharkProvider,
      mockAffiliateService,
    );
    const result = await handler.execute('test-game-id');

    expect(result).toHaveLength(2); // CheapShark + IG

    const csOffer = result.find((o) => o.provider.includes('CheapShark'));
    expect(csOffer).toBeDefined();
    expect(csOffer?.price).toBe(45);

    const igOffer = result.find((o) => o.provider === 'Instant Gaming');
    expect(igOffer).toBeDefined();
    expect(igOffer?.url).toContain('igr=my-ig-ref');
    expect(igOffer?.url).toContain('Elden%20Ring');

    expect(mockCheapSharkProvider.getBestDeal).toHaveBeenCalledWith(
      'Elden Ring',
      'test-game-id',
    );
  });

  it('should return Amazon affiliate link for test-book-id (Book)', async () => {
    const provider = new MockOffersProvider();
    const handler = new GetOffersHandler(
      provider,
      mockCheapSharkProvider,
      mockAffiliateService,
    );
    const result = await handler.execute('test-book-id');

    expect(result).toHaveLength(1);

    const amazonBookOffer = result[0];
    if (!amazonBookOffer) throw new Error('Offer not found');
    expect(amazonBookOffer.provider).toBe('Amazon');
    expect(amazonBookOffer.category).toBe('book');
    expect(amazonBookOffer.url).toContain('tag=my-amazon-tag');
    expect(amazonBookOffer.url).toContain('The%20Lord%20of%20the%20Rings');
    expect(amazonBookOffer.url).toContain('i=stripbooks');
    expect(amazonBookOffer.isAffiliated).toBe(true);
  });
});
