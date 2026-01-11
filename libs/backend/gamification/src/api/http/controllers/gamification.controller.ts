import { Elysia } from 'elysia';
import {
  isAuthenticated,
  resolveUserOrThrow,
} from '@metacult/backend-identity';
import { GamificationService } from '../../../application/services/gamification.service';

const gamificationService = new GamificationService();

export const GamificationController = new Elysia({ prefix: '/gamification' })
  .use(isAuthenticated)
  .get('/me', async (context) => {
    // Resolve user directly using the helper which now works with the middleware context
    const user = await resolveUserOrThrow(context);
    const stats = await gamificationService.getUserStats(user.id);
    return stats;
  });
