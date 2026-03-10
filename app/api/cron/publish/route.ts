import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);

        // Optional security if we want to add an API key for vercel cron later
        // const authHeader = req.headers.get('authorization');
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        //     return new Response('Unauthorized', { status: 401 });
        // }

        const now = new Date().toISOString();

        // Find all articles that are DRAFT or DRAFT-IA and their published_at is <= now
        const { data: articles, error: fetchError } = await supabaseAdmin
            .from('articles')
            .select('id, title, status, published_at')
            .in('status', ['DRAFT', 'DRAFT-IA', 'draft', 'draft-ia'])
            .lte('published_at', now);

        if (fetchError) {
            console.error('Fetch error during Cron execution:', fetchError);
            return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
        }

        if (!articles || articles.length === 0) {
            return NextResponse.json({ success: true, message: 'No articles pending publication.', count: 0 });
        }

        // We have articles to publish
        const articleIds = articles.map((a: any) => a.id);

        const { error: updateError } = await supabaseAdmin
            .from('articles')
            .update({
                status: 'PUBLISHED',
                updated_at: new Date().toISOString()
            })
            .in('id', articleIds);

        if (updateError) {
            console.error('Update error during Cron publication:', updateError);
            return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `Successfully published ${articleIds.length} articles.`,
            publishedIds: articleIds
        });

    } catch (error: any) {
        console.error('Cron job error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
