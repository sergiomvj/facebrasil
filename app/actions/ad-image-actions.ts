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

        // Retornar Base64 para garantir que o atributo 'download' funcione no navegador sem problemas de CORS
        const base64Str = webpBuffer.toString('base64');
        const finalUrl = `data:image/webp;base64,${base64Str}`;

        return {
            success: true,
            url: finalUrl,
            info: `Convertido para WebP Otimizado (${metadata.width}x${metadata.height}). Pronto para download.`
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
        console.log(`[UPLOAD AD] Recebendo arquivo ${file.name} - Tamanho original: ${buffer.length} bytes`);
        const image = sharp(buffer);
        const metadata = await image.metadata();
        console.log(`[UPLOAD AD] Metadata da imagem fonte: ${metadata.width}x${metadata.height} formato: ${metadata.format}`);

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

        console.log(`[UPLOAD AD] Imagem convertida para WEBP. Tamanho final: ${webpBuffer.length} bytes`);

        // PLANO B DE EMERGÊNCIA (Base64 Direto no Banco):
        // Ignora complemente a Supabase Storage, problemas de CORS, e cache Edge da Vercel.
        const base64Str = webpBuffer.toString('base64');
        const finalUrl = `data:image/webp;base64,${base64Str}`;

        console.log(`[UPLOAD AD] Gerado Base64. Upload Storage ignorado (Opção 2 - Plano B).`);

        return {
            success: true,
            url: finalUrl,
            wasConverted: true,
            message: `Upload (${deviceType}) convertido para Base64 com sucesso. (Opção de Emergência)`
        };

    } catch (err: any) {
        console.error('Upload error:', err);
        return { success: false, error: 'Erro ao processar imagem: ' + err.message };
    }
}
