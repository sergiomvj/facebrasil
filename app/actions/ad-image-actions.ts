// @ts-nocheck
'use server';

import { auth } from '@/lib/auth-server';
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'ads');

const PLACEMENT_SIZES = {
    super_hero: { width: 1240, height: 150 },
    sidebar: { width: 350, height: 350 },
    column: { width: 300, height: 300 },
    super_footer: { width: 1240, height: 250 }
};

/**
 * Validates image dimensions and format, performs conversion if needed.
 */
export async function uploadAdImage(formData: FormData) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const file = formData.get('file') as File;
    const placement = formData.get('placement') as string;
    const advertiserName = formData.get('advertiserName') as string || 'anuncio';

    if (!file || !placement) {
        return { success: false, error: 'Arquivo ou posicionamento ausente.' };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = path.extname(file.name).toLowerCase();

    try {
        // Ensure upload directory exists
        await fs.mkdir(UPLOAD_DIR, { recursive: true });

        // Metadata extraction
        const image = sharp(buffer);
        const metadata = await image.metadata();

        const targetSize = PLACEMENT_SIZES[placement];
        if (!targetSize) {
            return { success: false, error: 'Posicionamento inválido.' };
        }

        // 1. Pixel Size Validation
        if (metadata.width !== targetSize.width || metadata.height !== targetSize.height) {
            return {
                success: false,
                error: `Tamanho inválido. Esperado ${targetSize.width}x${targetSize.height}, recebido ${metadata.width}x${metadata.height}.`
            };
        }

        const safeAdvertiser = advertiserName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const fileName = `${safeAdvertiser}-${placement}-${Date.now()}`;
        let finalPath = '';
        let publicUrl = '';

        // 2. Format Handling & Conversion
        if (extension === '.svg' || extension === '.webp') {
            // Keep original format
            finalPath = path.join(UPLOAD_DIR, `${fileName}${extension}`);
            await fs.writeFile(finalPath, buffer);
            publicUrl = `/ads/${fileName}${extension}`;
        } else {
            // Convert to SVG (as requested by user specifically for bitmap -> svg conversion)
            // We use the wrapper approach to ensure pixel-perfect fidelity in the "SVG" file
            const webpBuffer = await image.webp({ quality: 90 }).toBuffer();
            const base64 = webpBuffer.toString('base64');

            const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="${metadata.width}" height="${metadata.height}" viewBox="0 0 ${metadata.width} ${metadata.height}">
  <image href="data:image/webp;base64,${base64}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
</svg>`.trim();

            finalPath = path.join(UPLOAD_DIR, `${fileName}.svg`);
            await fs.writeFile(finalPath, svgContent);
            publicUrl = `/ads/${fileName}.svg`;
        }

        return { success: true, url: publicUrl };

    } catch (err: any) {
        console.error('Upload error:', err);
        return { success: false, error: 'Erro ao processar imagem: ' + err.message };
    }
}
