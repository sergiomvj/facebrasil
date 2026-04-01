import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/waterfall/session?articleId=xxx  — load latest session for article
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const articleId = searchParams.get('articleId');
        if (!articleId) return NextResponse.json({ error: 'articleId obrigatório' }, { status: 400 });

        const { data, error } = await supabaseAdmin
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

// POST /api/waterfall/session  — create or update session
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, article_id, tone, angle, audience, data, images } = body;

        if (!article_id || !data) {
            return NextResponse.json({ error: 'article_id e data são obrigatórios' }, { status: 400 });
        }

        let result;
        if (id) {
            // Update existing
            result = await supabaseAdmin
                .from('waterfall_sessions')
                .update({ tone, angle, audience, data, images: images || {} })
                .eq('id', id)
                .select()
                .single();
        } else {
            // Create new
            result = await supabaseAdmin
                .from('waterfall_sessions')
                .insert({ article_id, tone, angle, audience, data, images: images || {} })
                .select()
                .single();
        }

        if (result.error) throw result.error;
        return NextResponse.json({ success: true, session: result.data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
