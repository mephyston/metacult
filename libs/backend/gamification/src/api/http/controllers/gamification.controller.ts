import { Elysia } from 'elysia';
import {
  isAuthenticated,
  resolveUserOrThrow,
} from '@metacult/backend-identity';
import { GamificationService } from '../../../domain/gamification.service';

const gamificationService = new GamificationService();

export const GamificationController = new Elysia({ prefix: '/gamification' })
  .use(isAuthenticated)
  .get('/me', async (context) => {
    const user = await resolveUserOrThrow(context as any);
    const stats = await gamificationService.getUserStats(user.id);
    return stats;
  });
