import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';
import fs from 'fs/promises';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const config = {
    baseUrl: 'https://facebrasil.com',
    dryRun: process.argv.includes('--dry-run'),
    batchSize: 50, // Processar 50 por vez
    delayMs: 500, // Delay entre requests (500ms)
    maxRetries: 3,
    headless: true
};

async function getAllArticlesWithoutImages() {
    console.log(chalk.blue('🔍 Buscando artigos sem imagem...\n'));

    const allArticles = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error } = await supabase
            .from('articles')
            .select('id, slug, title')
            .is('featured_image', null)
            .range(from, to)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
            allArticles.push(...data);
            console.log(chalk.gray(`  Página ${page + 1}: ${data.length} artigos (total: ${allArticles.length})`));
            page++;
            hasMore = data.length === pageSize;
        } else {
            hasMore = false;
        }
    }

    console.log(chalk.green(`\n✓ Total de artigos sem imagem: ${allArticles.length}\n`));
    return allArticles;
}

async function extractImageFromPage(page, url) {
    try {
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Tentar múltiplos métodos de extração
        const imageUrl = await page.evaluate(async () => {
            const delay = (ms) => new Promise(res => setTimeout(res, ms));

            // Scroll suave para carregar imagens lazy-load
            window.scrollBy(0, 500);
            await delay(200);
            window.scrollBy(0, 500);
            await delay(200);

            // Método 0: Pinterest Share Link (Geralmente contém a featured image real)
            const pinterestLink = document.querySelector('a[href*="pinterest.com/pin/create/button"]');
            if (pinterestLink?.href) {
                try {
                    const urlParams = new URLSearchParams(pinterestLink.href.split('?')[1]);
                    const media = urlParams.get('media');
                    if (media && !media.includes('gravatar.com')) return media;
                } catch (e) { }
            }

            // Método 1: Seletores específicos do tema Newspaper/TagDiv (vistos no HTML)
            const themeImage = document.querySelector('.tdb_single_featured_image img, img.entry-thumb, .td-modal-image');
            if (themeImage?.src && !themeImage.src.includes('gravatar.com')) return themeImage.src;

            // Método 2: og:image
            const ogImage = document.querySelector('meta[property="og:image"]');
            if (ogImage?.content && !ogImage.content.includes('gravatar.com')) return ogImage.content;

            // Método 2: twitter:image
            const twitterImage = document.querySelector('meta[name="twitter:image"]');
            if (twitterImage?.content && !twitterImage.content.includes('gravatar.com')) return twitterImage.content;

            // Método 3: wp-post-image (WordPress)
            const wpImage = document.querySelector('.wp-post-image');
            if (wpImage?.src && !wpImage.src.includes('gravatar.com')) return wpImage.src;

            // Método 4: Primeira imagem no article
            const articleImage = document.querySelector('article img');
            if (articleImage?.src && !articleImage.src.includes('gravatar.com') && !articleImage.src.includes('avatar')) return articleImage.src;

            // Método 5: Qualquer imagem grande (>300px) que não seja gravatar
            const images = Array.from(document.querySelectorAll('img'));
            const largeImage = images.find(img => {
                const src = img.src.toLowerCase();
                return img.naturalWidth > 300 &&
                    img.naturalHeight > 200 &&
                    !src.includes('logo') &&
                    !src.includes('icon') &&
                    !src.includes('gravatar.com') &&
                    !src.includes('avatar');
            });
            if (largeImage?.src) return largeImage.src;

            return null;
        });

        // Verificação extra fora do browser: se for gravatar, ignorar
        if (imageUrl && (imageUrl.includes('gravatar.com') || imageUrl.includes('avatar'))) {
            return null;
        }

        return imageUrl;

    } catch (error) {
        console.log(chalk.red(`  ✗ Erro ao acessar ${url}: ${error.message}`));
        return null;
    }
}

