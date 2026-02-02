// noinspection JSDeprecatedSymbols
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { z } from 'zod';

// Define Enums manually or import from Domain Entity (if Enums are in Domain)
// Step 798 showed InteractionAction/Sentiment in domain/entities/user-interaction.entity.ts
// I should import Enums from Domain if possible, or redefine literals if they form the contract.
// API DTOs usually form the Contract. Use Enums/Literals.

export const SaveInteractionSchema = z.object({
  // @ts-ignore
  mediaId: z.string().uuid(),
  action: z.enum(['LIKE', 'DISLIKE', 'WISHLIST', 'SKIP']),
  sentiment: z.enum(['BANGER', 'GOOD', 'OKAY']).optional().nullable(),
});

export const InteractionResponseSchema = z.object({
  // @ts-ignore
  id: z.string().uuid(),
  // @ts-ignore
  userId: z.string().uuid(),
  // @ts-ignore
  mediaId: z.string().uuid(),
  action: z.enum(['LIKE', 'DISLIKE', 'WISHLIST', 'SKIP']),
  sentiment: z.enum(['BANGER', 'GOOD', 'OKAY']).optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SaveInteractionDto = z.infer<typeof SaveInteractionSchema>;
export type InteractionResponseDto = z.infer<typeof InteractionResponseSchema>;

export type FollowUserDto = { targetUserId: string };
export const FollowUserSchema = z.object({
  // @ts-ignore
  targetUserId: z.string().uuid(),
});
