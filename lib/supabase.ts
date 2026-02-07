import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Lazy initialization to allow build without env vars
let client: ReturnType<typeof createClient> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
    get: (_target, prop) => {
        if (client) {
            // @ts-ignore
            return client[prop];
        }

        if (!supabaseUrl || !supabaseKey) {
            if (typeof window === 'undefined') {
                // Build time or server side without keys
                // Return a dummy that logs or throws on usage?
                // For build safety, maybe just log warning.
            }
            // If we really need to crash on client:
            throw new Error('Supabase URL or Anon Key is missing. Check your environment variables.');
        }

        client = createClient(supabaseUrl, supabaseKey);
        // @ts-ignore
        return client[prop];
    },
});
