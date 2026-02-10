import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    console.log('[Upload API] Request received');
    try {
        const formData = await req.formData();
        const file = formData.get('image') as File;

        if (!file) {
            console.error('[Upload API] No image provided');
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        console.log(`[Upload API] Uploading file: ${file.name} (${file.size} bytes)`);

        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

        const { data, error } = await supabaseAdmin.storage
            .from('blog-assets')
            .upload(filename, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('[Upload API] Supabase error:', error);
            throw error;
        }

        console.log('[Upload API] Upload successful, getting public URL...');

        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('blog-assets')
            .getPublicUrl(filename);

        console.log('[Upload API] Success:', publicUrl);
        return NextResponse.json({ url: publicUrl });
    } catch (error: any) {
        console.error('[Upload API] Catch Error:', error);
        return NextResponse.json({
            error: error.message || 'Erro interno no servidor de upload',
            details: error.toString()
        }, { status: 500 });
    }
}
