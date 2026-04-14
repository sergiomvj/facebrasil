import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

// GET /api/waterfall/session?articleId=xxx - load latest session for article
export async function GET(req: Request) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { searchParams } = new URL(req.url);
        const articleId = searchParams.get('articleId');
        if (!articleId) return NextResponse.json({ error: 'articleId obrigatorio' }, { status: 400 });

        const { data, error } = await (supabaseAdmin as any)
            .from('waterfall_sessions')
            .select('*')
            .eq('article_id', articleId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        return NextResponse.json({ success: true, session: data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST /api/waterfall/session - create or update session
export async function POST(req: Request) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const body = await req.json();
        const { id, article_id, tone, angle, audience, data, images, slide_images } = body;

        if (!article_id || !data) {
            return NextResponse.json({ error: 'article_id e data sao obrigatorios' }, { status: 400 });
        }

        let result;
        if (id) {
            result = await (supabaseAdmin as any)
                .from('waterfall_sessions')
                .update({ tone, angle, audience, data, images: images || {}, slide_images: slide_images || {} })
                .eq('id', id)
                .select()
                .single();
        } else {
            result = await (supabaseAdmin as any)
                .from('waterfall_sessions')
                .insert({ article_id, tone, angle, audience, data, images: images || {}, slide_images: slide_images || {} })
                .select()
                .single();
        }

        if (result.error) throw result.error;
        return NextResponse.json({ success: true, session: result.data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
