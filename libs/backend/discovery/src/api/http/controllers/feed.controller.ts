import type { Context } from 'elysia';
import { GetMixedFeedHandler } from '../../../application/queries/get-mixed-feed/get-mixed-feed.handler';
import { GetMixedFeedQuery } from '../../../application/queries/get-mixed-feed/get-mixed-feed.query';

export class FeedController {
  constructor(private readonly getMixedFeedHandler: GetMixedFeedHandler) { }

  async getFeed({ query }: Context) {
    const searchTerm = (query as any)['q'] || ''; // Elysia types might need assertion or generic
    const feed = await this.getMixedFeedHandler.execute(new GetMixedFeedQuery(searchTerm));
    return feed;
  }
}
