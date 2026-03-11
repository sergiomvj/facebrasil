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
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.getUser();
        if (error || !data) return null;
        return data.user || null;
    } catch {
        return null;
    }
}
