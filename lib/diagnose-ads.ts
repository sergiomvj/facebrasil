import { supabase } from './supabase';

export async function diagnoseAds() {
    const { data, error } = await supabase.from('ads').select('id, title, image_url, mobile_image_url, position');
    if (error) {
        console.error('[Diagnose] Error:', error);
        return { success: false, error: error.message };
    }
    console.log('[Diagnose] Ads found:', data);
    return { success: true, data };
}
