import { supabase } from './supabase';

export interface StaticPage {
    id?: string;
    slug: string;
    title: string;
    content: string;
    excerpt?: string;
    featured_image?: string;
    updated_at?: string;
    is_published?: boolean;
    language?: string;
    translation_group_id?: string | null;
}

export async function fetchStaticPages(language?: string) {
    let query = supabase
        .from('static_pages')
        .select('*')
        .order('title', { ascending: true });

    if (language) {
        query = query.eq('language', language);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as StaticPage[];
}

export async function fetchStaticPageBySlug(slug: string, language?: string) {
    let query = supabase
        .from('static_pages')
        .select('*')
        .eq('slug', slug);

    if (language) {
        query = query.eq('language', language);
    }

    const { data, error } = await query.maybeSingle();

    if (error) throw error;
    return data as StaticPage | null;
}

export async function updateStaticPage(slug: string, updates: Partial<StaticPage>) {
    const { data, error } = await supabase
        .from('static_pages')
        .update(updates)
        .eq('slug', slug)
        .select()
        .single();

    if (error) throw error;
    return data as StaticPage;
}

export async function createStaticPage(page: StaticPage) {
    const { data, error } = await supabase
        .from('static_pages')
        .insert([page])
        .select()
        .single();

    if (error) throw error;
    return data as StaticPage;
}
