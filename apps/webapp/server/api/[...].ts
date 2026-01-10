/**
 * Dynamic API Proxy
 *
 * This catch-all route forwards all /api/** requests to the backend API.
 * Unlike static routeRules in nuxt.config.ts, this reads the environment
 * variable at RUNTIME, which is required for Railway deployments where
 * env vars are injected after the Docker image is built.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // Use internal API URL if available (server-side), fallback to public
  const baseUrl =
    config.internalApiUrl || config.public.apiUrl || 'http://localhost:3000';

  // Get the path after /api/
  const path = event.path;

  // Build target URL
  const targetUrl = `${baseUrl}${path}`;

  // Forward the request using proxyRequest (built-in Nitro utility)
  return proxyRequest(event, targetUrl);
});
