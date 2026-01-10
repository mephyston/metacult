import { Type, type Static } from '@sinclair/typebox';

export const ContentTypeSchema = Type.Union([
  Type.Literal('movie'),
  Type.Literal('tv'),
  Type.Literal('game'),
  Type.Literal('book'),
]);

export type ContentType = Static<typeof ContentTypeSchema>;

export const MediaItemSchema = Type.Object({
  id: Type.String(),
  remoteId: Type.String(),
  type: ContentTypeSchema,
  title: Type.String(),
  posterUrl: Type.Optional(Type.String()),
  rating: Type.Number(),
  releaseDate: Type.Optional(Type.String()),
});

export type MediaItem = Static<typeof MediaItemSchema>;
