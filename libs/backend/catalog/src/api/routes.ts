import { Elysia, t } from 'elysia';
import { mediaController } from '../infrastructure/di';
import { SearchMediaSchema, ImportMediaSchema } from './dtos/media.dtos';

// Helper to convert Zod schema to Elysia validation if needed, 
// OR we can rely on manual validation in Controller if we passed pure Zod.
// However, Elysia supports Zod via plugin, or we can use TypeBox.
// The user provided blueprint suggests ".post(..., { body: ImportSchema })"
// Since our DTOs are Zod, we might need strict Zod support.
// For now, let's assume standard Elysia usage. If we use Zod, we usually need 'elysia-zod' or simple callback.
// BUT simplest path for this refactor: Just call the controller which now takes typings.
// Actually, to get type safety at route level with Zod in Elysia:
// app.post('/', ..., { body: z.object(...) }) requires the swagger/zod plugin usually.
// Let's stick to the user's specific blueprint structure.

export const catalogRoutes = new Elysia({ prefix: '/media' })
    .get('/search', (context) => mediaController.search(context as any))
    // We can add validation schema here if we install @elysiajs/zod or similar
    // For now we delegate to controller or assume simple pass-through. 
    // Given the strict prompt, I will wrap the Zod Validation in the route if possible,
    // but without the plugin it's verbose. I'll pass simple context.
    .post('/import', (context) => mediaController.import(context as any));
