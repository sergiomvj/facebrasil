import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function exportCategoriesToCSV() {
    console.log('📊 Exportando categorias únicas para CSV...\n');

    try {
        // Buscar todas as categorias com contagem de artigos
        const { data: categories, error } = await supabase
            .from('categories')
            .select(`
        id,
        name,
        slug
      `)
            .order('name', { ascending: true });

        if (error) throw error;

        console.log(`✓ Encontradas ${categories.length} categorias\n`);

        // Contar artigos por categoria
        const categoriesWithCount = await Promise.all(
            categories.map(async (cat) => {
                const { count } = await supabase
                    .from('articles')
                    .select('*', { count: 'exact', head: true })
                    .eq('category_id', cat.id);

                return {
                    ...cat,
                    article_count: count || 0
                };
            })
        );

        // Ordenar por quantidade de artigos (decrescente)
        categoriesWithCount.sort((a, b) => b.article_count - a.article_count);

        // Criar CSV
        let csv = 'categoria_atual,artigos,nova_categoria\n';

        for (const cat of categoriesWithCount) {
            const name = (cat.name || '').replace(/"/g, '""'); // Escape aspas
            csv += `"${name}",${cat.article_count},"${name}"\n`;
        }

        // Salvar arquivo
        const filename = './categories-mapping.csv';
        await fs.writeFile(filename, csv, 'utf-8');

        console.log(`✅ CSV criado com sucesso!`);
        console.log(`📁 Arquivo: ${filename}`);
        console.log(`📊 Total de categorias: ${categories.length}\n`);

        console.log('📋 Instruções:');
        console.log('1. Abra o arquivo categories-mapping.csv');
        console.log('2. Na coluna "nova_categoria", substitua pelos nomes corretos');
        console.log('3. Salve o arquivo');
        console.log('4. Execute: npm run update-categories\n');

        console.log('📈 Top 15 categorias por quantidade de artigos:');
        categoriesWithCount.slice(0, 15).forEach((cat, i) => {
            console.log(`  ${i + 1}. ${cat.name}: ${cat.article_count} artigos`);
        });

        console.log(`\n📉 Categorias vazias: ${categoriesWithCount.filter(c => c.article_count === 0).length}`);

    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

exportCategoriesToCSV();
