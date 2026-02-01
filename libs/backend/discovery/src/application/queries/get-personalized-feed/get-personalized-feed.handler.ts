import { GetPersonalizedFeedQuery } from './get-personalized-feed.query';
import { Result, AppError } from '@metacult/shared-core';
import type {
  IRecommendationRepository,
  FeedMediaDto,
} from '../../../domain/ports/recommendation.repository.interface';

// Helper DTO re-export if needed or import from port
export type { FeedMediaDto };

export class GetPersonalizedFeedHandler {
  constructor(private readonly repository: IRecommendationRepository) {}

  async execute(
    query: GetPersonalizedFeedQuery,
  ): Promise<Result<FeedMediaDto[]>> {
    const { userId, limit, offset } = query;
    return this.repository.getPersonalizedRecommendations(
      userId,
      limit,
      offset,
    );
  }
}
