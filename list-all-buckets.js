
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

async function listAll() {
    console.log('--- ALL BUCKETS CONTENT ---');
    const { data: buckets, error: bError } = await supabase.storage.listBuckets();

    if (bError) {
        console.error('Error listing buckets:', bError);
        return;
    }

    for (const bucket of buckets) {
        console.log(`\nBucket: [${bucket.name}] (Public: ${bucket.public})`);
        const { data: files, error: fError } = await supabase.storage.from(bucket.name).list('', { limit: 100 });
        if (fError) {
            console.error(`  Error listing bucket ${bucket.name}:`, fError);
            continue;
        }
        files.forEach(f => {
            console.log(`  - ${f.name} (${f.id ? 'File' : 'Dir'})`);
        });
    }
}

listAll();
