export class GetTopRatedByYearQuery {
  constructor(
    public readonly year: number,
    public readonly limit = 10,
    public readonly type?: 'GAME' | 'MOVIE' | 'SHOW' | 'BOOK',
  ) {}
}
