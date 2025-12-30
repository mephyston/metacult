import { describe, it, expect } from 'bun:test';
import { ExternalReference } from './external-reference.vo';

describe('ExternalReference Value Object', () => {
    it('should create a valid instance', () => {
        const ref = new ExternalReference('igdb', '12345');
        expect(ref.provider).toBe('igdb');
        expect(ref.id).toBe('12345');
    });

    it('should throw error if provider is missing', () => {
        expect(() => new ExternalReference('', '12345')).toThrow('ExternalReference must have a provider');
    });

    it('should throw error if id is missing', () => {
        expect(() => new ExternalReference('igdb', '')).toThrow('ExternalReference must have an id');
    });
});
