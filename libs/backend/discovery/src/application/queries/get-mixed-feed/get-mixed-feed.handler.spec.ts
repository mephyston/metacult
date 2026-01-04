import { describe, it, expect, mock } from 'bun:test';
import { GetMixedFeedHandler } from './get-mixed-feed.handler';
import { GetMixedFeedQuery } from './get-mixed-feed.query';

describe('GetMixedFeedHandler', () => {
    it('should return mixed feed from cache if available', async () => {
        const mockRedis = {
            get: mock(() => Promise.resolve(JSON.stringify([{ type: 'MEDIA', data: {} }]))),
            set: mock(() => Promise.resolve('OK')),
        } as any;
        const mockMediaSearcher = {} as any;
        const mockAds = {} as any;

        const handler = new GetMixedFeedHandler(mockRedis, mockMediaSearcher, mockAds);
        const result = await handler.execute(new GetMixedFeedQuery('test'));

        expect(result).toHaveLength(1);
        expect(mockRedis.get).toHaveBeenCalled();
    });

    it('should fetch dependencies and mix feed on cache miss', async () => {
        const mockRedis = {
            get: mock(() => Promise.resolve(null)),
            set: mock(() => Promise.resolve('OK')),
        } as any;

        const mockMediaSearcher = {
            search: mock(() => Promise.resolve(Array(10).fill({ id: 'media' })))
        } as any;

        const mockAdsProvider = {
            getAds: mock(() => Promise.resolve([{ id: 'ad1' }, { id: 'ad2' }]))
        } as any;

        const handler = new GetMixedFeedHandler(mockRedis, mockMediaSearcher, mockAdsProvider);
        const result = await handler.execute(new GetMixedFeedQuery('test'));

        // Logic: 5 media, 1 ad, 5 media, 1 ad
        // Input: 10 media, 2 ads.
        // Chunk 1: 5 media. Ad 1.
        // Chunk 2: 5 media. Ad 2.
        // Total: 10 + 2 = 12 items.
        expect(result).toHaveLength(12);
        expect(result[5]?.type).toBe('SPONSORED');

        expect(mockMediaSearcher.search).toHaveBeenCalled();
        expect(mockAdsProvider.getAds).toHaveBeenCalled();
        expect(mockRedis.set).toHaveBeenCalled();
    });

    it('should pass filters to media searcher', async () => {
        const mockRedis = { get: mock(() => null), set: mock(() => 'OK') } as any;
        const mockSearcher = { search: mock(() => Promise.resolve([])) } as any;
        const mockAds = { getAds: mock(() => []) } as any;

        const handler = new GetMixedFeedHandler(mockRedis, mockSearcher, mockAds);
        const query = new GetMixedFeedQuery('action', 'user-1', ['ex-1'], 15);

        await handler.execute(query);

        expect(mockSearcher.search).toHaveBeenCalledWith('action', {
            excludedIds: ['ex-1'],
            limit: 15,
            orderBy: undefined // 'action' is present, so not random default (unless search logic inside handler changes)
        });

        // Cache should be bypassed for user
        expect(mockRedis.get).not.toHaveBeenCalled();
    });
});
