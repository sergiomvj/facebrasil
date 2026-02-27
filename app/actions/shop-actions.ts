// @ts-nocheck
'use client';

import { supabase } from '@/lib/supabase';

export interface Partner {
    id: string;
    name: string;
    description: string;
    logo_url: string;
    website_url: string;
    category: string;
    is_active: boolean;
}

export interface PartnerOffer {
    id: string;
    partner_id: string;
    title: string;
    description: string;
    offer_type: 'product' | 'service' | 'discount';
    facet_cost: number;
    currency_value?: number;
    discount_percent?: number;
    is_active: boolean;
}

/**
 * Fetch all partners from the shop
 */
export async function fetchPartners() {
    const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('name');

    if (error) throw error;
    return data as Partner[];
}

/**
 * Upsert a partner
 */
export async function upsertPartner(partner: Partial<Partner>, id?: string) {
    if (id) {
        const { data, error } = await supabase
            .from('partners')
            .update(partner)
            .eq('id', id)
            .select()
            .single();
        if (error) return { success: false, error: error.message };
        return { success: true, data };
    } else {
        const { data, error } = await supabase
            .from('partners')
            .insert([partner])
            .select()
            .single();
        if (error) return { success: false, error: error.message };
        return { success: true, data };
    }
}

/**
 * Delete a partner
 */
export async function deletePartner(id: string) {
    const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
}

/**
 * Fetch offers for a specific partner
 */
export async function fetchPartnerOffers(partnerId: string) {
    const { data, error } = await supabase
        .from('partner_offers')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as PartnerOffer[];
}

/**
 * Upsert an offer
 */
export async function upsertOffer(offer: Partial<PartnerOffer>, id?: string) {
    if (id) {
        const { data, error } = await supabase
            .from('partner_offers')
            .update(offer)
            .eq('id', id)
            .select()
            .single();
        if (error) return { success: false, error: error.message };
        return { success: true, data };
    } else {
        const { data, error } = await supabase
            .from('partner_offers')
            .insert([offer])
            .select()
            .single();
        if (error) return { success: false, error: error.message };
        return { success: true, data };
    }
}

/**
 * Delete an offer
 */
export async function deleteOffer(id: string) {
    const { error } = await supabase
        .from('partner_offers')
        .delete()
        .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
}
