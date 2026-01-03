/**
 * Composable pour résoudre intelligemment l'URL de l'API.
 * Gère le "Split Horizon" :
 * - SSR (Server) : Utilise `internalApiUrl` (Réseau Docker/Railway privé)
 * - Client (Browser) : Utilise `public.apiUrl` (Réseau Public)
 */
export const useApiUrl = () => {
    const config = useRuntimeConfig();

    if (import.meta.server) {
        // SSR : Priorité à l'URL interne si définie
        if (config.internalApiUrl && config.internalApiUrl !== '') {
            return config.internalApiUrl;
        }
    }

    // Client ou Fallback SSR : URL Publique
    return config.public.apiUrl || 'http://localhost:3000';
};

export const useWebsiteUrl = () => {
    const config = useRuntimeConfig();
    return config.public.websiteUrl || 'http://localhost:4444';
}
