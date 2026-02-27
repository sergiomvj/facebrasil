'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(uid: string, data: { name?: string; avatar_url?: string }) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('profiles')
        .update({
            ...data,
            updated_at: new Date().toISOString()
        })
        .eq('id', uid);

    if (error) {
        console.error('[ProfileActions] Error updating profile:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/', 'layout');
    return { success: true };
}
