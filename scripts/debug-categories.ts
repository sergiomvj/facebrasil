import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env 
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
            process.env[key] = value;
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function testQuery() {
    // 1. Get a valid category
    const { data: categories } = await supabase
        .from('categories')
        .select('name, slug')
        .limit(1);

    if (!categories || categories.length === 0) {
        console.log('No categories found.');
        return;
    }

    const slug = categories[0].slug;
    console.log(`Testing query for slug: ${slug}`);

    // 2. Check Articles (Valid Query)
    const { data: rawArticles, error: rawError } = await supabase
        .from('articles')
        .select(`
        id,
        title,
        status,
        category:categories!inner(name, slug)
    `)
        .eq('status', 'PUBLISHED')
        .eq('category.slug', slug)
        .limit(3);

    console.log('Valid Query Results:', {
        count: rawArticles?.length,
        sample: rawArticles?.[0],
        error: rawError
    });
}

testQuery();
