<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signUp } from '../lib/auth-client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@metacult/shared-ui';
import { Input } from '@metacult/shared-ui';
import { Label } from '@metacult/shared-ui';
import { Button } from '@metacult/shared-ui';

const router = useRouter();
const { refreshSession } = useAuthSession();

const name = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleSubmit = async () => {
  console.log('[Register] Form submit triggered', { name: name.value, email: email.value, hasPassword: !!password.value });
  
  if (!name.value || !email.value || !password.value) {
    error.value = 'Veuillez remplir tous les champs';
    console.error('[Register] Missing fields');
    return;
  }

  if (password.value.length < 8) {
    error.value = 'Le mot de passe doit contenir au moins 8 caractères';
    console.error('[Register] Password too short');
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    console.log('[Register] Calling signUp.email...');
    await signUp.email({
      email: email.value,
      password: password.value,
      name: name.value,
    });
    console.log('[Register] signUp.email succeeded');

    // Rafraîchir la session dans le state global
    console.log('[Register] Refreshing session...');
    await refreshSession();
    console.log('[Register] Session refreshed');
    
    // Navigation SPA (pas de reload)
    console.log('[Register] Navigating to /');
    router.push('/');
  } catch (err: any) {
    console.error('[Register] Error:', err);
    error.value = err?.message || 'Erreur lors de la création du compte';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-background px-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-2xl">Créer un compte</CardTitle>
        <CardDescription>
          Rejoignez Metacult et découvrez vos prochains favoris
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form data-testid="signup-form" @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Pseudo</Label>
            <Input
              data-testid="input-name"
              id="name"
              v-model="name"
              type="text"
              placeholder="Votre pseudo"
              required
              :disabled="loading"
            />
          </div>
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              data-testid="input-email"
              id="email"
              v-model="email"
              type="email"
              name="email"
              placeholder="vous@exemple.com"
              required
              :disabled="loading"
            />
          </div>
          <div class="space-y-2">
            <Label for="password">Mot de passe</Label>
            <Input
              data-testid="input-password"
              id="password"
              v-model="password"
              type="password"
              name="password"
              placeholder="••••••••"
              required
              :disabled="loading"
            />
            <p class="text-xs text-muted-foreground">
              Minimum 8 caractères
            </p>
          </div>
          <div v-if="error" data-testid="error-message" class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {{ error }}
          </div>
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Création...' : 'Créer mon compte' }}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="flex justify-center">
        <p class="text-sm text-muted-foreground">
          Déjà inscrit ?
          <NuxtLink to="/login" class="text-primary hover:underline">
            Se connecter
          </NuxtLink>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>