async function scrapeImages() {
    console.log(chalk.bold.cyan('\n🕷️  Iniciando Scraping de Imagens com Puppeteer\n'));

    let browser;
    const errorLog = [];
    const successLog = [];

    try {
        // 1. Buscar artigos sem imagem
        const articles = await getAllArticlesWithoutImages();

        if (articles.length === 0) {
            console.log(chalk.green('✅ Todos os artigos já têm imagem!\n'));
            return;
        }

        console.log(chalk.blue(`🎯 Artigos para processar: ${articles.length}\n`));

        // 2. Iniciar browser
        console.log(chalk.blue('🌐 Iniciando navegador...\n'));
        browser = await puppeteer.launch({
            headless: config.headless,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        // 3. Processar em lotes
        let processed = 0;
        let updated = 0;
        let failed = 0;

        console.log(chalk.blue('🔄 Processando artigos...\n'));

        for (let i = 0; i < articles.length; i++) {
            const article = articles[i];
            const url = `${config.baseUrl}/${article.slug}/`;

            try {
                // Extrair imagem
                const imageUrl = await extractImageFromPage(page, url);

                if (imageUrl) {
                    // Atualizar no banco
                    if (!config.dryRun) {
                        const { error } = await supabase
                            .from('articles')
                            .update({
                                featured_image: {
                                    url: imageUrl,
                                    alt: article.title
                                }
                            })
                            .eq('id', article.id);

                        if (error) {
                            throw error;
                        }
                    }

                    updated++;
                    successLog.push({ slug: article.slug, imageUrl });
                    console.log(chalk.green(`  ✓ [${i + 1}/${articles.length}] ${article.slug}`));
                } else {
                    failed++;
                    errorLog.push({ slug: article.slug, error: 'Nenhuma imagem encontrada' });
                    console.log(chalk.yellow(`  ⊘ [${i + 1}/${articles.length}] ${article.slug} - sem imagem`));
                }

                processed++;

                // Progress a cada 50 artigos
                if (processed % 50 === 0) {
                    const percentage = ((processed / articles.length) * 100).toFixed(1);
                    console.log(chalk.cyan(`\n  📊 Progresso: ${processed}/${articles.length} (${percentage}%)\n`));
                }

                // Delay entre requests
                await new Promise(resolve => setTimeout(resolve, config.delayMs));

            } catch (error) {
                failed++;
                errorLog.push({ slug: article.slug, error: error.message });
                console.log(chalk.red(`  ✗ [${i + 1}/${articles.length}] ${article.slug} - ${error.message}`));
            }
        }

        // 4. Salvar logs
        await fs.writeFile(
            './scraping-errors.json',
            JSON.stringify(errorLog, null, 2)
        );

        await fs.writeFile(
            './scraping-success.json',
            JSON.stringify(successLog, null, 2)
        );

        // 5. Estatísticas finais
        console.log(chalk.bold.green(`\n\n✅ Scraping Concluído!\n`));
        console.log(chalk.gray('Estatísticas:'));
        console.log(chalk.green(`  ✓ Imagens encontradas: ${updated}`));
        console.log(chalk.yellow(`  ⊘ Sem imagem: ${failed}`));
        console.log(chalk.blue(`  📊 Total processado: ${processed}`));

        const successRate = ((updated / processed) * 100).toFixed(1);
        console.log(chalk.bold.cyan(`\n🎯 Taxa de sucesso: ${successRate}%\n`));

        if (config.dryRun) {
            console.log(chalk.yellow('⚠ DRY RUN - Nenhuma alteração foi feita no banco\n'));
        }

        console.log(chalk.gray(`📁 Logs salvos em:`));
        console.log(chalk.gray(`  - scraping-errors.json`));
        console.log(chalk.gray(`  - scraping-success.json\n`));

    } catch (error) {
        console.error(chalk.red('\n❌ Erro fatal:'), error.message);
        console.error(error);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

scrapeImages();
