<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { signUp } from '../lib/auth-client';
import { useAuthSession } from '../composables/useAuthSession';
import { useLogger } from '../composables/useLogger';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@metacult/shared-ui';
import { Input } from '@metacult/shared-ui';
import { Label } from '@metacult/shared-ui';
import { Button } from '@metacult/shared-ui';

const router = useRouter();
const { refreshSession } = useAuthSession();
const logger = useLogger();
const { t } = useI18n();

const name = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleSubmit = async () => {
  if (!name.value || !email.value || !password.value) {
    error.value = t('auth.register.errors.allFields');
    return;
  }

  if (password.value.length < 8) {
    error.value = t('auth.register.errors.passwordLength');
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await signUp.email({
      email: email.value,
      password: password.value,
      name: name.value,
    });

    // Rafraîchir la session dans le state global
    await refreshSession();

    // Navigation SPA (pas de reload)
    router.push('/');
  } catch (err: any) {
    logger.error('[Register] Error:', err);
    error.value = err?.message || t('auth.register.errors.generic');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-background px-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-2xl">
          {{ $t('auth.register.title') }}
        </CardTitle>
        <CardDescription>
          {{ $t('auth.register.description') }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          data-testid="signup-form"
          class="space-y-4"
          @submit.prevent="handleSubmit"
        >
          <div class="space-y-2">
            <Label for="name">{{ $t('auth.register.name') }}</Label>
            <Input
              id="name"
              v-model="name"
              data-testid="input-name"
              type="text"
              placeholder="Votre pseudo"
              required
              :disabled="loading"
            />
          </div>
          <div class="space-y-2">
            <Label for="email">{{ $t('auth.register.email') }}</Label>
            <Input
              id="email"
              v-model="email"
              data-testid="input-email"
              type="email"
              name="email"
              placeholder="vous@exemple.com"
              required
              :disabled="loading"
            />
          </div>
          <div class="space-y-2">
            <Label for="password">{{ $t('auth.register.password') }}</Label>
            <Input
              id="password"
              v-model="password"
              data-testid="input-password"
              type="password"
              name="password"
              placeholder="••••••••"
              required
              :disabled="loading"
            />
            <p class="text-xs text-muted-foreground">
              {{ $t('auth.register.passwordHint') }}
            </p>
          </div>
          <div
            v-if="error"
            data-testid="error-message"
            class="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
          >
            {{ error }}
          </div>
          <Button type="submit" class="w-full" :disabled="loading">
            {{
              loading
                ? $t('auth.register.submitting')
                : $t('auth.register.submit')
            }}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="flex justify-center">
        <p class="text-sm text-muted-foreground">
          {{ $t('auth.register.login') }}
          <NuxtLink to="/login" class="text-primary hover:underline">
            {{ $t('auth.register.loginLink') }}
          </NuxtLink>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>
