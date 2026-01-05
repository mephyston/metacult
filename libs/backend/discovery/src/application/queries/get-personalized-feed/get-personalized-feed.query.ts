export class GetPersonalizedFeedQuery {
  constructor(
    public readonly userId: string,
    public readonly limit = 20,
    public readonly offset = 0,
  ) {}
}
