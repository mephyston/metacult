// ===== DOMAIN (Public API) =====
export * from './domain/ad.entity';

// ===== APPLICATION (Public API) =====
export * from './application/ports/ads.gateway.interface';
export * from './application/queries/get-active-ads/get-active-ads.query';
export * from './application/queries/get-active-ads/get-active-ads.handler';

// ===== INFRASTRUCTURE (Configuration & Initialization) =====
export * from './infrastructure/adapters/redis-ads.adapter';

// ===== API (Presentation Layer) =====
// No controllers exported for marketing yet
