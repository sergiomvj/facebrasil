// @ts-nocheck
'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function updateVideoStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    // 1. Verify Authentication (Admin check)
    // Note: detailed role check depends on your clerk setup, checking presence for now.
    const { userId } = await auth();

    if (!userId) {
        return { success: false, error: 'Unauthorized' };
    }

    // 2. Perform Update with Admin Client
    const { error } = await supabaseAdmin
        .from('user_video_reports')
        .update({ status })
        .eq('id', id);

    if (error) {
        console.error('Update video status error:', error);
        return { success: false, error: error.message };
    }

    // 3. Revalidate paths to update UI
    revalidatePath('/admin/video-reports');
    revalidatePath('/eu-reporter/videos');
    revalidatePath('/'); // For homepage

    return { success: true };
}

export async function deleteVideoReport(id: string) {
    const { userId } = await auth();

    if (!userId) {
        return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabaseAdmin
        .from('user_video_reports')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Delete video error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/video-reports');
    revalidatePath('/eu-reporter/videos');
    revalidatePath('/');

    return { success: true };
}

