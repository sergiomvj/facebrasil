
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

/**
 * Script de Automação de Analytics - Facebrasil
 * Regras Atualizadas:
 * - Artigos (< 7 dias): 
 *    - < 24h: Toda execução (+1 view a cada 3-5 min)
 *    - Dia 2: +1 view a cada 15 min
 *    - Dia 3: +1 view a cada 20 min
 *    - Dia 4: +1 view a cada 25 min
 *    - Dia 5: +1 view a cada 30 min
 *    - Dia 6: +1 view a cada 35 min
 *    - Dia 7: +1 view a cada 40 min
 * - Anúncios (Ativos): 
 *    - +1 view a cada 15 min
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
    const totalDailyMinutes = now.getHours() * 60 + now.getMinutes();
    let updatedCount = 0;

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
            let intervalMinutes = 0;

            if (ageInDays === 0) {
                // Dia 1 (< 24h) -> Incrementa a cada execução (assumindo script rodando frequente)
                shouldIncrement = true;
            } else if (ageInDays === 1) {
                intervalMinutes = 15; // Dia 2
            } else if (ageInDays === 2) {
                intervalMinutes = 20; // Dia 3
            } else if (ageInDays === 3) {
                intervalMinutes = 25; // Dia 4
            } else if (ageInDays === 4) {
                intervalMinutes = 30; // Dia 5
            } else if (ageInDays === 5) {
                intervalMinutes = 35; // Dia 6
            } else if (ageInDays === 6) {
                intervalMinutes = 40; // Dia 7
            }

            // Para idades > 24h, checamos o gatilho de tempo
            if (intervalMinutes > 0) {
                // Usamos um range de 3 min para garantir o gatilho se o script rodar por ex. a cada 3 ou 5 min
                if (totalDailyMinutes % intervalMinutes < 3) {
                    shouldIncrement = true;
                }
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

    // 2. Processar Anúncios (Mantendo a regra de 1 view a cada 15 min para ativos)
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
