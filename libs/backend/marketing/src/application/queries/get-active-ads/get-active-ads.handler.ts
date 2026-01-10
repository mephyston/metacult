import type { AdsGateway } from '../../ports/ads.gateway.interface';
import type { GetActiveAdsQuery } from './get-active-ads.query';
import type { Ad } from '../../../domain/ad.entity';

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
   * @param {GetActiveAdsQuery} query - DTO vide.
   * @returns {Promise<Ad[]>} Liste de pubs.
   */
  async execute(): Promise<Ad[]> {
    return this.adsGateway.getActiveAds();
  }
}
