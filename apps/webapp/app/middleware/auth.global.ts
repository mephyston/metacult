import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app';
import { useAuthSession } from '../composables/useAuthSession';

export default defineNuxtRouteMiddleware(async (to) => {
  const { user, isLoading, refreshSession } = useAuthSession();

  // Liste des routes publiques accessibles sans connexion
  // On inclut /auth/callback pour les redirections OAuth
  const publicRoutes = ['/login', '/register', '/auth/callback'];

  // Vérifie si la route actuelle commence par une des routes publiques
  const isPublicRoute = publicRoutes.some((route) => to.path.startsWith(route));

  // Si la session est en chargement, on attend (ou on force un rafraîchissement si nécessaire)
  if (isLoading.value) {
    await refreshSession();
  }

  // 1. Protection : Redirection vers Login si non authentifié et sur une page privée
  if (!user.value && !isPublicRoute) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }

  // 2. Redirection UX : Si déjà connecté et tente d'aller sur Login/Register -> Dashboard
  if (user.value && isPublicRoute) {
    if (!to.path.startsWith('/auth/callback')) {
      return navigateTo('/');
    }
  }

  // 3. Enforce Onboarding
  // 3. Enforce Onboarding - DISABLED to allow navigation via TabBar
  // if (user.value && !user.value.onboardingCompleted) {
  //   const isOnboardingRoute = to.path.startsWith('/onboarding');
  //   const isSwipeOnboarding = to.path === '/swipe' && to.query.mode === 'onboarding';

  //   if (!isOnboardingRoute && !isSwipeOnboarding) {
  //     return navigateTo('/onboarding');
  //   }
  // }

  // 4. Prevent access to Onboarding if already completed
  if (
    user.value &&
    user.value.onboardingCompleted &&
    to.path.startsWith('/onboarding')
  ) {
    return navigateTo('/');
  }
});
