import { createClient } from '@supabase/supabase-js';

let client: ReturnType<typeof createClient> | undefined;

export function getSupabaseAdmin() {
    if (client) return client;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase URL or Service Role Key is missing. Check your environment variables.');
    }

    client = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    return client;
}

// Legacy compatibility - exporting an object with getters
export const supabaseAdmin = {
    get auth() { return getSupabaseAdmin().auth; },
    get from() { return (table: string) => getSupabaseAdmin().from(table); },
    // Add other methods as needed, but this covers the essentials used in actions
} as any;
