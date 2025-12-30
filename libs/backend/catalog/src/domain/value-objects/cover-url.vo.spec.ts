import { describe, it, expect } from 'bun:test';
import { CoverUrl } from './cover-url.vo';

describe('CoverUrl VO', () => {
    describe('Validation', () => {
        it('should accept valid HTTPS URLs', () => {
            expect(() => new CoverUrl('https://example.com/cover.jpg')).not.toThrow();
            expect(() => new CoverUrl('https://cdn.igdb.com/123.png')).not.toThrow();
        });

        it('should reject non-HTTPS URLs', () => {
            expect(() => new CoverUrl('http://example.com/cover.jpg')).toThrow();
            expect(() => new CoverUrl('ftp://example.com/cover.jpg')).toThrow();
        });

        it('should reject invalid URLs', () => {
            expect(() => new CoverUrl('not-a-url')).toThrow();
            expect(() => new CoverUrl('')).toThrow();
        });
    });
});
