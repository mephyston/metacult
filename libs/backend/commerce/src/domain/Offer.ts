export type OfferType = 'subscription' | 'purchase' | 'rent';
export type OfferCategory = 'game' | 'movie' | 'show' | 'book';

export interface OfferProps {
  id: string;
  mediaId: string;
  provider: string;
  category: OfferCategory;
  type: OfferType;
  price: number | null;
  currency: string;
  url: string;
  isAffiliated: boolean;
  lastUpdated: Date;
}

export class Offer {
  constructor(private readonly props: OfferProps) {}

  get id(): string {
    return this.props.id;
  }
  get mediaId(): string {
    return this.props.mediaId;
  }
  get provider(): string {
    return this.props.provider;
  }
  get category(): OfferCategory {
    return this.props.category;
  }
  get type(): OfferType {
    return this.props.type;
  }
  get price(): number | null {
    return this.props.price;
  }
  get currency(): string {
    return this.props.currency;
  }
  get url(): string {
    return this.props.url;
  }
  get isAffiliated(): boolean {
    return this.props.isAffiliated;
  }
  get lastUpdated(): Date {
    return this.props.lastUpdated;
  }

  static create(props: OfferProps): Offer {
    return new Offer(props);
  }

  toPrimitives(): OfferProps {
    return { ...this.props };
  }
}
