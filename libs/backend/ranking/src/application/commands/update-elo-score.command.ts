export class UpdateEloScoreCommand {
  constructor(
    public readonly winnerId: string,
    public readonly loserId: string,
  ) {}
}
