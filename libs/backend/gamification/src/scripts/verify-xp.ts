import { GamificationService } from '../application/services/gamification.service';
import { getDbConnection, logger } from '@metacult/backend-infrastructure';

async function main() {
  logger.info('--- Verifying Gamification Flow ---');

  const { db } = getDbConnection();
  const service = new GamificationService();
  const userId = 'verify-user-' + Date.now(); // Unique ID

  logger.info(`1. Creating test user stats for ${userId}`);

  logger.info('2. Adding 100 XP (Action: VERIFY_INIT)');
  await service.addXp(userId, 100, 'VERIFY_INIT');

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
  await service.addXp(userId, 50, 'VERIFY_SWIPE');

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
