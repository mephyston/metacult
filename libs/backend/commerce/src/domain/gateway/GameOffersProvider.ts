import { Offer } from '../../domain/Offer';

export interface GameOffersProvider {
  getBestDeal(title: string, mediaId: string): Promise<Offer | null>;
}
