import { z } from 'zod';
import { selectUserSchema } from '../../infrastructure/db/auth.schema';

export const UserPublicProfileSchema = selectUserSchema.pick({
  id: true,
  name: true,
  image: true,
});

export type UserPublicProfileDto = z.infer<typeof UserPublicProfileSchema>;

export const UserUpdateSchema = z.object({
  onboardingCompleted: z.boolean().optional(),
  preferences: z
    .object({
      categories: z.array(z.string()).optional(),
      genres: z.array(z.string()).optional(),
    })
    .optional(),
});

export type UserUpdateDto = z.infer<typeof UserUpdateSchema>;
