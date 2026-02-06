import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Mapeamento: categoria antiga → categoria nova
const CATEGORY_MAPPING = {
    // Comunidade
    'Clima e Tempo': 'Comunidade',
    '#BrasileirosNosEUA': 'Comunidade',
    'Brasileiros': 'Comunidade',
    '#BrasileirosNaFlórida': 'Comunidade',
    'Brasileiros nos EUA': 'Comunidade',
    'brasileiros': 'Comunidade',

    // Bem-Estar
    'Horoscopo': 'Bem-Estar',
    'Bem Estar': 'Bem-Estar',
    'Horóscopo': 'Bem-Estar',

    // Saúde (mantém)
    'Saude': 'Saúde',
    'Health': 'Saúde',

    // Notícias (tudo mais)
    'Top': 'Notícias',
    'COVID-19': 'Notícias',
    'Esportes': 'Notícias',
    'Variedades': 'Notícias',
    'Economia': 'Notícias',
    'Política': 'Notícias',
    'Destaque': 'Notícias',
    'News': 'Notícias',
    'news': 'Notícias',
    'Novelas': 'Notícias',
    'Cultura': 'Notícias',
    'Tecnologia': 'Notícias',
    'Turismo': 'Notícias',
    'Gastronomia': 'Notícias',
    'Entretenimento': 'Notícias',
    'Mundo': 'Notícias',
    'Brasil': 'Notícias',
    'EUA': 'Notícias',
    'Florida': 'Notícias',
    'Flórida': 'Notícias',
    'Orlando': 'Notícias',
    'Miami': 'Notícias'
};

async function consolidateCategories() {
    console.log(chalk.bold.cyan('\n🔄 Consolidando Categorias\n'));

    try {
        // 1. Buscar todas as categorias
        const { data: allCategories } = await supabase
            .from('categories')
            .select('id, name, slug');

        console.log(chalk.blue(`📊 Total de categorias: ${allCategories.length}\n`));

        // 2. Encontrar ou criar categorias principais
        const mainCategoryNames = ['Comunidade', 'Bem-Estar', 'Saúde', 'Notícias'];
        const mainCategories = {};

        for (const catName of mainCategoryNames) {
            let cat = allCategories.find(c => c.name === catName);

            if (!cat) {
                console.log(chalk.yellow(`  Criando categoria: ${catName}...`));

                const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

                const { data, error } = await supabase
                    .from('categories')
                    .insert({
                        name: catName,
                        slug: slug,
                        color: catName === 'Notícias' ? '#3B82F6' :
                            catName === 'Comunidade' ? '#10B981' :
                                catName === 'Bem-Estar' ? '#8B5CF6' : '#EF4444',
                        blog_id: process.env.DEFAULT_BLOG_ID
                    })
                    .select()
                    .single();

                if (error) {
                    console.log(chalk.red(`  ✗ Erro: ${error.message}`));
                    continue;
                }

                cat = data;
                console.log(chalk.green(`  ✓ Criada: ${catName}`));
            }

            mainCategories[catName] = cat;
        }

        console.log(chalk.blue(`\n🔗 Processando consolidação...\n`));

        let updated = 0;
        let deleted = 0;

        // 3. Processar cada categoria
        for (const oldCat of allCategories) {
            // Pular se for uma categoria principal
            if (mainCategoryNames.includes(oldCat.name)) {
                continue;
            }

            // Determinar categoria de destino
            let targetCatName = CATEGORY_MAPPING[oldCat.name] || 'Notícias';
            const targetCat = mainCategories[targetCatName];

            if (!targetCat) {
                console.log(chalk.red(`  ✗ Categoria destino não encontrada: ${targetCatName}`));
                continue;
            }

            // Contar artigos
            const { count } = await supabase
                .from('articles')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', oldCat.id);

            if (count === 0) {
                // Deletar categoria vazia
                await supabase.from('categories').delete().eq('id', oldCat.id);
                deleted++;
                console.log(chalk.gray(`  ⊘ "${oldCat.name}" deletada (vazia)`));
                continue;
            }

            // Atualizar artigos
            const { error } = await supabase
                .from('articles')
                .update({ category_id: targetCat.id })
                .eq('category_id', oldCat.id);

            if (error) {
                console.log(chalk.red(`  ✗ Erro ao atualizar "${oldCat.name}": ${error.message}`));
                continue;
            }

            // Deletar categoria antiga
            await supabase.from('categories').delete().eq('id', oldCat.id);

            updated += count;
            deleted++;
            console.log(chalk.green(`  ✓ "${oldCat.name}" → ${targetCatName} (${count} artigos)`));
        }

        // 4. Estatísticas finais
        console.log(chalk.bold.green(`\n\n✅ Consolidação Concluída!\n`));
        console.log(chalk.gray('Estatísticas:'));
        console.log(chalk.green(`  ✓ Artigos atualizados: ${updated}`));
        console.log(chalk.green(`  ✓ Categorias removidas: ${deleted}`));

        // Mostrar distribuição final
        console.log(chalk.blue(`\n📊 Distribuição Final:\n`));

        for (const [name, cat] of Object.entries(mainCategories)) {
            const { count } = await supabase
                .from('articles')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', cat.id);

            console.log(chalk.cyan(`  ${name}: ${count} artigos`));
        }

        const { data: finalCats } = await supabase
            .from('categories')
            .select('id');

        console.log(chalk.bold.green(`\n🎯 Total de categorias: ${finalCats.length}\n`));

    } catch (error) {
        console.error(chalk.red('\n❌ Erro fatal:'), error.message);
        console.error(error);
        process.exit(1);
    }
}

consolidateCategories();
