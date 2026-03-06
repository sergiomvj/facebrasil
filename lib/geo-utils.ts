export interface GeoLocation {
    country_code: string; // ISO Code e.g. BR, US
    region_code?: string; // e.g. FL, NY, SP
    city?: string;
    zip?: string;
}

// Module-level cache so all AdSpace instances share one result per session
let cached: GeoLocation | null | undefined = undefined;
let inFlight: Promise<GeoLocation | null> | null = null;

export async function detectLocation(): Promise<GeoLocation | null> {
    if (cached !== undefined) return cached;

    // Deduplicate concurrent calls: return the same promise if one is already running
    if (inFlight) return inFlight;

    inFlight = fetch('/api/geo')
        .then(res => {
            if (!res.ok) return null;
            return res.json() as Promise<GeoLocation | null>;
        })
        .catch(() => null)
        .finally(() => {
            inFlight = null;
        });

    cached = await inFlight;
    return cached;
}
