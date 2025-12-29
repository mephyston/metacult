import { FeedController } from '../api/http/controllers/feed.controller';
import { GetMixedFeedHandler } from '../application/queries/get-mixed-feed/get-mixed-feed.handler';
import { SearchMediaHandler } from '@metacult/backend/catalog';
import { DrizzleMediaRepository } from '@metacult/backend/catalog';
import { GetActiveAdsHandler } from '@metacult/backend/marketing';
import { getDbConnection, redisClient } from '@metacult/backend/infrastructure';

// 1. Infrastructure
const { db } = getDbConnection();

// Dependencies from other modules
// We instantiate them locally as per "Modular Monolith" ensuring loose coupling on instances, 
// sharing only the "Shared Kernel" (db, redis).
const mediaRepository = new DrizzleMediaRepository(db as any);
const searchMediaHandler = new SearchMediaHandler(mediaRepository);

// Marketing Logic
const adsHandler = new GetActiveAdsHandler(redisClient);

// 2. Application
const getMixedFeedHandler = new GetMixedFeedHandler(
    redisClient,
    searchMediaHandler,
    adsHandler
);

// 3. Controller
export const feedController = new FeedController(getMixedFeedHandler);
