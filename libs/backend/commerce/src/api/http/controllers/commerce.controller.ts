import { GetOffersHandler } from '../../../application/queries/GetOffersHandler';

export class CommerceController {
  constructor(private readonly getOffersHandler: GetOffersHandler) {}

  async getOffers(mediaId: string) {
    const offers = await this.getOffersHandler.execute(mediaId);
    return offers.map((offer) => offer.toPrimitives());
  }
}
