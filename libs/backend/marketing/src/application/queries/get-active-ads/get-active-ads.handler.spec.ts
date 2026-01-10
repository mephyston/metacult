import { describe, it, expect, mock } from 'bun:test';
import { GetActiveAdsHandler } from './get-active-ads.handler';
import type { AdsGateway } from '../../ports/ads.gateway.interface';
import { Ad } from '../../../domain/ad.entity';

describe('GetActiveAdsHandler', () => {
  it('should return ads from gateway', async () => {
    const mockAds = [
      new Ad({
        id: 'ad-1',
        title: 'Test Ad',
        type: 'SPONSORED',
        url: 'https://example.com',
      }),
    ];

    const mockGateway: AdsGateway = {
      getActiveAds: mock(() => Promise.resolve(mockAds)),
    };

    const handler = new GetActiveAdsHandler(mockGateway);
    const result = await handler.execute();

    expect(result.getValue()).toHaveLength(1);
    expect(result.getValue()[0]?.id).toBe('ad-1');
    expect(mockGateway.getActiveAds).toHaveBeenCalledTimes(1);
  });

  it('should delegate to gateway for ad retrieval', async () => {
    const mockGateway: AdsGateway = {
      getActiveAds: mock(() => Promise.resolve([])),
    };

    const handler = new GetActiveAdsHandler(mockGateway);
    const result = await handler.execute();

    expect(result.getValue()).toEqual([]);
    expect(mockGateway.getActiveAds).toHaveBeenCalled();
  });
});
