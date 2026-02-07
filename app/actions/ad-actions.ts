// @ts-nocheck
'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

interface AdPayload {
    title: string;
    position: string;
    image_url?: string;
    link_url: string;
    is_active: boolean;
    category_id?: string | null;
}

export async function upsertAd(payload: AdPayload, id?: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    let result;
    if (id) {
        result = await supabaseAdmin.from('ads').update(payload).eq('id', id).select().single();
    } else {
        result = await supabaseAdmin.from('ads').insert([payload]).select().single();
    }

    if (result.error) {
        console.error('Upsert ad error:', result.error);
        return { success: false, error: result.error.message };
    }

    revalidatePath('/admin/ads');
    revalidatePath('/'); // For homepage ads
    return { success: true, data: result.data };
}

export async function toggleAdStatus(id: string, isActive: boolean) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const { error } = await supabaseAdmin.from('ads').update({ is_active: isActive }).eq('id', id);

    if (error) {
        console.error('Toggle ad status error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/ads');
    revalidatePath('/'); // Revalidate home as ads appear there
    return { success: true };
}

export async function deleteAd(id: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const { error } = await supabaseAdmin.from('ads').delete().eq('id', id);

    if (error) {
        console.error('Delete ad error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/ads');
    revalidatePath('/');
    return { success: true };
}

