import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error('Supabase environment variables are missing');
    }

    return createClient(url, key);
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const supabaseAdmin = getSupabaseAdmin();
        const { data, error } = await supabaseAdmin.storage
            .from('blog-assets')
            .upload(filename, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        const { data: { publicUrl } } = getSupabaseAdmin().storage
            .from('blog-assets')
            .getPublicUrl(filename);

        return NextResponse.json({ url: publicUrl });
    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
