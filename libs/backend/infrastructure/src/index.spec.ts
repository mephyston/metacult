import { cacheService } from './lib/cache/cache.service';
// import * as infrastructure from './index';

describe('Infrastructure Direct', () => {
    it('should export cacheService', () => {
        expect(cacheService).toBeDefined();
    });
});
