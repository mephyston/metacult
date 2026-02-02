// ===== DOMAIN (Public API) =====
export * from './domain/entities/user-interaction.entity';
export * from './domain/events/interaction-saved.event';

// ===== APPLICATION (Public API) =====
export * from './application/ports/interaction.repository.interface';
export * from './application/commands/save-interaction.command';
export * from './application/commands/sync-interactions.command';
export * from './application/commands/social-graph.command';

// ===== INFRASTRUCTURE (Configuration & Initialization) =====
export * from './infrastructure/db/interactions.schema';
export * from './infrastructure/repositories/drizzle-interaction.repository';

// ===== API (Presentation Layer) =====
export * from './api/http/controllers/interaction.controller';
export * from './api/http/controllers/social.controller';
