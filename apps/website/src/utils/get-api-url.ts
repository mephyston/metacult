export function getApiUrl(): string {
    // Prioritize Runtime Env Vars (process.env) for SSR.
    const rawApiUrl =
        process.env.API_URL ||
        process.env.PUBLIC_API_URL ||
        import.meta.env.PUBLIC_API_URL;

    if (!rawApiUrl) {
        console.warn('⚠️ No API_URL found, defaulting to empty string');
        return '';
    }

    let apiUrl = rawApiUrl;

    // Ensure protocol is present and correct for internal Railway networking
    if (!rawApiUrl.startsWith('http')) {
        // Missing protocol
        if (rawApiUrl.includes('.internal')) {
            // Internal networking usually requires the port (Railway often defaults to 3000 or 8080)
            // We default to 8080 as observed in Railway "Metal Edge"
            apiUrl = `http://${rawApiUrl}:8080`;
        } else {
            apiUrl = `https://${rawApiUrl}`;
        }
    } else if (rawApiUrl.includes('.internal')) {
        // If internal domain, ensure HTTP (not HTTPS) and Port
        // Private networking in Railway does not support HTTPS certificates usually
        let internalUrl = rawApiUrl.replace('https://', 'http://');
        if (!internalUrl.includes(':')) {
            internalUrl = `${internalUrl}:8080`;
        }
        apiUrl = internalUrl;
    }

    return apiUrl;
}
