import { Type, type Static, type TObject } from '@sinclair/typebox';

export const UserProfileSchema: TObject = Type.Object({
  id: Type.String(),
  username: Type.String(),
  email: Type.String({ format: 'email' }),
  avatarUrl: Type.Optional(Type.String()),
  createdAt: Type.String(),
  level: Type.Optional(Type.Number()),
  xp: Type.Optional(Type.Number()),
  nextLevelXp: Type.Optional(Type.Number()),
  onboardingCompleted: Type.Boolean({ default: false }),
  preferences: Type.Optional(
    Type.Object({
      categories: Type.Array(Type.String()),
      genres: Type.Array(Type.String()),
    }),
  ),
});

export type UserProfile = Static<typeof UserProfileSchema>;

export const AuthStateSchema: TObject = Type.Object({
  isAuthenticated: Type.Boolean(),
  user: Type.Optional(UserProfileSchema),
});

export type AuthState = Static<typeof AuthStateSchema>;
