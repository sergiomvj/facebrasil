'use server';

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { protectAdmin } from "@/lib/admin-guard";
import { revalidatePath } from "next/cache";

export async function getSiteSettings() {
    const { data, error } = await supabaseAdmin
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching site settings:', error);
        return null;
    }

    return data;
}

export async function updateSiteSettings(payload: {
    site_name?: string;
    site_description?: string;
    og_image_url?: string;
    meta_title_template?: string;
    meta_description_template?: string;
}) {
    await protectAdmin();

    const { error } = await supabaseAdmin
        .from('site_settings')
        .upsert({
            id: 1,
            ...payload,
            updated_at: new Date().toISOString()
        });

    if (error) throw new Error(error.message);

    revalidatePath('/', 'layout');
    revalidatePath('/[locale]/admin/settings', 'page');
    return { success: true };
}
