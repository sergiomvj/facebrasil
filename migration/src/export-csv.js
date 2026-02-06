import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function exportArticlesToCSV() {
    console.log('📊 Exportando artigos para CSV...\n');

    try {
        // Buscar todos os artigos com categorias
        const { data: articles, error } = await supabase
            .from('articles')
            .select(`
        id,
        title,
        category_id,
        categories (
          name
        )
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        console.log(`✓ Encontrados ${articles.length} artigos\n`);

        // Criar CSV
        let csv = 'ID,Categoria,Titulo\n';

        for (const article of articles) {
            const id = article.id;
            const category = article.categories?.name || 'Sem Categoria';
            const title = (article.title || '').replace(/"/g, '""'); // Escape aspas

            csv += `"${id}","${category}","${title}"\n`;
        }

        // Salvar arquivo
        const filename = './articles-export.csv';
        await fs.writeFile(filename, csv, 'utf-8');

        console.log(`✅ CSV criado com sucesso!`);
        console.log(`📁 Arquivo: ${filename}`);
        console.log(`📊 Total de artigos: ${articles.length}\n`);

        // Estatísticas de categorias
        const categoryStats = {};
        articles.forEach(article => {
            const cat = article.categories?.name || 'Sem Categoria';
            categoryStats[cat] = (categoryStats[cat] || 0) + 1;
        });

        console.log('📈 Top 10 categorias:');
        Object.entries(categoryStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .forEach(([cat, count]) => {
                console.log(`  - ${cat}: ${count} artigos`);
            });

    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

exportArticlesToCSV();
