import { supabase } from '@/lib/supabase';

export interface Ad {
    id: string;
    title: string;
    position: 'banner_top' | 'sidebar' | 'inline' | 'sticky_footer' | 'home_hero' | 'article_sidebar' | 'feed_interstitial';
    image_url: string;
    link_url: string;
    category_id?: string;
    is_active: boolean;
    views: number;
    clicks: number;
}

export const adService = {
    async getAdByPosition(position: string, categoryId?: string): Promise<Ad | null> {
        try {
            let query = supabase
                .from('ads')
                .select('*')
                .eq('position', position)
                .eq('is_active', true)
                .lte('start_date', new Date().toISOString())
                .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`);

            // Prioritize category specific ads if categoryId is provided
            // Logic: fetch ads that match category OR are global (category_id is null)
            // But we want to prioritize category matches.
            // Supabase simple query: let's fetch all candidates then sort in memory or 
            // use a more complex OR query.
            // For simplicity and performance on small dataset:
            // Fetch strict match first, then fallback to global.

            if (categoryId) {
                const { data: catAds } = await supabase
                    .from('ads')
                    .select('*')
                    .eq('position', position)
                    .eq('is_active', true)
                    .eq('category_id', categoryId)
                    .lte('start_date', new Date().toISOString())
                    .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
                    .limit(1);

                if (catAds && catAds.length > 0) return catAds[0] as Ad;
            }

            // Fallback to global ads (no category)
            const { data: globalAds, error } = await supabase
                .from('ads')
                .select('*')
                .eq('position', position)
                .eq('is_active', true)
                .is('category_id', null)
                .lte('start_date', new Date().toISOString())
                .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
                .limit(1);

            if (error) {
                console.error('Error fetching global ad:', error);
                return null;
            }

            return (globalAds && globalAds.length > 0) ? globalAds[0] as Ad : null;

        } catch (err) {
            console.error('Unexpected error fetching ad:', err);
            return null;
        }
    },

    async getRandomAdByPosition(position: string, categoryId?: string): Promise<Ad | null> {
        try {
            // First try category specific
            if (categoryId) {
                const { data: catAds } = await supabase
                    .from('ads')
                    .select('*')
                    .eq('position', position)
                    .eq('is_active', true)
                    .eq('category_id', categoryId)
                    .lte('start_date', new Date().toISOString())
                    .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`);

                if (catAds && catAds.length > 0) {
                    const randomIndex = Math.floor(Math.random() * catAds.length);
                    return catAds[randomIndex] as Ad;
                }
            }

            // Fallback to global
            const { data: globalAds, error } = await supabase
                .from('ads')
                .select('*')
                .eq('position', position)
                .eq('is_active', true)
                .is('category_id', null)
                .lte('start_date', new Date().toISOString())
                .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`);

            if (error) {
                console.error('Error fetching ads:', error);
                return null;
            }

            if (globalAds && globalAds.length > 0) {
                const randomIndex = Math.floor(Math.random() * globalAds.length);
                return globalAds[randomIndex] as Ad;
            }
            return null;
        } catch (err) {
            console.error('Unexpected error fetching ad:', err);
            return null;
        }
    },

    async trackView(adId: string) {
        if (!adId) return;

        try {
            // Using RPC is better for atomic increments, but simple update works for now
            // or use specific rpc 'increment_ad_views' if we create it.
            // fallback to fetch + update if rpc doesn't exist

            // NOTE: Ideally we should use an RPC function: increment_ad_view(ad_id)
            // For now, let's just use a simple increment via Supabase if possible, or naive approach.
            // Supabase doesn't have direct atomic increment in JS client without RPC.

            // Let's assume high volume isn't an issue yet. Use RPC if available, or skip for now to avoid errors.
            // We'll create a simple RPC in the SQL schema.
            await supabase.rpc('increment_ad_views', { ad_id: adId });
        } catch (err) {
            console.error('Error tracking view', err);
        }
    },

    async trackClick(adId: string) {
        if (!adId) return;
        try {
            await supabase.rpc('increment_ad_clicks', { ad_id: adId });
        } catch (err) {
            console.error('Error tracking click', err);
        }
    }
};
