<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signIn } from '../lib/auth-client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@metacult/shared-ui';
import { Input } from '@metacult/shared-ui';
import { Label } from '@metacult/shared-ui';
import { Button } from '@metacult/shared-ui';

import { useGuestSync } from '../composables/useGuestSync';
import { useAuthSession } from '../composables/useAuthSession';

const router = useRouter();
const { refreshSession } = useAuthSession();
const { flushSync } = useGuestSync();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    error.value = 'Veuillez remplir tous les champs';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await signIn.email({
      email: email.value,
      password: password.value,
    });

    // Rafraîchir la session dans le state global
    await refreshSession();

    // Synchroniser les swipes en attente s'il y en a
    await flushSync();

    // Navigation SPA (pas de reload)
    router.push('/');
  } catch (err: any) {
    error.value = err?.message || 'Erreur lors de la connexion';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-background px-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-2xl">Connexion</CardTitle>
        <CardDescription>
          Connectez-vous à votre compte Metacult
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input id="email" v-model="email" type="email" placeholder="vous@exemple.com" required
              :disabled="loading" />
          </div>
          <div class="space-y-2">
            <Label for="password">Mot de passe</Label>
            <Input id="password" v-model="password" type="password" placeholder="••••••••" required
              :disabled="loading" />
          </div>
          <div v-if="error" class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {{ error }}
          </div>
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="flex justify-center">
        <p class="text-sm text-muted-foreground">
          Pas de compte ?
          <NuxtLink to="/register" class="text-primary hover:underline">
            Créer un compte
          </NuxtLink>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>
