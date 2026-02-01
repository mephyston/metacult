import { Elysia } from 'elysia';
import {
  isAuthenticated,
  resolveUserOrThrow,
} from '@metacult/backend-identity';
import { GamificationService } from '../../../application/services/gamification.service';

import { getDbConnection } from '@metacult/backend-infrastructure';
import { DrizzleGamificationRepository } from '../../../infrastructure/repositories/drizzle-gamification.repository';
import * as schema from '../../../infrastructure/db/gamification.schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

// const gamificationService = new GamificationService(); // Removed global

export const GamificationController = new Elysia({ prefix: '/gamification' })
  .use(isAuthenticated)
  .get('/me', async (context) => {
    // Resolve user directly using the helper which now works with the middleware context
    const user = await resolveUserOrThrow(context);

    // Dependency Injection
    const { db } = getDbConnection();
    const repo = new DrizzleGamificationRepository(
      db as unknown as NodePgDatabase<typeof schema>,
    );
    const service = new GamificationService(repo);

    const stats = await service.getUserStats(user.id);
    return stats;
  });
