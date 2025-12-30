import { FeedController } from '../api/http/controllers/feed.controller';

// NOTE: This DI file is deprecated in favor of Composition Root in apps/api.
// It remains here only if local standalone instantiation is needed, 
// but it CANNOT depend on other modules like Catalog due to Modular Monolith boundaries.
export const feedController = {} as FeedController; // Placeholder to satisfy module exports if any

