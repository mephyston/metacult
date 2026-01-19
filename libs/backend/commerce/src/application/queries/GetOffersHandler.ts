import { Offer } from '../../domain/Offer';
import { OffersProvider } from '../../domain/gateway/OffersProvider';
import { CheapSharkProvider } from '../../infrastructure/cheapshark/CheapSharkProvider';
import { AffiliateLinkService } from '../../domain/service/AffiliateLinkService';

export class GetOffersHandler {
  constructor(
    private readonly offersProvider: OffersProvider, // TMDB for standard streaming
    private readonly cheapSharkProvider: CheapSharkProvider,
    private readonly affiliateLinkService: AffiliateLinkService,
  ) {}

  async execute(mediaId: string): Promise<Offer[]> {
    const offers: Offer[] = [];

    // --- MOCK RESOLUTION LOGIC (Catalog Integration placeholder) ---
    // In a real app: const media = await catalog.getMedia(mediaId);
    let tmdbId: string | null = null;
    let type: 'movie' | 'tv' = 'movie'; // Default
    let isGame = false;
    let title = '';

    if (mediaId === 'test-media-id') {
      tmdbId = '550'; // Fight Club
      type = 'movie';
      title = 'Fight Club';
    } else if (mediaId === 'test-game-id') {
      isGame = true;
      title = 'Elden Ring';
    } else if (mediaId === 'test-book-id') {
      title = 'The Lord of the Rings';
    }
    // -------------------------------------------------------------

    // 1. TMDB Offers (Movies/TV)
    // If we have a TMDB ID, we assume it's a Movie or TV Show
    if (tmdbId) {
      const tmdbOffers = await this.offersProvider.getOffers(
        tmdbId,
        type,
        mediaId,
      );
      // Process affiliate links
      const affiliatedOffers = tmdbOffers.map((o) => {
        const affiliatedUrl = this.affiliateLinkService.affiliateUrl(
          o.url,
          o.provider,
        );
        const isAffiliated = o.isAffiliated || affiliatedUrl !== o.url;

        return Offer.create({
          id: o.id,
          mediaId: o.mediaId,
          provider: o.provider,
          category: o.category,
          type: o.type,
          price: o.price,
          currency: o.currency,
          url: affiliatedUrl,
          isAffiliated,
          lastUpdated: o.lastUpdated,
        });
      });
      offers.push(...affiliatedOffers);
    }

    // 2. Game Offers
    if (isGame && title) {
      // A. CheapShark Best Deal
      const cheapSharkOffer = await this.cheapSharkProvider.getBestDeal(
        title,
        mediaId,
      );
      if (cheapSharkOffer) {
        offers.push(cheapSharkOffer);
      }

      // B. Instant Gaming Affiliate Link (Always)
      const igUrl = this.affiliateLinkService.generateInstantGamingLink(title);
      offers.push(
        Offer.create({
          id: `${mediaId}-instant-gaming`,
          mediaId,
          provider: 'Instant Gaming',
          category: 'game',
          type: 'purchase',
          price: null, // Unknown, search link
          currency: 'EUR',
          url: igUrl,
          isAffiliated: true,
          lastUpdated: new Date(),
        }),
      );
    }

    // 3. Book Offers (Assume if no TMDB ID and not Game, it might be a book?
    // For now relying on mocked mediaId resolution or explicitly falling through if "isBook" was known.
    // Since we don't have isBook flag yet in mock, let's use the mediaId directly in the else if above to add isBook flag)
    if (mediaId === 'test-book-id' && title) {
      const amazonBookUrl =
        this.affiliateLinkService.generateAmazonBookLink(title);
      offers.push(
        Offer.create({
          id: `${mediaId}-amazon-book`,
          mediaId,
          provider: 'Amazon',
          category: 'book',
          type: 'purchase',
          price: null,
          currency: 'EUR',
          url: amazonBookUrl,
          isAffiliated: true,
          lastUpdated: new Date(),
        }),
      );
    }

    return offers;
  }
}
