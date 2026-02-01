import type { AdsGateway } from '../../ports/ads.gateway.interface';
import type { Ad } from '../../../domain/ad.entity';

import { Result, AppError, InfrastructureError } from '@metacult/shared-core';

/**
 * Cas d'Utilisation : Récupérer les campagnes pubs actives.
 * Délègue la récupération au Gateway (Port).
 *
 * @class GetActiveAdsHandler
 */
export class GetActiveAdsHandler {
  constructor(private readonly adsGateway: AdsGateway) {}

  /**
   * Récupère les pubs.
   * Stratégie déléguée au Gateway : Cache-First, puis fetch externe si miss.
   *
   * @returns {Promise<Result<Ad[], AppError>>} Liste de pubs encapsulée dans Result.
   */
  async execute(): Promise<Result<Ad[], AppError>> {
    try {
      const ads = await this.adsGateway.getActiveAds();
      return Result.ok(ads);
    } catch (error) {
      return Result.fail(
        error instanceof AppError
          ? error
          : new InfrastructureError(
              error instanceof Error ? error.message : 'Unknown error',
            ),
      );
    }
  }
}
