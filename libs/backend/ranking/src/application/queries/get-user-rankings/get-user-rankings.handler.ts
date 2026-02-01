import type { GetUserRankingsQuery } from './get-user-rankings.query';
import type { IInteractionRepository } from '@metacult/backend-interaction';
import type { IMediaRepository, Media } from '@metacult/backend-catalog';
import { EloCalculator } from '../../../domain/services/elo-calculator.service';
import { InteractionAction } from '@metacult/backend-interaction';
import { Result, AppError, InfrastructureError } from '@metacult/shared-core';
import { asUserId, asMediaId } from '@metacult/shared-core';
import type { MediaId } from '@metacult/shared-core';

/**
 * DTO de retour pour un média classé.
 */
export interface RankedMedia {
  mediaId: MediaId;
  title: string;
  coverUrl: string | null;
  type: string;
  score: number;
  rank: number;
}

/**
 * Handler pour la Query GetUserRankings.
 * Génère le classement personnel en rejouant l'historique des interactions via l'algorithme ELO.
 *
 * Stratégie :
 * 1. Récupérer toutes les interactions de l'utilisateur, triées chronologiquement.
 * 2. Initialiser les scores basés sur les swipes (BANGER=1600, LIKE=1400, WISHLIST=1200).
 * 3. Rejouer les duels pour ajuster les scores avec l'algorithme ELO.
 * 4. Trier et enrichir avec les données des médias.
 */
export class GetUserRankingsHandler {
  private readonly eloCalculator: EloCalculator;

  constructor(
    private readonly interactionRepository: IInteractionRepository,
    private readonly mediaRepository: IMediaRepository,
  ) {
    this.eloCalculator = new EloCalculator();
  }

  /**
   * Exécute la génération du classement personnel.
   */
  async execute(
    query: GetUserRankingsQuery,
  ): Promise<Result<RankedMedia[], AppError>> {
    try {
      const { userId, limit = 10 } = query;

      // 1. Récupérer toutes les interactions de l'utilisateur, triées par date
      const interactions = await this.interactionRepository.findAllByUser(
        asUserId(userId),
      );

      if (interactions.length === 0) {
        return Result.ok([]);
      }

      // Trier par date croissante (rejeu chronologique)
      const sortedInteractions = interactions.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );

      // 2. Initialiser la Map des scores (MediaId -> Score ELO)
      const scores = new Map<string, number>();

      // 3. Passe 1 : Initialisation avec les swipes simples
      for (const interaction of sortedInteractions) {
        const { mediaId, action, sentiment } = interaction;

        // Si le média a déjà un score (d'une interaction précédente), on skip
        // pour garder le premier score établi chronologiquement
        if (scores.has(mediaId)) {
          continue;
        }

        // Attribution du score initial selon l'action/sentiment
        if (sentiment === 'BANGER') {
          scores.set(mediaId, 1600);
        } else if (action === InteractionAction.LIKE) {
          scores.set(mediaId, 1400);
        } else if (action === InteractionAction.WISHLIST) {
          scores.set(mediaId, 1200);
        }
        // DISLIKE et SKIP ne sont pas comptabilisés dans le classement
      }

      // 4. Passe 2 : Replay des duels
      // Les duels génèrent 2 interactions consécutives avec actions WIN et LOSS
      // On doit les grouper pour calculer les nouveaux scores ELO
      const duelPairs: Array<{ winnerId: string; loserId: string }> = [];

      for (let i = 0; i < sortedInteractions.length - 1; i++) {
        const current = sortedInteractions[i];
        const next = sortedInteractions[i + 1];

        // Détection de paire de duel :
        // - Timestamps proches (< 5 secondes de différence)
        // - Actions complémentaires (WIN + LOSS ou LOSS + WIN)
        if (!current || !next) {
          continue;
        }

        const timeDiff = Math.abs(
          current.createdAt.getTime() - next.createdAt.getTime(),
        );

        if (timeDiff < 5000) {
          // Identifier gagnant et perdant
          // Note: Les duels sont marqués via l'action (convention à vérifier dans votre schéma)
          // Ici on suppose que l'action indique le résultat depuis le point de vue du média
          // Si vous stockez différemment, adapter cette logique

          // Hypothèse : L'action "LIKE" dans un duel signifie "ce média a gagné"
          // et "DISLIKE" signifie "ce média a perdu"
          // Vous devrez adapter selon votre modèle réel

          const isCurrentWinner = current.action === InteractionAction.LIKE;
          const isNextLoser = next.action === InteractionAction.DISLIKE;

          if (isCurrentWinner && isNextLoser) {
            duelPairs.push({
              winnerId: current.mediaId,
              loserId: next.mediaId,
            });
            i++; // Skip next iteration car on a traité la paire
          }
        }
      }

      // Appliquer l'algorithme ELO sur chaque paire de duel
      for (const { winnerId, loserId } of duelPairs) {
        const winnerScore = scores.get(winnerId) ?? 1400; // Default ELO
        const loserScore = scores.get(loserId) ?? 1400;

        const { winnerNewElo, loserNewElo } =
          this.eloCalculator.calculateNewScores(winnerScore, loserScore);

        scores.set(winnerId, winnerNewElo);
        scores.set(loserId, loserNewElo);
      }

      // 5. Finalisation : Conversion en tableau et tri
      const rankedEntries = Array.from(scores.entries())
        .map(([mediaId, score]) => ({ mediaId, score }))
        .sort((a, b) => b.score - a.score) // Tri décroissant
        .slice(0, limit); // Appliquer la limite

      if (rankedEntries.length === 0) {
        return Result.ok([]);
      }

      // 6. Enrichissement avec les données des médias
      const mediaIds = rankedEntries.map((entry) => entry.mediaId);
      const mediaPromises = mediaIds.map((id) =>
        this.mediaRepository.findById(asMediaId(id)),
      );
      const medias = await Promise.all(mediaPromises);

      // Créer un dictionnaire pour accès rapide (filtrer les null)
      const mediaMap = new Map(
        medias
          .filter((media): media is Media => media !== null)
          .map((media) => [media.id, media]),
      );

      // Construire le résultat final
      const intermediateResults = rankedEntries.map((entry) => {
        const media = mediaMap.get(asMediaId(entry.mediaId));
        if (!media) {
          return null; // Média supprimé ou introuvable
        }

        return {
          mediaId: media.id,
          title: media.title,
          coverUrl: media.coverUrl?.getValue() ?? null,
          type: media.type as string,
          score: entry.score,
          rank: 0, // Sera recalculé après le filtrage
        };
      });

      const result: RankedMedia[] = intermediateResults
        .filter((item): item is RankedMedia => item !== null)
        .map((item, index) => ({
          ...item,
          rank: index + 1, // Recalcul du rank après filtrage
        }));

      return Result.ok(result);
    } catch (error) {
      return Result.fail(
        error instanceof AppError
          ? error
          : new InfrastructureError(
              error instanceof Error ? error.message : 'Unknown error',
            ),
      );
    }
  }
}
