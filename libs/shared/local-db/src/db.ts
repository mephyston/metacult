import Dexie, { type Table } from 'dexie';
import type { MediaItem, UserProfile } from '@metacult/shared-types';

export class MetacultDB extends Dexie {
  // Tables
  media!: Table<MediaItem, string>; // id is string
  userProfile!: Table<UserProfile, string>;
  dailyStack!: Table<MediaItem, string>; // Local cache of the daily stack
  outbox!: Table<any, number>; // auto-inc id; eslint-disable-line @typescript-eslint/no-explicit-any

  interactions!: Table<
    {
      mediaId: string;
      action: 'LIKE' | 'DISLIKE' | 'WISHLIST' | 'SKIP';
      sentiment?: string;
      timestamp: number;
    },
    string
  >;

  constructor() {
    super('MetacultDB');

    // Schema Versioning
    this.version(1).stores({
      media: 'id, type, title',
      userProfile: 'id, email',
      outbox: '++id, status, type', // status: 'pending' | 'processing'
      dailyStack: 'id', // Simple index
    });

    this.version(2).stores({
      interactions: 'mediaId, action, sentiment, timestamp',
    });
  }
}

export const db = new MetacultDB();
