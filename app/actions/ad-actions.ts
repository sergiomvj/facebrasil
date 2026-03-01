// @ts-nocheck
'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { auth } from '@/lib/auth-server';
import { revalidatePath } from 'next/cache';

interface AdPayload {
    title: string;
    position: 'super_hero' | 'sidebar' | 'column' | 'super_footer';
    image_url?: string;
    mobile_image_url?: string;
    link_url: string;
    is_active: boolean;
    category_id?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    target_countries?: string[];
    target_regions?: string[];
    target_zip_codes?: string[];
    publication_ids?: string[]; // IDs of publications to show this ad in
}

export async function fetchPublications() {
    const { data, error } = await supabaseAdmin.from('publications').select('*').order('name');
    if (error) {
        console.error('Fetch publications error:', error);
        return [];
    }
    return data;
}

export async function fetchAdPublications(adId: string) {
    const { data, error } = await supabaseAdmin
        .from('ad_publications')
        .select('publication_id')
        .eq('ad_id', adId);

    if (error) {
        console.error('Fetch ad publications error:', error);
        return [];
    }
    return data.map(item => item.publication_id);
}

export async function upsertAd(payload: AdPayload, id?: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const { publication_ids, ...adData } = payload;

    let result;
    if (id) {
        result = await supabaseAdmin.from('ads').update(adData).eq('id', id).select().single();
    } else {
        result = await supabaseAdmin.from('ads').insert([adData]).select().single();
    }

    if (result.error) {
        console.error('Upsert ad error:', result.error);
        return { success: false, error: result.error.message };
    }

    const adId = result.data.id;

    // Manage publication relationships
    if (publication_ids) {
        // Delete existing relations
        await supabaseAdmin.from('ad_publications').delete().eq('ad_id', adId);

        // Insert new relations
        if (publication_ids.length > 0) {
            const relations = publication_ids.map(pubId => ({
                ad_id: adId,
                publication_id: pubId
            }));
            const { error: relError } = await supabaseAdmin.from('ad_publications').insert(relations);
            if (relError) {
                console.error('Ad publications insertion error:', relError);
            }
        }
    }

    revalidatePath('/admin/ads');
    revalidatePath('/');
    return { success: true, data: result.data };
}

export async function toggleAdStatus(id: string, isActive: boolean) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const { error } = await supabaseAdmin.from('ads').update({ is_active: isActive }).eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/ads');
    revalidatePath('/');
    return { success: true };
}

export async function deleteAd(id: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const { error } = await supabaseAdmin.from('ads').delete().eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/ads');
    revalidatePath('/');
    return { success: true };
}
