export interface UserStatsProps {
  id: string;
  userId: string;
  xp: number;
  level: number;
  currLevelXp: number;
  nextLevelXp: number;
  createdAt: Date;
  updatedAt: Date;
}

export class UserStats {
  public readonly id: string;
  public readonly userId: string;
  private _xp: number;
  private _level: number;
  private _currLevelXp: number;
  private _nextLevelXp: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: UserStatsProps) {
    this.id = props.id;
    this.userId = props.userId;
    this._xp = props.xp;
    this._level = props.level;
    this._currLevelXp = props.currLevelXp;
    this._nextLevelXp = props.nextLevelXp;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  get xp(): number {
    return this._xp;
  }
  get level(): number {
    return this._level;
  }
  get currLevelXp(): number {
    return this._currLevelXp;
  }
  get nextLevelXp(): number {
    return this._nextLevelXp;
  }

  /**
   * Adds XP to the user and recalculates level stats.
   */
  public addXp(amount: number): void {
    this._xp += amount;
    this._level = this.calculateLevel(this._xp);

    const currentLevelStartXp = this.calculateXpForLevel(this._level);
    const nextLevelStartXp = this.calculateXpForLevel(this._level + 1);

    this._currLevelXp = this._xp - currentLevelStartXp;
    this._nextLevelXp = nextLevelStartXp - currentLevelStartXp;
  }

  /**
   * Calculates level based on XP.
   * Simple formula: Level = floor(sqrt(XP / 100)) + 1
   */
  private calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  /**
   * Inverse: XP = 100 * (Level - 1)^2
   */
  private calculateXpForLevel(level: number): number {
    return 100 * Math.pow(level - 1, 2);
  }

  public toSnapshot(): UserStatsProps {
    return {
      id: this.id,
      userId: this.userId,
      xp: this._xp,
      level: this._level,
      currLevelXp: this._currLevelXp,
      nextLevelXp: this._nextLevelXp,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
