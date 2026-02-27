// @ts-nocheck

export interface GeoLocation {
    country_code: string; // ISO Code e.g. BR, US
    region_code?: string; // e.g. FL, NY, SP
    city?: string;
    zip?: string;
}

/**
 * Detects the user's location via a free IP Geolocation API.
 */
export async function detectLocation(): Promise<GeoLocation | null> {
    try {
        const response = await fetch('https://ipapi.co/json/', {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) return null;

        const data = await response.json();

        return {
            country_code: data.country_code,
            region_code: data.region_code || data.region,
            city: data.city,
            zip: data.postal || data.zip
        };
    } catch (error) {
        console.warn('[GeoUtils] Failed to detect location:', error);
        return null;
    }
}
