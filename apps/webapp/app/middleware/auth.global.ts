/**
 * Auth Middleware - Nuxt 3
 * Protège les routes nécessitant une authentification
 */
import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuthSession } from '../composables/useAuthSession'

export default defineNuxtRouteMiddleware(async (to) => {
    // Skip middleware for public routes
    const publicRoutes = ['/', '/login', '/register']
    if (publicRoutes.includes(to.path)) {
        return
    }

    const { user, isLoading, refreshSession } = useAuthSession()

    // Rafraîchir la session si pas encore chargée
    if (isLoading.value) {
        await refreshSession()
    }

    // Rediriger vers login si non authentifié
    if (!user.value) {
        return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`, {
            redirectCode: 302
        })
    }
})
