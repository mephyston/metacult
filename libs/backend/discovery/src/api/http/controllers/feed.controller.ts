import type { Context } from 'elysia';
import { GetMixedFeedHandler } from '../../../application/queries/get-mixed-feed/get-mixed-feed.handler';
import { GetMixedFeedQuery } from '../../../application/queries/get-mixed-feed/get-mixed-feed.query';

export class FeedController {
  constructor(private readonly getMixedFeedHandler: GetMixedFeedHandler) { }

  async getFeed(params: { q?: string }) {
    const searchTerm = params.q || '';
    const feed = await this.getMixedFeedHandler.execute(new GetMixedFeedQuery(searchTerm));
    return feed;
  }
}
