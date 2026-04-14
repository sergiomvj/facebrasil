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

async function findAdmins() {
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, name, role')
        .eq('role', 'ADMIN');
    
    if (error) {
        console.error('Error fetching admins:', error);
        return;
    }
    
    console.log('Admin Users:');
    console.log(JSON.stringify(profiles, null, 2));

    const { data: allRoles, error: rolesError } = await supabase
        .from('profiles')
        .select('role')
        .limit(100);
    
    if (!rolesError) {
        const roles = [...new Set(allRoles.map(p => p.role))];
        console.log('Available Roles in DB:', roles);
    }
}

findAdmins();
