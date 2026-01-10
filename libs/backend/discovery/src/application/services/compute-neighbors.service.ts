import type { AffinityRepository } from '../../domain/ports/affinity.repository.interface';
import type { SimilarityRepository } from '../../domain/ports/similarity.repository.interface';
import { SimilarityCalculator } from '../../domain/services/similarity-calculator.service';
import { Neighbor } from '../../domain/entities/neighbor.entity';
import { logger } from '@metacult/backend-infrastructure';

export class ComputeNeighborsService {
  constructor(
    private readonly affinityRepository: AffinityRepository,
    private readonly similarityRepository: SimilarityRepository,
  ) {}

  /**
   * Executes the batch job to compute nearest neighbors for all users.
   * Logic:
   * 1. Iterate distinct users (batching could be added here).
   * 2. For each user, find candidates sharing >= 3 valid media interactions.
   * 3. Compute cosine similarity for candidates.
   * 4. Persist only the Top 20 neighbors.
   */
  async execute(): Promise<void> {
    logger.info('[ComputeNeighborsService] Starting batch job...');

    // 1. Get all users who have atleast some activity
    const userIds = await this.affinityRepository.findAllUsersWithAffinity();

    logger.info(
      `[ComputeNeighborsService] Found ${userIds.length} users to process.`,
    );

    for (const userId of userIds) {
      await this.processUser(userId);
    }

    logger.info('[ComputeNeighborsService] Batch job completed.');
  }

  private async processUser(userId: string): Promise<void> {
    // 2. Candidate Generation
    // Find users who have rated the same items as the current user.
    // Filter for meaningful interactions (score > 1200 is a good heuristic for "liked" or "engaged",
    // but the prompt said "having at least 3 media in common with scores > 1200").
    // We assume this means BOTH users must have scored > 1200 on the item to count it as a "strong link".

    const candidateIds = await this.affinityRepository.findCandidateNeighbors(
      userId,
      3,
      1200,
    );

    if (candidateIds.length === 0) {
      return;
    }

    // 3. Refinement: Calculate full similarity
    const userAffinities = await this.affinityRepository.findByUser(userId);
    const userVector = this.toVector(userAffinities);

    const neighbors: Neighbor[] = [];

    for (const candidateId of candidateIds) {
      const candidateAffinities =
        await this.affinityRepository.findByUser(candidateId);
      const candidateVector = this.toVector(candidateAffinities);

      const score = SimilarityCalculator.calculate(userVector, candidateVector);

      // We only care about positive correlation? Or should we store negative?
      // Usually neighbors are "similar users", so positive correlation.
      // Let's arbitrarily filter > 0.1 to avoid storing noise, or just keep top N regardless.
      if (score > 0) {
        neighbors.push(Neighbor.create(userId, candidateId, score));
      }
    }

    // 4. Sort and Persist Top 20
    neighbors.sort((a, b) => b.similarityScore - a.similarityScore);
    const top20 = neighbors.slice(0, 20);

    // Save (Upsert logic to be handled by repository or we overwrite)
    // The requirement says "Persist". We should probably clear old neighbors or just upsert.
    // For now, simpler is: Save each one.
    if (top20.length > 0) {
      await Promise.all(top20.map((n) => this.similarityRepository.save(n)));
    }
  }

  private toVector(affinities: any[]): Record<string, number> {
    const vector: Record<string, number> = {};
    for (const aff of affinities) {
      vector[aff.mediaId] = aff.score;
    }
    return vector;
  }
}
