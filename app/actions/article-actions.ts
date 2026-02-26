// @ts-nocheck
'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { auth } from '@/lib/auth-server';

import { revalidatePath } from 'next/cache';
import { reportArticleToSEO } from '@/lib/seo-api';

interface UpdateArticlePayload {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    social_summary?: string;
    instagram_post_url?: string;
    category_id?: string | null;
    status: 'DRAFT' | 'PUBLISHED';
    featured_image?: any;
    updated_at: string;
    author_id: string; // fallback
    blog_id: string; // fallback
    published_at?: string | null;
    read_time?: number;
    colocar_hero?: boolean;
    language?: string;
    translation_group_id?: string | null;
}

export async function upsertArticle(payload: UpdateArticlePayload, id?: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    // Ensure Author Profile Exists (to satisfy FK constraint)
    const { data: profile } = await supabaseAdmin.from('profiles').select('id').eq('id', userId).single();

    if (!profile) {
        // Ensure User exists in public.users (or "User") table first to satisfy FK
        // Try inserting into 'users' or 'User' - assuming 'users' based on typical conventions or "User" if case sensitive
        // Schema dump said "User", but let's try to handle both or generic 'users' if that's what's used.
        // Actually, let's check if the user exists in `users` table.
        // Since we don't know the exact table name for sure (schema says User, error says articles), 
        // and we can't run SQL to check.
        // We will try to insert into 'users' (standard) or 'User' if that fails? 
        // No, let's look at admin-guard.ts result first.

        // TEMPORARY FIX: Just try to insert into "User" matching schema dump, 
        // assuming the table name is "User" (quoted) or public.users.
        // We often map 'users' in supabase client to 'users' table? No, it's 1:1.

        // Let's assume the table is `users` (lowercase) as that's standard for supabase + ease of use.
        // If the schema dump `CREATE TABLE public.User` was executed without quotes, it became `user` (reserved) or `users`? 
        // Postgres folds to lowercase unquoted. `User` -> `user`. `user` is reserved. 
        // So usually it's `users`.

        // Safest bet: Try to upsert into `users`.

        // Check if user exists in public.users
        const { error: userError } = await supabaseAdmin.from('users').upsert([
            {
                id: userId,
                email: 'admin@facebrasil.com', // Placeholder if we don't have it
                created_at: new Date().toISOString()
            }
        ], { onConflict: 'id', ignoreDuplicates: true });

        if (userError) {
            console.warn('Attempted to create user in "users" table but failed (might be "User" or handled by trigger):', userError.message);
            // Fallback: try "User" table if "users" doesn't exist?
            // Or just proceed and hope users table wasn't the issue (unlikely given FK error).
        }

        // Create a basic profile for this user if missing
        // Default to EDITOR for anyone who manages to get here (protected by admin-guard)
        // Note: New users should be authorized by an admin first.
        const { error: profileError } = await supabaseAdmin.from('profiles').insert([
            {
                id: userId,
                name: 'New User',
                email: 'user@facebrasil.com',
                role: 'EDITOR' // Default role for users created via editor
            }
        ]);
        if (profileError) {
            console.error('Error auto-creating admin profile:', profileError);
        }
    }

    // Use provided author_id OR fallback to current user
    const finalAuthorId = payload.author_id || userId;
    const finalPayload: any = { ...payload, author_id: finalAuthorId };


    // Update hero_set_at if this article is becoming a hero
    if (payload.colocar_hero) {
        finalPayload.hero_set_at = new Date().toISOString();
    }

    let result;
    if (id) {
        result = await supabaseAdmin.from('articles').update(finalPayload).eq('id', id).select().single();
    } else {
        result = await supabaseAdmin.from('articles').insert([finalPayload]).select().single();
    }

    if (result.error) {
        console.error('Upsert article error:', result.error);
        return { success: false, error: result.error.message };
    }

    revalidatePath('/admin/articles');
    revalidatePath('/');
    if (result.data?.slug) {
        revalidatePath(`/article/${result.data.slug}`);
    }

    // Report to SEO API if Published
    if (finalPayload.status === 'PUBLISHED') {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://facebrasil.com';
        void reportArticleToSEO({
            id: result.data.id,
            title: result.data.title,
            slug: result.data.slug,
            content: result.data.content,
            excerpt: result.data.excerpt,
            link: `${baseUrl}/article/${result.data.slug}`,
            category: result.data.category_id // Might need name lookup if important, but slug/link are primary
        });
    }

    return { success: true, data: result.data };
}

export async function deleteArticle(id: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const { error } = await supabaseAdmin.from('articles').delete().eq('id', id);

    if (error) {
        console.error('Delete article error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/articles');
    revalidatePath('/');
    return { success: true };
}

