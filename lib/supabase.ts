import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// Lazy initialization to allow build without env vars
let client: ReturnType<typeof createClient> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
    get: (_target, prop) => {
        if (client) {
            // @ts-ignore
            return client[prop];
        }

        const isBuildTime = typeof window === 'undefined' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            if (isBuildTime) {
                console.warn('Supabase URL or Anon Key is missing during build time. Using placeholders.');
            } else {
                throw new Error('Supabase URL or Anon Key is missing. Check your environment variables.');
            }
        }

        client = createClient(supabaseUrl, supabaseKey);
        // @ts-ignore
        return client[prop];
    },
});
