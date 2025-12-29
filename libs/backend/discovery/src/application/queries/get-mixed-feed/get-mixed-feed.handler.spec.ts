import { describe, it, expect, mock } from 'bun:test';
import { GetMixedFeedHandler } from './get-mixed-feed.handler';
import { GetMixedFeedQuery } from './get-mixed-feed.query';

describe('GetMixedFeedHandler', () => {
    it('should return mixed feed from cache if available', async () => {
        const mockRedis = {
            get: mock(() => Promise.resolve(JSON.stringify([{ type: 'MEDIA', data: {} }]))),
            set: mock(() => Promise.resolve('OK')),
        } as any;
        const mockCatalog = {} as any;
        const mockAds = {} as any;

        const handler = new GetMixedFeedHandler(mockRedis, mockCatalog, mockAds);
        const result = await handler.execute(new GetMixedFeedQuery('test'));

        expect(result).toHaveLength(1);
        expect(mockRedis.get).toHaveBeenCalled();
    });

    it('should fetch dependencies and mix feed on cache miss', async () => {
        const mockRedis = {
            get: mock(() => Promise.resolve(null)),
            set: mock(() => Promise.resolve('OK')),
        } as any;

        const mockMediaHandler = {
            execute: mock(() => Promise.resolve(Array(10).fill({ id: 'media' })))
        } as any;

        const mockAdsHandler = {
            execute: mock(() => Promise.resolve([{ id: 'ad-1' }, { id: 'ad-2' }]))
        } as any;

        const handler = new GetMixedFeedHandler(mockRedis, mockMediaHandler, mockAdsHandler);
        const result = await handler.execute(new GetMixedFeedQuery('test'));

        // Logic: 5 media, 1 ad, 5 media, 1 ad
        // Input: 10 media, 2 ads.
        // Chunk 1: 5 media. Ad 1.
        // Chunk 2: 5 media. Ad 2.
        // Total: 10 + 2 = 12 items.
        expect(result).toHaveLength(12);
        expect(result[5]?.type).toBe('SPONSORED');

        expect(mockMediaHandler.execute).toHaveBeenCalled();
        expect(mockAdsHandler.execute).toHaveBeenCalled();
        expect(mockRedis.set).toHaveBeenCalled();
    });
});
