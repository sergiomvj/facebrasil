// @ts-nocheck
'use server';

import { auth } from '@/lib/auth-server';
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'ads');

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
};

/**
 * Generic Image to SVG Converter Logic
 */
async function convertToSvgWrapper(buffer: Buffer, width: number, height: number): Promise<string> {
    const webpBuffer = await sharp(buffer)
        .webp({ quality: 90 })
        .toBuffer();

    const base64 = webpBuffer.toString('base64');

    return `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image href="data:image/webp;base64,${base64}" xlink:href="data:image/webp;base64,${base64}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
</svg>`.trim();
}

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

        const svgContent = await convertToSvgWrapper(buffer, metadata.width as number, metadata.height as number);
        const fileName = `converted-${Date.now()}.svg`;
        const finalPath = path.join(UPLOAD_DIR, fileName);

        await fs.mkdir(UPLOAD_DIR, { recursive: true });
        await fs.writeFile(finalPath, svgContent);

        return {
            success: true,
            url: `/ads/${fileName}`,
            info: `Convertido de ${path.extname(file.name)} para SVG (${metadata.width}x${metadata.height})`
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
    const extension = path.extname(file.name).toLowerCase();

    try {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });

        const image = sharp(buffer);
        const metadata = await image.metadata();

        const config = PLACEMENT_SIZES[placement];
        if (!config) {
            return { success: false, error: 'Posicionamento inválido.' };
        }

        const targetSize = config[deviceType];

        // 1. Pixel Size Validation
        if (metadata.width !== targetSize.width || metadata.height !== targetSize.height) {
            return {
                success: false,
                error: `Tamanho inválido para ${deviceType}. Esperado ${targetSize.width}x${targetSize.height}, recebido ${metadata.width}x${metadata.height}.`
            };
        }

        const safeAdvertiser = advertiserName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const fileName = `${safeAdvertiser}-${placement}-${deviceType}-${Date.now()}`;
        let finalPath = '';
        let publicUrl = '';
        let wasConverted = false;

        // 2. Format Handling & Conversion
        const supportedDirect = ['.svg', '.webp'];
        if (supportedDirect.includes(extension)) {
            finalPath = path.join(UPLOAD_DIR, `${fileName}${extension}`);
            await fs.writeFile(finalPath, buffer);
            publicUrl = `/ads/${fileName}${extension}`;
        } else {
            // Automatic Conversion to WebP (Cleaner and more compatible than SVG-wrapping)
            const webpBuffer = await sharp(buffer)
                .webp({ quality: 90 })
                .toBuffer();

            finalPath = path.join(UPLOAD_DIR, `${fileName}.webp`);
            await fs.writeFile(finalPath, webpBuffer);
            publicUrl = `/ads/${fileName}.webp`;
            wasConverted = true;
        }

        return {
            success: true,
            url: publicUrl,
            wasConverted,
            message: wasConverted ? `Imagem (${deviceType}) convertida automaticamente para SVG.` : `Upload (${deviceType}) concluído.`
        };

    } catch (err: any) {
        console.error('Upload error:', err);
        return { success: false, error: 'Erro ao processar imagem: ' + err.message };
    }
}
