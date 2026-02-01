// ===== DOMAIN (Public API) =====
export * from './application/services/gamification.service';
export * from './domain/ports/gamification.repository.interface';

// ===== APPLICATION (Public API) =====
export * from './application/listeners/grant-xp-on-interaction.listener';

// ===== INFRASTRUCTURE (Configuration & Initialization) =====
export * from './infrastructure/db/gamification.schema';
export * from './infrastructure/repositories/drizzle-gamification.repository';

// ===== API (Presentation Layer) =====
export * from './api/http/controllers/gamification.controller';
