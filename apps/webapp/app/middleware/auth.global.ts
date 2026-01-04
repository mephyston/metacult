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
    // On évite de rediriger /auth/callback car c'est une route technique
    if (!to.path.startsWith('/auth/callback')) {
      return navigateTo('/');
    }
  }
});
