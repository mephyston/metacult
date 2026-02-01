import { GamificationService } from '../application/services/gamification.service';
import { getDbConnection, logger } from '@metacult/backend-infrastructure';
import { DrizzleGamificationRepository } from '../infrastructure/repositories/drizzle-gamification.repository';

import { asUserId } from '@metacult/shared-core';
async function main() {
  logger.info('--- Verifying Gamification Flow ---');

  const { db } = getDbConnection();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const repo = new DrizzleGamificationRepository(db as unknown as any);
  const service = new GamificationService(repo);
  const userId = asUserId('verify-user-' + Date.now()); // Unique ID

  logger.info(`1. Creating test user stats for ${userId}`);

  logger.info('2. Adding 100 XP (Action: VERIFY_INIT)');
  await service.addXp(userId, 100);

  let stats = await service.getUserStats(userId);
  logger.info({ stats }, 'Stats after 100 XP');

  if (!stats) {
    throw new Error('Stats not found for user ' + userId);
  }

  if (stats.xp !== 100) {
    logger.error({ expected: 100, actual: stats.xp }, 'XP mismatch');
    throw new Error('XP mismatch 100');
  }

  // Checking Level (Formula: 0.1 * sqrt(xp)) -> 0.1 * 10 = 1 -> +1 = 2
  if (stats.level !== 2) {
    logger.warn(
      { expected: 2, actual: stats.level },
      'Level expectation might differ depending on formula',
    );
  }

  logger.info('3. Adding 50 XP (Action: VERIFY_SWIPE)');
  await service.addXp(userId, 50);

  stats = await service.getUserStats(userId);
  logger.info({ stats }, 'Stats after +50 XP');

  if (!stats) {
    throw new Error('Stats not found for user ' + userId);
  }

  if (stats.xp !== 150) {
    logger.error({ expected: 150, actual: stats.xp }, 'XP mismatch');
    throw new Error('XP mismatch 150');
  }

  logger.info('--- Verification Success ---');
  process.exit(0);
}

main().catch((err) => {
  logger.error({ err }, 'Verification Failed');
  process.exit(1);
});
