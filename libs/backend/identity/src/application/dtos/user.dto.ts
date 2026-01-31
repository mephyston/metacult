import { z } from 'zod';
export const UserPublicProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
  image: z.string().nullable(),
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
