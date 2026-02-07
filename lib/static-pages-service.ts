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
}

export async function fetchStaticPages() {
    const { data, error } = await supabase
        .from('static_pages')
        .select('*')
        .order('title', { ascending: true });

    if (error) throw error;
    return data as StaticPage[];
}

export async function fetchStaticPageBySlug(slug: string) {
    const { data, error } = await supabase
        .from('static_pages')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

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
