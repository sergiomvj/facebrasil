const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function parseEnv(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            env[parts[0].trim()] = parts.slice(1).join('=').trim();
        }
    });
    return env;
}

const envConfig = parseEnv('.env.local');
const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

async function checkProfiles() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(10);
    
    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }
    
    console.log('Profiles:');
    console.log(JSON.stringify(data, null, 2));
}

checkProfiles();
