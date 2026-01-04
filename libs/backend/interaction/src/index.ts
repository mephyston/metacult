// Domain
export * from './domain/entities/user-interaction.entity';

// Ports
export * from './application/ports/interaction.repository.interface';

// Infrastructure
export * from './infrastructure/db/interactions.schema';
export * from './infrastructure/repositories/drizzle-interaction.repository';


// API
export * from './api/http/controllers/interaction.controller';
