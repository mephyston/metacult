import { describe, it, expect } from 'bun:test';
import { Rating } from './rating.vo';

describe('Rating VO', () => {
    describe('Validation', () => {
        it('should accept valid rating between 0 and 10', () => {
            expect(() => new Rating(0)).not.toThrow();
            expect(() => new Rating(5)).not.toThrow();
            expect(() => new Rating(10)).not.toThrow();
            expect(() => new Rating(7.5)).not.toThrow();
        });

        it('should reject rating > 10', () => {
            expect(() => new Rating(11)).toThrow('Rating must be between 0 and 10');
            expect(() => new Rating(100)).toThrow();
        });

        it('should reject rating < 0', () => {
            expect(() => new Rating(-1)).toThrow('Rating must be between 0 and 10');
            expect(() => new Rating(-0.1)).toThrow();
        });
    });

    describe('Value equality', () => {
        it('should be equal if same value', () => {
            const r1 = new Rating(8.5);
            const r2 = new Rating(8.5);
            expect(r1.getValue()).toBe(r2.getValue());
        });
    });
});
