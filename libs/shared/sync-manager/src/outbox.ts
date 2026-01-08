import { db } from '@metacult/shared-local-db';
import { logger } from '@metacult/shared-core';

export type OutboxActionType = 'SWIPE' | 'DUEL_VOTE';

export interface OutboxAction {
  type: OutboxActionType;
  payload: any;
  createdAt: number;
}

export const addToOutbox = async (action: OutboxAction) => {
  await db.outbox.add({
    ...action,
    status: 'pending', // pending, processing, done, failed
  });
};

/**
 * Process pending items in the outbox.
 * Tries to send them to the API.
 *
 * @param apiBaseUrl - The base URL of the API (e.g. https://api.metacult.gg)
 * @param getAuthToken - Optional callback to retrieve current auth token
 */
export const processOutbox = async (
  apiBaseUrl: string,
  getAuthToken?: () => Promise<string | null>,
) => {
  // 1. Fetch pending items
  const pendingItems = await db.outbox
    .where('status')
    .equals('pending')
    .limit(50) // Batch size
    .toArray();

  if (pendingItems.length === 0) return;

  const token = getAuthToken ? await getAuthToken() : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  logger.info(
    `[Sync] Processing batch of ${pendingItems.length} items to ${apiBaseUrl}...`,
  );

  try {
    const batchPayload = pendingItems.map((item) => ({
      type: item.type,
      payload: item.payload,
      timestamp: item.createdAt,
    }));

    const response = await fetch(`${apiBaseUrl}/api/sync`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(batchPayload),
    });

    if (!response.ok) {
      logger.warn(
        `[Sync] Batch failed: ${response.status} ${response.statusText}`,
      );
      // If server error, we leave them pending.
      // If client error (4xx), we might want to mark them failed, but difficult to know which one.
      // For now, retry later.
      return;
    }

    // Success: Delete all synced items
    // Note: In a production robust system, we might want the server to return which IDs were processed.
    const ids = pendingItems.map((i) => i.id!);
    await db.outbox.bulkDelete(ids);
    logger.info(`[Sync] Successfully synced ${ids.length} items.`);
  } catch (error) {
    logger.error(`[Sync] Network error during batch sync`, error);
  }
};
