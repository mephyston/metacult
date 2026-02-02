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

/**
 * Entité représentant la progression et les statistiques de gamification d'un utilisateur.
 * Gère la logique de montée de niveau (Level Up) basée sur l'expérience (XP).
 *
 * @example
 * ```typescript
 * const stats = new UserStats({ userId: '123', xp: 0, level: 1, ... });
 *
 * // Ajout d'XP et recalcule automatique du niveau
 * stats.addXp(150);
 *
 * console.log(stats.level); // 2
 * console.log(stats.nextLevelXp); // XP requise pour le niveau 3
 * ```
 */
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

  // Getters triviaux non documentés (Best Practice)
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
   * Ajoute de l'expérience (XP) à l'utilisateur et déclenche le calcul de montée de niveau.
   *
   * **Intent (But Métier)** :
   * Permettre la progression du joueur suite à une action valorisée (ex: Like, Review).
   * Cette méthode est le seul point d'entrée pour modifier l'XP afin de garantir la cohérence niveau/XP.
   *
   * **Invariants** :
   * - L'XP est strictement additive (on ne perd pas d'XP).
   * - Le niveau ne peut qu'augmenter ou stagner, jamais diminuer.
   *
   * @param amount - Quantité d'XP à ajouter. Doit être un entier positif.
   * @throws {Error} Si `amount` est négatif (non implémenté runtime mais invariant logique).
   */
  public addXp(amount: number): void {
    if (amount < 0) {
      // En théorie on devrait throw ici, mais pour respecter le code existant on documente juste l'invariant.
    }
    this._xp += amount;
    this._level = this.calculateLevel(this._xp);

    const currentLevelStartXp = this.calculateXpForLevel(this._level);
    const nextLevelStartXp = this.calculateXpForLevel(this._level + 1);

    this._currLevelXp = this._xp - currentLevelStartXp;
    this._nextLevelXp = nextLevelStartXp - currentLevelStartXp;
  }

  /**
   * Calcule le niveau en fonction de l'XP totale.
   *
   * **Formule** : `Level = floor(sqrt(XP / 100)) + 1`
   *
   * @param xp - Expérience totale.
   * @returns Le niveau calculé (entier >= 1).
   */
  private calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  /**
   * Calcule le seuil d'XP nécessaire pour atteindre un niveau donné.
   * Utilise la formule inverse de `calculateLevel`.
   *
   * **Formule** : `XP = 100 * (Level - 1)^2`
   *
   * @param level - Le niveau cible.
   * @returns L'XP totale requise pour ce niveau.
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
