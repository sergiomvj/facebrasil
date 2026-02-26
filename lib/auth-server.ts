import { createClient } from './supabase/server';

/**
 * Server-side helper to get the current user session
 * Replacement for Clerk's auth() in server actions and API routes.
 */
export async function auth() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return { userId: null };
    }

    return { userId: user.id };
}

/**
 * Replacement for Clerk's currentUser()
 */
export async function currentUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}
