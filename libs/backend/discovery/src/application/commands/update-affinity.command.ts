export interface UpdateAffinityCommand {
  type: 'SENTIMENT' | 'DUEL';
  userId: string;
}

export interface SentimentUpdateCommand extends UpdateAffinityCommand {
  type: 'SENTIMENT';
  mediaId: string;
  sentiment: 'BANGER' | 'GOOD' | 'OKAY' | 'DISLIKE';
  globalElo: number;
}

export interface DuelUpdateCommand extends UpdateAffinityCommand {
  type: 'DUEL';
  winnerMediaId: string;
  loserMediaId: string;
  winnerGlobalElo: number;
  loserGlobalElo: number;
}

export const AFFINITY_QUEUE_NAME = 'affinity-queue';
export type UpdateAffinityPayload = SentimentUpdateCommand | DuelUpdateCommand;
