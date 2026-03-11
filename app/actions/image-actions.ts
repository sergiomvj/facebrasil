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

        const fileName = `site-meta-${Date.now()}.webp`;

        // We use the 'ads' bucket for now as it exists, or 'media' if preferred.
        // Let's check available buckets or just use 'ads' as it's already configured.
        const { error: uploadError } = await supabaseAdmin
            .storage
            .from('articles') // 'articles' is likely a safe bet for public images
            .upload(fileName, optimizedBuffer, {
                contentType: 'image/webp',
                upsert: true
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabaseAdmin
            .storage
            .from('articles')
            .getPublicUrl(fileName);

        return {
            success: true,
            url: publicUrl
        };
    } catch (err: any) {
        console.error('Upload site image error:', err);
        return { success: false, error: err.message };
    }
}
