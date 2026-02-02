import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleMediaRepository, mediaSchema } from '@metacult/backend-catalog';
import { CommerceController } from '../../api/http/controllers/commerce.controller';
import { GetOffersHandler } from '../../application/queries/GetOffersHandler';
import { TmdbOffersProvider } from '../../infrastructure/tmdb/TmdbOffersProvider';
import { CheapSharkProvider } from '../../infrastructure/cheapshark/CheapSharkProvider';
import { AffiliateLinkService } from '../../domain/service/AffiliateLinkService';
import { CatalogMediaDetailsProvider } from '../../infrastructure/catalog/CatalogMediaDetailsProvider';

export interface CommerceModuleConfig {
  tmdb: { apiKey: string };
  affiliate: { instantGamingRef?: string; amazonTag?: string };
}

export class CommerceModuleFactory {
  static createController(
    db: NodePgDatabase<typeof mediaSchema>,
    config: CommerceModuleConfig,
  ): CommerceController {
    const mediaRepository = new DrizzleMediaRepository(db);
    const mediaDetailsProvider = new CatalogMediaDetailsProvider(
      mediaRepository,
    );

    const offersProvider = new TmdbOffersProvider(config.tmdb.apiKey);
    const cheapSharkProvider = new CheapSharkProvider();
    const affiliateService = new AffiliateLinkService(
      config.affiliate.instantGamingRef,
      config.affiliate.amazonTag,
    );

    const getOffersHandler = new GetOffersHandler(
      offersProvider,
      cheapSharkProvider,
      affiliateService,
      mediaDetailsProvider,
    );

    return new CommerceController(getOffersHandler);
  }
}
