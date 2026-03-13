
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregamento manual de env do .env.local
const envPath = path.resolve(__dirname, '.env.local');
const envFile = fs.readFileSync(envPath, 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listRecursive(dir = '') {
    console.log(`Listing [blog-assets] path: "${dir}"`);
    const { data, error } = await supabase.storage.from('blog-assets').list(dir);

    if (error) {
        console.error(`Error listing "${dir}":`, error);
        return [];
    }

    let allFiles = [];
    for (const item of data) {
        const fullPath = dir ? `${dir}/${item.name}` : item.name;
        if (item.id) {
            console.log(`- File: ${fullPath} (ID: ${item.id})`);
            allFiles.push(fullPath);
        } else {
            console.log(`> Dir: ${fullPath}`);
            const sub = await listRecursive(fullPath);
            allFiles = [...allFiles, ...sub];
        }
    }
    return allFiles;
}

async function test() {
    console.log('--- STORAGE RECURSIVE TEST ---');
    const files = await listRecursive('');
    console.log('\nTotal files found recursion:', files.length);
    if (files.length > 0) {
        const testUrl = supabase.storage.from('blog-assets').getPublicUrl(files[0]).data.publicUrl;
        console.log('Sample URL:', testUrl);
    }
}

test();
