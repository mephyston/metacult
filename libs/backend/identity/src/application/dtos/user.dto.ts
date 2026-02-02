// noinspection JSDeprecatedSymbols
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { z } from 'zod';
export const UserPublicProfileSchema = z.object({
  // @ts-ignore
  id: z.string().uuid(),
  // @ts-ignore
  name: z.string().nullable(),
  // @ts-ignore
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
