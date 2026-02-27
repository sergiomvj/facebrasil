// @ts-nocheck
import { supabase } from '@/lib/supabase';

export interface Ad {
    id: string;
    title: string;
    position: 'super_hero' | 'sidebar' | 'column' | 'super_footer';
    image_url: string;
    link_url: string;
    category_id?: string;
    is_active: boolean;
    views: number;
    clicks: number;
    curiosity_count: number;
    target_countries?: string[];
    target_regions?: string[];
    target_zip_codes?: string[];
}

export const adService = {
    async getAdsByPosition(
        position: string,
        publicationName: string = 'Facebrasil',
        categoryId?: string,
        location?: { country_code?: string, region_code?: string, zip?: string }
    ): Promise<Ad[]> {
        try {
            // 1. Get publication ID
            const { data: pubData } = await supabase
                .from('publications')
                .select('id')
                .eq('name', publicationName)
                .single();

            if (!pubData) return [];

            // 2. Fetch ads linked to this publication through join table
            const { data: adPubData, error: adPubError } = await supabase
                .from('ad_publications')
                .select('ad_id')
                .eq('publication_id', pubData.id);

            if (adPubError || !adPubData || adPubData.length === 0) return [];

            const adIds = adPubData.map(item => item.ad_id);

            // 3. Fetch the ads that are active and within date range
            let query = supabase
                .from('ads')
                .select('*')
                .in('id', adIds)
                .eq('position', position)
                .eq('is_active', true)
                .lte('start_date', new Date().toISOString())
                .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`);

            const { data: allAds, error } = await query;
            if (error) throw error;

            let pool = (allAds as Ad[]) || [];

            // 4. Filter by Category match (Priority)
            if (categoryId) {
                const categorySpecific = pool.filter(ad => ad.category_id === category_id);
                if (categorySpecific.length > 0) {
                    pool = categorySpecific;
                } else {
                    pool = pool.filter(ad => !ad.category_id);
                }
            } else {
                pool = pool.filter(ad => !ad.category_id);
            }

            // 5. Filter by Location Targeting
            if (location) {
                pool = pool.filter(ad => {
                    const countries = ad.target_countries || [];
                    const regions = ad.target_regions || [];
                    const zips = ad.target_zip_codes || [];

                    // If NO targeting fields are defined, it's a GLOBAL ad
                    if (countries.length === 0 && regions.length === 0 && zips.length === 0) {
                        return true;
                    }

                    // ZIP Code Targeting (Highest Priority)
                    if (zips.length > 0 && location.zip) {
                        const zipMatch = zips.some(z => location.zip?.startsWith(z.split('-')[0]));
                        if (zipMatch) return true;
                        // If there are zips but none match, we check if there are also countries/regions
                        if (countries.length === 0 && regions.length === 0) return false;
                    }

                    // Region Targeting
                    if (regions.length > 0 && location.region_code) {
                        const regionMatch = regions.includes(location.region_code);
                        if (regionMatch) return true;
                        if (countries.length === 0) return false;
                    }

                    // Country Targeting
                    if (countries.length > 0 && location.country_code) {
                        return countries.includes(location.country_code);
                    }

                    return false;
                });
            } else {
                // If no location detected, show only ads without geographic restrictions
                pool = pool.filter(ad =>
                    (!ad.target_countries || ad.target_countries.length === 0) &&
                    (!ad.target_regions || ad.target_regions.length === 0) &&
                    (!ad.target_zip_codes || ad.target_zip_codes.length === 0)
                );
            }

            return pool;

        } catch (err) {
            console.error('[AdService] Error fetching ads:', err);
            return [];
        }
    },

    async getAdByPosition(position: string, categoryId?: string, location?: any): Promise<Ad | null> {
        const ads = await this.getAdsByPosition(position, 'Facebrasil', categoryId, location);
        return ads.length > 0 ? ads[0] : null;
    },

    async trackView(adId: string) {
        if (!adId) return;
        try {
            await supabase.rpc('increment_ad_views', { ad_id: adId });
        } catch (err) {
            console.error('Error tracking view', err);
        }
    },

    async trackCuriosity(adId: string) {
        if (!adId) return;
        try {
            await supabase.rpc('increment_ad_curiosity', { ad_id: adId });
        } catch (err) {
            console.error('Error tracking curiosity', err);
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
