import { describe, it, expect } from 'bun:test';
import { cacheService } from './lib/cache/cache.service';
// import * as infrastructure from '@metacult/backend-infrastructure';

describe('Infrastructure Direct', () => {
  it('should export cacheService', () => {
    expect(cacheService).toBeDefined();
  });
});
