import { cacheService } from './lib/cache/cache.service';
import { users } from './lib/db/schema/users.schema';
// import * as infrastructure from './index';

describe('Infrastructure Direct', () => {
    it('should export cacheService', () => {
        expect(cacheService).toBeDefined();
    });
    it('should export users', () => {
        expect(users).toBeDefined();
    });
});
