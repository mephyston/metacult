import { Result, AppError } from '@metacult/shared-core';

export interface FeedMediaDto {
  id: string;
  title: string;
  slug: string | null;
  type: string;
  coverUrl: string | null;
  rankScore: number;
}

export interface IRecommendationRepository {
  getPersonalizedRecommendations(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<Result<FeedMediaDto[]>>;
}
