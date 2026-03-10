'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';

export async function runPublishCron() {
    try {
        const now = new Date().toISOString();

        // Find all articles that are DRAFT or DRAFT-IA and their published_at is <= now
        const { data: articles, error: fetchError } = await supabaseAdmin
            .from('articles')
            .select('id')
            .in('status', ['DRAFT', 'DRAFT-IA', 'draft', 'draft-ia'])
            .lte('published_at', now);

        if (fetchError) {
            console.error('[runPublishCron] Fetch error:', fetchError);
            return { success: false, error: fetchError.message };
        }

        if (!articles || articles.length === 0) {
            return { success: true, count: 0 };
        }

        const articleIds = articles.map((a: any) => a.id);

        const { error: updateError } = await supabaseAdmin
            .from('articles')
            .update({
                status: 'PUBLISHED',
                updated_at: new Date().toISOString()
            })
            .in('id', articleIds);

        if (updateError) {
            console.error('[runPublishCron] Update error:', updateError);
            return { success: false, error: updateError.message };
        }

        console.log(`[runPublishCron] Successfully published ${articleIds.length} articles.`);
        return { success: true, count: articleIds.length };
    } catch (error: any) {
        console.error('[runPublishCron] Unexpected error:', error);
        return { success: false, error: error.message };
    }
}
