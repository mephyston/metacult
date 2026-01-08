import { Type, type Static } from '@sinclair/typebox';

export const UserProfileSchema = Type.Object({
  id: Type.String(),
  username: Type.String(),
  email: Type.String({ format: 'email' }),
  avatarUrl: Type.Optional(Type.String()),
  createdAt: Type.String(),
  level: Type.Optional(Type.Number()),
  xp: Type.Optional(Type.Number()),
  nextLevelXp: Type.Optional(Type.Number()),
});

export type UserProfile = Static<typeof UserProfileSchema>;

export const AuthStateSchema = Type.Object({
  isAuthenticated: Type.Boolean(),
  user: Type.Optional(UserProfileSchema),
});

export type AuthState = Static<typeof AuthStateSchema>;
