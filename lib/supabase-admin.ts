import { createClient } from '@supabase/supabase-js';

// Function to get the admin client, throwing an error only when accessed if keys are missing.
// This allows the build process to complete without the service role key.
let client: ReturnType<typeof createClient> | undefined;

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
    get: (_target, prop) => {
        if (client) {
            // @ts-ignore
            return client[prop];
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            // Check if we are in a browser environment or build time where this might be expected
            if (typeof window === 'undefined') {
                // Log only once if needed, or suppress.
            }
            throw new Error('Supabase URL or Service Role Key is missing. Check your environment variables.');
        }

        // Initialize the client on first access
        client = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        // @ts-ignore
        return client[prop];
    },
});
