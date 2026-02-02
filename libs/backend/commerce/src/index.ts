// ===== DOMAIN (Public API) =====
export * from './domain/Offer';
export * from './domain/service/AffiliateLinkService';

// ===== APPLICATION (Public API) =====
export * from './domain/gateway/OffersProvider';
export * from './application/queries/GetOffersHandler';

// ===== INFRASTRUCTURE (Configuration & Initialization) =====
export * from './infrastructure/db/offers.schema';
export * from './infrastructure/tmdb/TmdbOffersProvider';
export * from './infrastructure/factories/commerce.factory';
export type { CommerceModuleConfig } from './infrastructure/factories/commerce.factory';

// ===== API (Presentation Layer) =====
export * from './api/routes';
export * from './api/http/controllers/commerce.controller';
