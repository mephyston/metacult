import { z } from 'zod';
import {
  insertInteractionSchema,
  selectInteractionSchema,
  selectFollowSchema,
} from '../../infrastructure/db/interactions.schema';

export const SaveInteractionSchema = insertInteractionSchema.pick({
  mediaId: true,
  action: true,
  sentiment: true,
});

export const InteractionResponseSchema = selectInteractionSchema;

export type SaveInteractionDto = z.infer<typeof SaveInteractionSchema>;
export type InteractionResponseDto = z.infer<typeof InteractionResponseSchema>;

export type FollowUserDto = { targetUserId: string }; // Simple DTO, or define Zod if creating Body schema
export const FollowUserSchema = z.object({
  targetUserId: z.string().uuid(),
});
