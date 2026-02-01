import { Elysia, t } from 'elysia';
import { CommerceController } from './http/controllers/commerce.controller';

export const createCommerceRoutes = (controller: CommerceController) => {
  return new Elysia({ prefix: '/commerce' }).get(
    '/offers/:mediaId',
    ({ params }) => {
      return controller.getOffers(params.mediaId);
    },
    {
      params: t.Object({
        mediaId: t.String(),
      }),
    },
  );
};
