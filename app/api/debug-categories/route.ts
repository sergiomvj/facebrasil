import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') || 'entretenimento'; // Default test slug
    const locale = searchParams.get('locale') || 'pt';

    // 1. Check Category existence
    const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

    // 2. Check Raw Articles Query (No JS filtering)
    const { data: rawArticles, error: rawError } = await supabase
        .from('articles')
        .select(`
        *,
        author:profiles(name, avatar_url),
        category:categories!inner(name, slug)
    `)
        .eq('status', 'PUBLISHED')
        .eq('category.slug', slug) // Filter provided by Supabase
        // .eq('language', locale) // Commented out to see if language is the blocker
        .limit(5);

    return NextResponse.json({
        categoryCheck: { data: catData, error: catError },
        rawArticles: rawArticles,
        rawError: rawError,
        params: { slug, locale }
    });
}
