
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

/**
 * Script de Automação de Analytics - Facebrasil
 * Regras:
 * - Artigos (< 7 dias): 
 *    - < 24h: +1 view a cada 3 minutos
 *    - > 24h: +1 view a cada 15 minutos
 * - Anúncios (Ativos): 
 *    - +1 view a cada 15 minutos
 */

async function runAutomation() {
    console.log(`[${new Date().toISOString()}] Iniciando automação de analytics...`);

    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error('Arquivo .env.local não encontrado na raiz do projeto.');
        return;
    }

    const envFile = fs.readFileSync(envPath, 'utf-8');
    const env = {};
    envFile.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            env[key.trim()] = valueParts.join('=').trim();
        }
    });

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const currentMinute = now.getMinutes();
    let updatedCount = 0;

    // 1. Processar Artigos
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: articles, error: artError } = await supabase
        .from('articles')
        .select('id, title, published_at, views')
        .gte('published_at', sevenDaysAgo)
        .eq('status', 'PUBLISHED');

    if (artError) {
        console.error('Erro ao buscar artigos:', artError);
    } else if (articles) {
        console.log(`Analisando ${articles.length} artigos recentes...`);
        for (const article of articles) {
            const pubDate = new Date(article.published_at);
            const ageInHours = (now - pubDate) / (1000 * 60 * 60);
            let shouldIncrement = false;

            if (ageInHours < 24) {
                // < 24h -> Incrementa sempre (assume-se que o script roda a cada 3 min)
                shouldIncrement = true;
            } else if (currentMinute % 15 === 0) {
                // > 24h -> Incrementa a cada 15 min
                shouldIncrement = true;
            }

            if (shouldIncrement) {
                const { error: updErr } = await supabase.rpc('increment_article_views', { article_id: article.id });
                if (updErr) {
                    await supabase.from('articles').update({ views: (article.views || 0) + 1 }).eq('id', article.id);
                }
                updatedCount++;
            }
        }
    }

    // 2. Processar Anúncios
    const { data: ads, error: adsError } = await supabase
        .from('ads')
        .select('id, views')
        .eq('is_active', true);

    if (adsError) {
        console.error('Erro ao buscar anúncios:', adsError);
    } else if (ads && currentMinute % 15 === 0) {
        console.log(`Incrementando views para ${ads.length} anúncios ativos...`);
        for (const ad of ads) {
            await supabase.from('ads').update({ views: (ad.views || 0) + 1 }).eq('id', ad.id);
            updatedCount++;
        }
    }

    console.log(`[${new Date().toISOString()}] Automação finalizada. Total de incrementos: ${updatedCount}`);
}

runAutomation();
