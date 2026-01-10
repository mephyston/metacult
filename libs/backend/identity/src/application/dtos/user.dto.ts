import { z } from 'zod';
import { selectUserSchema } from '../../infrastructure/db/auth.schema';

export const UserPublicProfileSchema = selectUserSchema.pick({
  id: true,
  name: true,
  image: true,
});

export type UserPublicProfileDto = z.infer<typeof UserPublicProfileSchema>;
