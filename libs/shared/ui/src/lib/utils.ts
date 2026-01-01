import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getApiUrl(): string {
    // Use PUBLIC_API_URL if available, otherwise relative path (assuming proxy) or default localhost
    let rawApiUrl = import.meta.env.PUBLIC_API_URL;
    // Fallback for local development if not set
    if (!rawApiUrl) {
        rawApiUrl = 'http://localhost:8080';
    }

    // Ensure protocol to prevent relative path resolution (fixing 404 on staging)
    if (!rawApiUrl.startsWith('http')) {
        return `https://${rawApiUrl}`;
    }
    return rawApiUrl;
}
