import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch('https://ipapi.co/json/', {
            next: { revalidate: 3600 },
            headers: { 'User-Agent': 'fbr.news/1.0' },
        });

        if (!response.ok) {
            return NextResponse.json(null, {
                headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60' },
            });
        }

        const data = await response.json();

        const location = {
            country_code: data.country_code,
            region_code: data.region_code || data.region,
            city: data.city,
            zip: data.postal || data.zip,
        };

        return NextResponse.json(location, {
            headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
        });
    } catch {
        return NextResponse.json(null, {
            headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60' },
        });
    }
}
