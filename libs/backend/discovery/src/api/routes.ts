import { Elysia, type Context } from 'elysia';
import { feedController } from '../infrastructure/di';

export const discoveryRoutes = new Elysia({ prefix: '/discovery' })
    .get('/feed', (context: Context) => feedController.getFeed(context));
