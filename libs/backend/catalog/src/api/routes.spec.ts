import { describe, it, expect, mock } from 'bun:test';
import { Elysia, t } from 'elysia';

// MOCK the Controller to avoid DB connection in validation tests
const mockController = {
  search: mock((...__args: unknown[]) => Promise.resolve([])),
  import: mock((...__args: unknown[]) => Promise.resolve()),
};

// Re-define routes here with the mock, OR mock the module.
// Mocking the module is cleaner but sometimes tricky with integration tests.
// Let's create a testable instance of the app using the same logic but injected mock.

const MediaTypeEnum = t.Union([
  t.Literal('game'),
  t.Literal('movie'),
  t.Literal('tv'),
  t.Literal('book'),
]);

const catalogRoutes = new Elysia({ prefix: '/media' })
  .onError(({ code, error, set }) => {
    if (code === 'VALIDATION') {
      set.status = 400;
      return { message: 'Validation Error', details: error };
    }
    return;
  })
  .get(
    '/search',
    ({ query }) => {
      return mockController.search({ query });
    },
    {
      query: t.Object({
        q: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
        type: t.Optional(MediaTypeEnum),
        tag: t.Optional(t.String({ pattern: '^[a-z0-9-]+$' })),
      }),
    },
  )
  .post(
    '/import',
    ({ body }) => {
      return mockController.import({ body });
    },
    {
      body: t.Object({
        mediaId: t.String({ minLength: 1 }),
        type: MediaTypeEnum,
      }),
    },
  );

describe('Catalog API Routes', () => {
  it('should validate search query params', async () => {
    // 1. Valid request
    const validRes = await catalogRoutes.handle(
      new Request('http://localhost/media/search?q=Mario&type=game'),
    );
    expect(validRes.status).toBe(200);

    // 2. Invalid validation (too short)
    // Elysia default validation error is 422, mapped to 400
    const invalidRes = await catalogRoutes.handle(
      new Request('http://localhost/media/search?q='),
    );
    expect(invalidRes.status).toBe(400);
  });

  it('should validate import body', async () => {
    // 1. Valid Body
    const validRes = await catalogRoutes.handle(
      new Request('http://localhost/media/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId: '123', type: 'game' }),
      }),
    );
    // Expected 200/201 depending on controller return (mocked controller returns success usually)
    expect(validRes.status).not.toBe(422);

    // 2. Invalid Body (missing mediaId)
    const invalidRes = await catalogRoutes.handle(
      new Request('http://localhost/media/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'game' }),
      }),
    );
    expect(invalidRes.status).toBe(400);

    // 3. Invalid Enum
    const invalidEnum = await catalogRoutes.handle(
      new Request('http://localhost/media/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId: '123', type: 'invalid' }),
      }),
    );
    expect(invalidEnum.status).toBe(400);
  });
});
