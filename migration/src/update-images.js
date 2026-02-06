import fs from 'fs/promises';
import xml2js from 'xml2js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const config = {
    xmlFile: process.env.XML_FILES?.split(',')[0] || './data/revistafacebrasil.xml',
    dryRun: process.argv.includes('--dry-run'),
    pageSize: 1000
};

// Extrair texto de campos XML
const getText = (field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (field._) return field._;
    if (typeof field === 'object') return JSON.stringify(field);
    return String(field);
};

async function parseXML() {
    console.log(chalk.blue(`\n📄 Lendo ${config.xmlFile}...\n`));

    const xmlContent = await fs.readFile(config.xmlFile, 'utf-8');
    const parser = new xml2js.Parser({
        explicitArray: false,
        mergeAttrs: true,
        trim: true
    });

    const result = await parser.parseStringPromise(xmlContent);
    const items = result.rss.channel.item || [];
    const posts = Array.isArray(items) ? items : [items];

    console.log(chalk.green(`✓ Encontrados ${posts.length} posts no XML\n`));

    return posts;
}

function extractFeaturedImage(wpPost) {
    // Método 1: wp:attachment_url (mais confiável)
    if (wpPost['wp:attachment_url']) {
        const url = getText(wpPost['wp:attachment_url']);
        if (url && url.startsWith('http')) {
            return url;
        }
    }

    // Método 2: Primeira imagem no conteúdo
    const content = getText(wpPost['content:encoded']) || '';
    const imageMatch = content.match(/<img[^>]+src="([^">]+)"/);
    if (imageMatch && imageMatch[1].startsWith('http')) {
        return imageMatch[1];
    }

    // Método 3: Buscar em wp:postmeta por _wp_attached_file
    const postmeta = wpPost['wp:postmeta'];
    if (postmeta) {
        const metaArray = Array.isArray(postmeta) ? postmeta : [postmeta];

        const attachedFile = metaArray.find(m =>
            getText(m['wp:meta_key']) === '_wp_attached_file'
        );

        if (attachedFile) {
            const filename = getText(attachedFile['wp:meta_value']);
            if (filename && !filename.startsWith('http')) {
                return `https://revistafacebrasil.com/wp-content/uploads/${filename}`;
            }
        }
    }

    return null;
}

async function getAllArticles() {
    console.log(chalk.blue('🔍 Buscando TODOS os artigos do Supabase (com paginação)...\n'));

    const allArticles = [];
    let page = 0;
    let hasMore = true;

    while (hasMore) {
        const from = page * config.pageSize;
        const to = from + config.pageSize - 1;

        const { data, error } = await supabase
            .from('articles')
            .select('id, slug, featured_image')
            .range(from, to)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
            allArticles.push(...data);
            console.log(chalk.gray(`  Página ${page + 1}: ${data.length} artigos (total: ${allArticles.length})`));
            page++;
            hasMore = data.length === config.pageSize;
        } else {
            hasMore = false;
        }
    }

    console.log(chalk.green(`\n✓ Total de artigos carregados: ${allArticles.length}\n`));

    return allArticles;
}

async function updateArticleImages() {
    console.log(chalk.bold.cyan('\n🖼️  Atualizando Imagens dos Artigos\n'));

    try {
        // 1. Parsear XML
        const wpPosts = await parseXML();

        // 2. Filtrar apenas posts publicados
        const publishedPosts = wpPosts.filter(post => {
            const status = getText(post['wp:status']) || 'publish';
            return status === 'publish';
        });

        console.log(chalk.blue(`📊 Posts publicados: ${publishedPosts.length}\n`));

        // 3. Buscar TODOS os artigos do Supabase (com paginação)
        const existingArticles = await getAllArticles();

        // Criar mapa slug → article
        const articleMap = new Map();
        existingArticles.forEach(article => {
            articleMap.set(article.slug, article);
        });

        // 4. Criar mapa de imagens do WordPress
        console.log(chalk.blue('🔄 Extraindo imagens do XML...\n'));

        const imageMap = new Map();
        let xmlWithImages = 0;

        for (const wpPost of publishedPosts) {
            const title = getText(wpPost.title) || 'Untitled';

            const slug = title
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');

            const imageUrl = extractFeaturedImage(wpPost);

            if (imageUrl) {
                imageMap.set(slug, imageUrl);
                xmlWithImages++;
            }
        }

        console.log(chalk.green(`✓ Imagens extraídas do XML: ${xmlWithImages}\n`));

        // 5. Atualizar artigos
        console.log(chalk.blue('💾 Atualizando artigos...\n'));

        let updated = 0;
        let alreadyHasImage = 0;
        let noImageInXml = 0;

        for (const article of existingArticles) {
            // Pular se já tem imagem
            if (article.featured_image) {
                alreadyHasImage++;
                continue;
            }

            // Buscar imagem no mapa
            const imageUrl = imageMap.get(article.slug);

            if (!imageUrl) {
                noImageInXml++;
                continue;
            }

            // Atualizar artigo
            if (!config.dryRun) {
                const { error: updateError } = await supabase
                    .from('articles')
                    .update({ featured_image: imageUrl })
                    .eq('id', article.id);

                if (updateError) {
                    console.log(chalk.red(`  ✗ Erro ao atualizar "${article.slug}": ${updateError.message}`));
                    continue;
                }
            }

            updated++;

            if (updated % 100 === 0) {
                console.log(chalk.gray(`  Processados: ${updated}...`));
            }
        }

        // 6. Estatísticas finais
        console.log(chalk.bold.green(`\n\n✅ Processamento Concluído!\n`));
        console.log(chalk.gray('Estatísticas:'));
        console.log(chalk.green(`  ✓ Artigos atualizados: ${updated}`));
        console.log(chalk.cyan(`  📸 Artigos que já tinham imagem: ${alreadyHasImage}`));
        console.log(chalk.yellow(`  ⊘ Artigos sem imagem no XML: ${noImageInXml}`));
        console.log(chalk.blue(`  📊 Total de artigos processados: ${existingArticles.length}`));

        const totalWithImages = alreadyHasImage + updated;
        const percentage = ((totalWithImages / existingArticles.length) * 100).toFixed(1);
        console.log(chalk.bold.cyan(`\n🎯 Cobertura total de imagens: ${percentage}% (${totalWithImages}/${existingArticles.length})\n`));

        if (config.dryRun) {
            console.log(chalk.yellow('⚠ DRY RUN - Nenhuma alteração foi feita no banco\n'));
        }

    } catch (error) {
        console.error(chalk.red('\n❌ Erro fatal:'), error.message);
        console.error(error);
        process.exit(1);
    }
}

updateArticleImages();
