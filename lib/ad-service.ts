// @ts-nocheck
import { supabase } from '@/lib/supabase';

export interface Ad {
    id: string;
    title: string;
    position: 'banner_top' | 'sidebar' | 'inline' | 'sticky_footer' | 'home_hero' | 'article_sidebar' | 'feed_interstitial' | 'column_middle' | 'super_footer';
    image_url: string;
    link_url: string;
    category_id?: string;
    is_active: boolean;
    views: number;
    clicks: number;
    target_countries?: string[];
    target_regions?: string[];
}

export const adService = {
    async getAdByPosition(position: string, categoryId?: string, location?: { country_code?: string, region_code?: string }): Promise<Ad | null> {
        try {
            // Build base query
            let query = supabase
                .from('ads')
                .select('*')
                .eq('position', position)
                .eq('is_active', true)
                .lte('start_date', new Date().toISOString())
                .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`);

            const { data: allAds, error } = await query;
            if (error) throw error;

            let candidateAds = (allAds as Ad[]) || [];

            // 1. Filter by Category match (Priority)
            const categorySpecific = candidateAds.filter(ad => ad.category_id === categoryId);
            const globalAds = candidateAds.filter(ad => !ad.category_id);

            // Choose the pool based on category match availability
            let pool = (categoryId && categorySpecific.length > 0) ? categorySpecific : globalAds;

            // 2. Filter by Location Targeting
            if (location && location.country_code) {
                pool = pool.filter(ad => {
                    const countries = ad.target_countries || [];
                    // If no country targeting, it's global
                    if (countries.length === 0) return true;

                    // Match country
                    const countryMatch = countries.includes(location.country_code);
                    if (!countryMatch) return false;

                    // Match region if specified in ad targeting
                    const regions = ad.target_regions || [];
                    if (regions.length > 0 && location.region_code) {
                        return regions.includes(location.region_code);
                    }

                    return true;
                });
            } else {
                // If no location detected, show only global ads (no targeting)
                pool = pool.filter(ad => !ad.target_countries || ad.target_countries.length === 0);
            }

            if (pool.length === 0) return null;

            // Simple priority: pick first or random from pool
            return pool[0];

        } catch (err) {
            console.error('[AdService] Error fetching ad:', err);
            return null;
        }
    },

    async getRandomAdByPosition(position: string, categoryId?: string, location?: { country_code?: string, region_code?: string }): Promise<Ad | null> {
        // Just reuse the logic above and pick random
        const ad = await this.getAdByPosition(position, categoryId, location);
        return ad;
    },

    async trackView(adId: string) {
        if (!adId) return;
        try {
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
