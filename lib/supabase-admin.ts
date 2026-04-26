import { createClient } from '@supabase/supabase-js';

let client: ReturnType<typeof createClient> | undefined;

export function getSupabaseAdmin() {
    if (client) return client;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key';

    if ((!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) && process.env.NODE_ENV !== 'production') {
        console.warn('Supabase URL or Service Role Key is missing. Falling back to dummy values for build.');
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
    get storage() { return getSupabaseAdmin().storage; },
    get rpc() { return (...args: any[]) => (getSupabaseAdmin().rpc as any)(...args); },
} as any;

