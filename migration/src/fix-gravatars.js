import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function fixImages() {
    console.log('🔍 Buscando artigos para verificar imagens...');

    let page = 0;
    const pageSize = 100; // Menor lote para evitar timeouts no Promise.all
    let hasMore = true;
    let totalFixed = 0;
    let totalCleared = 0;

    while (hasMore) {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error } = await supabase
            .from('articles')
            .select('id, title, featured_image')
            .not('featured_image', 'is', null)
            .range(from, to)
            .order('id'); // Ordem consistente

        if (error) throw error;
        if (!data || data.length === 0) break;

        const updatePromises = data.map(async (article) => {
            let img = article.featured_image;
            let needsUpdate = false;
            let newVal = null;

            // Caso 1: É uma string (formato antigo/errado do scraper)
            if (typeof img === 'string') {
                if (img.includes('gravatar.com') || img.includes('avatar')) {
                    newVal = null;
                    totalCleared++;
                } else {
                    newVal = { url: img, alt: article.title || 'Imagem do artigo' };
                    totalFixed++;
                }
                needsUpdate = true;
            }
            // Caso 2: É um objeto mas a URL é gravatar/avatar
            else if (img && typeof img === 'object' && img.url && (img.url.includes('gravatar.com') || img.url.includes('avatar'))) {
                newVal = null;
                totalCleared++;
                needsUpdate = true;
            }

            if (needsUpdate) {
                const { error: updateError } = await supabase
                    .from('articles')
                    .update({ featured_image: newVal })
                    .eq('id', article.id);

                if (updateError) console.error(`Erro ao atualizar ${article.id}:`, updateError.message);
            }
        });

        await Promise.all(updatePromises);

        console.log(`Página ${page + 1} processada. Acumulado: Corrigidos (formato): ${totalFixed}, Limpos (gravatar): ${totalCleared}`);
        page++;
        hasMore = data.length === pageSize;
    }

    console.log('\n✅ Correção concluída!');
    console.log(`Total convertidos para objeto: ${totalFixed}`);
    console.log(`Total Gravatars removidos: ${totalCleared}`);
}

fixImages().catch(console.error);
