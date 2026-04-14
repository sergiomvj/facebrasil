import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

// GET /api/waterfall/social-credentials - load all credentials
export async function GET() {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { data, error } = await (supabaseAdmin as any)
            .from('social_credentials')
            .select('platform, credentials');

        if (error) throw error;
        return NextResponse.json({ success: true, credentials: data || [] });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST /api/waterfall/social-credentials - upsert credentials for a platform
export async function POST(req: Request) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { platform, credentials } = await req.json();
        if (!platform || !credentials) {
            return NextResponse.json({ error: 'platform e credentials obrigatorios' }, { status: 400 });
        }

        const { error } = await (supabaseAdmin as any)
            .from('social_credentials')
            .upsert({ platform, credentials, updated_at: new Date().toISOString() }, { onConflict: 'platform' });

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
