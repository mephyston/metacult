import type { Ad } from '../../domain/ad.entity';

/**
 * Port for retrieving active advertisements.
 * Abstracts the cache/external provider details from the application layer.
 */
export interface AdsGateway {
  /**
   * Retrieves active ads, using cache-first strategy.
   * @returns Promise resolving to array of active ads.
   */
  getActiveAds(): Promise<Ad[]>;
}
