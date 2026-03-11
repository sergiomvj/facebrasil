'use server';

import { auth } from '@/lib/auth-server';
import sharp from 'sharp';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function uploadSiteImage(formData: FormData) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Não autorizado' };

    const file = formData.get('file') as File;
    if (!file) return { success: false, error: 'Arquivo ausente' };

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const image = sharp(buffer);

        // Resize to OG standard if too large, but keep aspect ratio
        const optimizedBuffer = await image
            .resize(1200, 630, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: 85 })
            .toBuffer();

        const fileName = `site-settings/${Date.now()}.webp`;

        // Using 'blog-assets' which we know exists from database inspection
        const { error: uploadError } = await supabaseAdmin
            .storage
            .from('blog-assets')
            .upload(fileName, optimizedBuffer, {
                contentType: 'image/webp',
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            console.error('Supabase Storage Upload Error:', uploadError);
            return { success: false, error: `Erro no Supabase: ${uploadError.message}` };
        }

        const { data: { publicUrl } } = supabaseAdmin
            .storage
            .from('blog-assets')
            .getPublicUrl(fileName);

        return {
            success: true,
            url: publicUrl
        };
    } catch (err: any) {
        console.error('Critical Upload Error:', err);
        return {
            success: false,
            error: err.message || 'Erro interno no processamento da imagem'
        };
    }
}
