import { describe, it, expect, mock } from 'bun:test';
import { GetActiveAdsHandler } from './get-active-ads.handler';
import { GetActiveAdsQuery } from './get-active-ads.query';

describe('GetActiveAdsHandler', () => {
    it('should return ads from cache if available', async () => {
        const mockRedis = {
            get: mock(() => Promise.resolve(JSON.stringify([{ id: 'cached-ad' }]))),
            set: mock(() => Promise.resolve('OK')),
        } as any;

        const handler = new GetActiveAdsHandler(mockRedis);
        const result = await handler.execute(new GetActiveAdsQuery());

        expect(result).toHaveLength(1);
        expect(result[0]?.id).toBe('cached-ad');
        expect(mockRedis.get).toHaveBeenCalledWith('marketing:ads:active');
    });

    it('should fetch and cache ads if cache miss', async () => {
        const mockRedis = {
            get: mock(() => Promise.resolve(null)),
            set: mock(() => Promise.resolve('OK')),
        } as any;

        const handler = new GetActiveAdsHandler(mockRedis);
        const result = await handler.execute(new GetActiveAdsQuery());

        expect(result.length).toBeGreaterThan(0);
        expect(mockRedis.set).toHaveBeenCalled();
    });
});
