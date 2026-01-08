import { describe, it, expect } from 'vitest';
import { addToOutbox } from './outbox';

describe('Outbox', () => {
  it('should have addToOutbox function', () => {
    expect(addToOutbox).toBeDefined();
    expect(typeof addToOutbox).toBe('function');
  });
});
