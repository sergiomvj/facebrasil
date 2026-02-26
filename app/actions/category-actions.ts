// @ts-nocheck
'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

interface CategoryPayload {
    name: string;
    slug: string;
    color: string;
    parent_id?: string | null;
    escopo?: string[];
    blog_id?: string;
    updated_at: string;
}

export async function upsertCategory(payload: CategoryPayload, id?: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    console.log('--- SERVER ACTION: UPSERT CATEGORY ---');
    console.log('Payload:', payload);
    console.log('ID:', id);

    let finalPayload = { ...payload };

    // Ensure blog_id exists for new categories
    if (!id && !payload.blog_id) {
        const { data: blogs } = await supabaseAdmin.from('blogs').select('id').limit(1);
        if (blogs && blogs.length > 0) {
            finalPayload.blog_id = blogs[0].id;
        } else {
            return { success: false, error: 'No blog found to associate the category with.' };
        }
    }

    let result;
    if (id) {
        result = await supabaseAdmin.from('categories').update(finalPayload).eq('id', id).select();
    } else {
        result = await supabaseAdmin.from('categories').insert([finalPayload]).select();
    }

    if (result.error) {
        console.error('Category Upsert Error:', result.error);
        return { success: false, error: result.error.message };
    }

    revalidatePath('/admin/categories');
    revalidatePath('/admin/articles');
    revalidatePath('/');

    return { success: true, data: result.data };
}

export async function deleteCategory(id: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);

    if (error) {
        console.error('Delete category error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/categories');
    return { success: true };
}
