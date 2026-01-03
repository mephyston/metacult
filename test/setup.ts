/* eslint-disable */
import { mock } from 'bun:test';

// 1. Mock Environment Variables BEFORE any imports
process.env.NODE_ENV = 'test';
process.env.API_PORT = '3000';
process.env.DATABASE_URL = 'postgres://mock:5432/mock';
process.env.REDIS_URL = 'redis://mock:6379';
process.env.BETTER_AUTH_SECRET = 'mock_secret_for_tests_only_123456';
process.env.BETTER_AUTH_URL = 'http://localhost:3000/api/auth';
process.env.PUBLIC_API_URL = 'http://localhost:3000';
process.env.BETTER_AUTH_TRUSTED_ORIGINS = 'http://localhost:3000';

// 2. Mock IoRedis to prevent connection attempts
mock.module('ioredis', () => {
  return {
    default: class RedisMock {
      constructor() {}
      on(event: string, callback: any) {}
      async get(key: string) {
        return null;
      }
      async set(key: string, val: string) {
        return 'OK';
      }
      async del(key: string) {
        return 1;
      }
      async quit() {
        return 'OK';
      }
      status = 'ready';
    },
  };
});

console.log('🧪 Test Environment Setup Complete (Env + Redis Mocked)');
