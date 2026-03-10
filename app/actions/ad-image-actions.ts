'use server';

import { auth } from '@/lib/auth-server';
import sharp from 'sharp';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const PLACEMENT_SIZES = {
    super_hero: {
        desktop: { width: 1240, height: 150 },
        mobile: { width: 300, height: 50 }
    },
    sidebar: {
        desktop: { width: 350, height: 350 },
        mobile: { width: 300, height: 300 }
    },
    column: {
        desktop: { width: 300, height: 300 },
        mobile: { width: 300, height: 150 }
    },
    super_footer: {
        desktop: { width: 1240, height: 250 },
        mobile: { width: 300, height: 150 }
    }
} as const;

/**
 * Standalone Conversion Action for the Tools section
 */
export async function standaloneConvertImage(formData: FormData) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const file = formData.get('file') as File;
    if (!file) return { success: false, error: 'Arquivo ausente.' };

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const image = sharp(buffer);
        const metadata = await image.metadata();

        const webpBuffer = await image.webp({ quality: 90 }).toBuffer();
        const fileName = `converted-${Date.now()}.webp`;

        const supabaseAdmin = getSupabaseAdmin();
        const { error: uploadError } = await supabaseAdmin
            .storage
            .from('ads')
            .upload(fileName, webpBuffer, {
                contentType: 'image/webp',
                upsert: true
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabaseAdmin
            .storage
            .from('ads')
            .getPublicUrl(fileName);

        return {
            success: true,
            url: publicUrl,
            info: `Convertido para WebP Otimizado (${metadata.width}x${metadata.height}) e salvo no Storage.`
        };
    } catch (err: any) {
        return { success: false, error: 'Erro na conversão: ' + err.message };
    }
}

/**
 * Ad Management Specific Upload with Validation
 */
export async function uploadAdImage(formData: FormData) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const file = formData.get('file') as File;
    const placement = formData.get('placement') as string;
    const deviceType = (formData.get('deviceType') as 'desktop' | 'mobile') || 'desktop';
    const advertiserName = formData.get('advertiserName') as string || 'anuncio';

    if (!file || !placement) {
        return { success: false, error: 'Arquivo ou posicionamento ausente.' };
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    try {
        const image = sharp(buffer);
        const metadata = await image.metadata();

        const config = PLACEMENT_SIZES[placement as keyof typeof PLACEMENT_SIZES];
        if (!config) {
            return { success: false, error: 'Posicionamento inválido.' };
        }

        const targetSize = config[deviceType];

        const safeAdvertiser = advertiserName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const fileName = `${safeAdvertiser}-${placement}-${deviceType}-${Date.now()}.webp`;

        // 2. Format Handling & Auto-Crop Conversion - FORCING WEBP FOR MAXIMUM COMPATIBILITY/PERFORMANCE
        // Instead of strict validation, we force conform the image to the exact needed slot pixels:
        const webpBuffer = await image
            .resize(targetSize.width, targetSize.height, {
                fit: 'cover',
                position: 'center'
            })
            .webp({ quality: 90 })
            .toBuffer();

        // 3. Upload to Supabase Storage
        const supabaseAdmin = getSupabaseAdmin();
        const { error: uploadError } = await supabaseAdmin
            .storage
            .from('ads')
            .upload(fileName, webpBuffer, {
                contentType: 'image/webp',
                upsert: true
            });

        if (uploadError) {
            console.error('[uploadAdImage] Storage upload error:', uploadError);
            throw new Error(`Falha ao subir imagem para o storage: ${uploadError.message}`);
        }

        // 4. Get Public URL
        const { data: { publicUrl: storageUrl } } = supabaseAdmin
            .storage
            .from('ads')
            .getPublicUrl(fileName);

        return {
            success: true,
            url: storageUrl,
            wasConverted: true,
            message: `Upload (${deviceType}) concluído via Supabase Storage.`
        };

    } catch (err: any) {
        console.error('Upload error:', err);
        return { success: false, error: 'Erro ao processar imagem: ' + err.message };
    }
}
