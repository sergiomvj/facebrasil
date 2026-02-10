// @ts-nocheck
'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { auth } from '@clerk/nextjs/server';
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
        // Create a basic profile for this admin user if missing
        const { error: profileError } = await supabaseAdmin.from('profiles').insert([
            {
                id: userId,
                name: 'Admin User', // Placeholder, ideally fetch from Clerk if possible
                email: 'admin@facebrasil.com', // Placeholder
                role: 'admin'
            }
        ]);
        if (profileError) {
            console.error('Error auto-creating admin profile:', profileError);
            // Continue anyway, might fail on FK but worth a try or return error
        }
    }

    // Force Author ID to be current user
    const finalPayload: any = { ...payload, author_id: userId };

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

