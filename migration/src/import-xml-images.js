import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import xml2js from 'xml2js';
import chalk from 'chalk';

dotenv.config();

const config = {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_KEY,
    postsXml: './data/revistafacebrasil.xml',
    mediaXml: './data/revistafacebrasilmedia.xml',
};

const supabase = createClient(config.supabaseUrl, config.supabaseKey);

async function parseXml(filePath) {
    console.log(chalk.blue(`📖 Lendo ${filePath}...`));
    const content = fs.readFileSync(filePath, 'utf-8');
    const parser = new xml2js.Parser({ explicitArray: false });
    return await parser.parseStringPromise(content);
}

async function run() {
    try {
        // 1. Parsear Mídias (Mapear ID da Imagem -> URL)
        const mediaResult = await parseXml(config.mediaXml);
        const mediaItems = Array.isArray(mediaResult.rss.channel.item) ? mediaResult.rss.channel.item : [mediaResult.rss.channel.item];

        const mediaMap = new Map(); // attachment_id -> url
        mediaItems.forEach(item => {
            const id = item['wp:post_id'];
            const url = item['wp:attachment_url'];
            if (id && url) mediaMap.set(id, url);
        });
        console.log(chalk.green(`✓ Mapeadas ${mediaMap.size} mídias.`));

        // 2. Parsear Posts (Mapear Slug -> ID da Imagem de Destaque)
        const postsResult = await parseXml(config.postsXml);
        const postItems = Array.isArray(postsResult.rss.channel.item) ? postsResult.rss.channel.item : [postsResult.rss.channel.item];

        const slugToImageMap = new Map(); // slug -> imageUrl
        let linkedCount = 0;

        postItems.forEach(item => {
            const slug = item['wp:post_name'];
            let meta = item['wp:postmeta'];
            if (!meta) return;
            if (!Array.isArray(meta)) meta = [meta];

            const thumbnailMeta = meta.find(m => m['wp:meta_key'] === '_thumbnail_id');
            if (thumbnailMeta && thumbnailMeta['wp:meta_value']) {
                const thumbId = thumbnailMeta['wp:meta_value'];
                const imageUrl = mediaMap.get(thumbId);
                if (imageUrl && slug) {
                    slugToImageMap.set(slug, imageUrl);
                    linkedCount++;
                }
            }
        });
        console.log(chalk.green(`✓ Relacionados ${linkedCount} artigos com imagens.`));

        // 3. Atualizar Supabase
        console.log(chalk.blue('\n🚀 Atualizando Supabase...'));
        const slugs = Array.from(slugToImageMap.keys());
        let updated = 0;
        let errors = 0;

        for (let i = 0; i < slugs.length; i += 50) {
            const batchSlugs = slugs.slice(i, i + 50);

            const promises = batchSlugs.map(async (slug) => {
                const imageUrl = slugToImageMap.get(slug);
                const { error } = await supabase
                    .from('articles')
                    .update({
                        featured_image: {
                            url: imageUrl,
                            alt: '' // Poderia capturar o título original aqui se necessário
                        }
                    })
                    .eq('slug', slug);

                if (error) {
                    errors++;
                } else {
                    updated++;
                }
            });

            await Promise.all(promises);
            process.stdout.write(`Progresso: ${updated + errors} / ${slugs.length}\r`);
        }

        console.log(chalk.bold.green(`\n\n✅ Concluído!`));
        console.log(`- Artigos atualizados: ${updated}`);
        console.log(`- Erros: ${errors}`);

    } catch (err) {
        console.error(chalk.red('\n❌ Erro fatal:'), err);
    }
}

run();
