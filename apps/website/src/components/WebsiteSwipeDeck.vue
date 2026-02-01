<script setup lang="ts">
import { computed } from 'vue';

import { useObservable } from '@vueuse/rxjs';

import { db } from '@metacult/shared-local-db';

import { addToOutbox } from '@metacult/shared-sync-manager';
import { SwipeDeck } from '@metacult/shared-ui';
import { from } from 'rxjs';

// --- Props ---
const props = defineProps<{
  items: any[];
  signupUrl?: string; // We map signupUrl to registerUrl
  loginUrl?: string;
}>();

// --- Local State via Dexie LiveQuery ---
// We use the same 'dailyStack' idea or just a local memory implementation synced to DB?
// For the landing page, we might just want to persist interactions.
// But to show "already swiped", we need DB check.

// However, for Simplicity on Landing Page (Demo Mode), maybe we don't sync the STACK from DB,
// but we just persist new interactions.
// Let's assume the 'items' prop is the source of truth (from API trends).

const deckItems = computed(() => props.items);

// --- Handle Interactions ---
const onInteraction = async (payload: any) => {
  console.log('[WebsiteSwipeDeck] Interaction:', payload);

  // 1. Persist Action for Global Sync (Guest -> Webapp)
  // This writes to the SAME IndexedDB that the Webapp reads!
  try {
    await addToOutbox({
      type: 'SWIPE',
      payload: payload,
      createdAt: Date.now(),
    });
    console.log('[WebsiteSwipeDeck] Interaction persisted to Outbox');
  } catch (e) {
    console.error('[WebsiteSwipeDeck] Failed to persist interaction', e);
  }
};

const onUndo = async (payload: any) => {
  console.log('[WebsiteSwipeDeck] Undo Interaction:', payload);

  try {
    // Remove from Outbox
    // Since we don't have the ID returned by addToOutbox easily available here without storing it in state,
    // we search for the last item matching mediaId.
    const outboxItem = await db.outbox
      .where({ type: 'SWIPE' })
      .filter((item) => item.payload.mediaId === payload.mediaId)
      .last();

    if (outboxItem && outboxItem.status === 'pending') {
      await db.outbox.delete(outboxItem.id!);
      console.log('[WebsiteSwipeDeck] Undo: Removed pending swipe from outbox');
    }
  } catch (e) {
    console.error('[WebsiteSwipeDeck] Failed to undo interaction', e);
  }
};
</script>

<template>
  <div class="w-full h-full">
    <SwipeDeck
      v-if="deckItems && deckItems.length > 0"
      :items="deckItems"
      :guest-mode="true"
      :signup-url="signupUrl"
      :login-url="loginUrl"
      @interaction="onInteraction"
      @undo="onUndo"
    >
      <template #empty="{ reset }">
        <div class="text-center space-y-4 p-8">
          <p class="text-3xl">🎉</p>
          <p class="text-xl font-bold text-foreground">Tout vu !</p>

          <div class="flex flex-col gap-2">
            <a
              v-if="signupUrl"
              :href="signupUrl"
              class="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium inline-block"
            >
              Créer un compte pour sauvegarder
            </a>

            <div class="text-sm text-muted-foreground mt-2">
              <span v-if="loginUrl">
                Déjà un compte ?
                <a
                  :href="loginUrl"
                  class="text-primary hover:underline font-medium"
                >
                  Se connecter
                </a>
                ou
              </span>
              <button class="hover:underline" @click="reset">
                recommencer sans sauvegarder
              </button>
            </div>
          </div>
        </div>
      </template>
    </SwipeDeck>
  </div>
</template>
