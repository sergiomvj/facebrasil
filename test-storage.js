
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testList() {
    console.log('Listing blog-assets root:');
    const { data, error } = await supabase.storage.from('blog-assets').list('');
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log(JSON.stringify(data, null, 2));
}

testList();
