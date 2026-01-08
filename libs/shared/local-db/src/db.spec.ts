import { describe, it, expect } from 'vitest';
import { db } from './db';

describe('MetacultDB', () => {
  it('should initialize without error', () => {
    expect(db).toBeDefined();
    expect(db.name).toBe('MetacultDB');
  });

  it('should have correct tables', () => {
    expect(db.media).toBeDefined();
    expect(db.userProfile).toBeDefined();
    expect(db.outbox).toBeDefined();
  });
});
