
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

/**
 * Script de Automação de Analytics - Facebrasil
 * Regras Atualizadas:
 * - Artigos (< 7 dias): 
 *    - +1 view a cada 60 min (início da hora)
 * - Anúncios (Ativos): 
 *    - +1 view a cada 120 min (horas pares)
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
    const currentHour = now.getHours();
    let updatedCount = 0;

    // Fases de decaimento
    const phase2Date = new Date('2026-07-05T00:00:00-03:00');
    const phase3Date = new Date('2026-07-12T00:00:00-03:00');
    const phase4Date = new Date('2026-07-19T00:00:00-03:00');

    let articleIntervalHours = 1; // Atual: ~60 mins
    let adsIntervalHours = 2;     // Atual: ~120 mins

    if (now >= phase4Date) {
      articleIntervalHours = 6;  // ~360 mins
      adsIntervalHours = 10;     // ~600 mins
    } else if (now >= phase3Date) {
      articleIntervalHours = 4;  // ~240 mins
      adsIntervalHours = 8;      // ~480 mins
    } else if (now >= phase2Date) {
      articleIntervalHours = 2;  // ~120 mins
      adsIntervalHours = 4;      // ~240 mins
    }

    // 1. Processar Artigos
    // Filtramos artigos publicados nos últimos 7 dias que estejam 'PUBLISHED'
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: articles, error: artError } = await supabase
        .from('articles')
        .select('id, title, published_at, views')
        .gte('published_at', sevenDaysAgo)
        .eq('status', 'PUBLISHED');

    if (artError) {
        console.error('Erro ao buscar artigos:', artError);
    } else if (articles) {
        console.log(`Analisando ${articles.length} artigos recentes para incremento linear...`);
        for (const article of articles) {
            const pubDate = new Date(article.published_at);
            const ageInHours = (now - pubDate) / (1000 * 60 * 60);
            const ageInDays = Math.floor(ageInHours / 24);
            
            let shouldIncrement = false;

            // Artigos de 0 a 7 dias (frequência dinâmica)
            if (currentHour % articleIntervalHours === 0 && currentMinute >= 0 && currentMinute <= 2) {
                shouldIncrement = true;
            }

            if (shouldIncrement) {
                const { error: updErr } = await supabase.rpc('increment_article_views', { p_article_id: article.id });
                if (updErr) {
                    // Fallback se o RPC falhar
                    await supabase.from('articles').update({ views: (article.views || 0) + 1 }).eq('id', article.id);
                }
                updatedCount++;
            }
        }
    }

    // 2. Processar Anúncios (frequência dinâmica)
    const { data: ads, error: adsError } = await supabase
        .from('ads')
        .select('id, views')
        .eq('is_active', true);

    if (adsError) {
        console.error('Erro ao buscar anúncios:', adsError);
    } else if (ads && currentHour % adsIntervalHours === 0 && currentMinute >= 0 && currentMinute <= 2) {
        console.log(`Incrementando views para ${ads.length} anúncios ativos...`);
        for (const ad of ads) {
            await supabase.from('ads').update({ views: (ad.views || 0) + 1 }).eq('id', ad.id);
            updatedCount++;
        }
    }

    console.log(`[${new Date().toISOString()}] Automação finalizada. Total de incrementos: ${updatedCount}`);
}

runAutomation();
