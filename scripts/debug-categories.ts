import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Or Service Role if needed

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
    const slug = 'entretenimento';
    const locale = 'pt';

    console.log(`Testing query for slug: ${slug}, locale: ${locale}`);

    // 1. Check Category
    const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

    console.log('Category Check:', { data: catData, error: catError });

    // 2. Check Articles (Language disabled)
    const { data: rawArticles, error: rawError } = await supabase
        .from('articles')
        .select(`
        id,
        title,
        language,
        status,
        category:categories!inner(name, slug)
    `)
        .eq('status', 'PUBLISHED')
        .eq('category.slug', slug)
        .limit(3);

    console.log('Raw Articles (No Locale Filter):', {
        count: rawArticles?.length,
        sample: rawArticles?.[0],
        error: rawError
    });

    // 3. Check Articles (With Locale Filter)
    const { data: localizedArticles, error: locError } = await supabase
        .from('articles')
        .select(`
       id,
       title,
       language,
       status,
       category:categories!inner(name, slug)
   `)
        .eq('status', 'PUBLISHED')
        .eq('category.slug', slug)
        .eq('language', locale)
        .limit(3);

    console.log('Localized Articles (With pt Filter):', {
        count: localizedArticles?.length,
        sample: localizedArticles?.[0],
        error: locError
    });
}

testQuery();
