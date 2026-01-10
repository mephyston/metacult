export class GetUpcomingQuery {
  constructor(
    public readonly limit = 10,
    public readonly type?: 'GAME' | 'MOVIE' | 'SHOW' | 'BOOK',
  ) {}
}
