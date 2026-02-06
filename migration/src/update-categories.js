import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function updateCategoriesFromCSV() {
    console.log(chalk.bold.cyan('\n🔄 Atualizando categorias do CSV...\n'));

    try {
        // Ler CSV
        const csvContent = await fs.readFile('./categories-mapping.csv', 'utf-8');
        const lines = csvContent.split('\n').slice(1); // Skip header

        const mappings = [];
        for (const line of lines) {
            if (!line.trim()) continue;

            // Parse CSV line (handle quoted values)
            const match = line.match(/"([^"]*)","?(\d+)"?,"([^"]*)"/);
            if (!match) continue;

            const [, oldName, count, newName] = match;

            // Só processar se o nome mudou
            if (oldName !== newName && newName.trim()) {
                mappings.push({
                    oldName: oldName.trim(),
                    newName: newName.trim(),
                    articleCount: parseInt(count)
                });
            }
        }

        console.log(chalk.green(`✓ Encontradas ${mappings.length} categorias para atualizar\n`));

        if (mappings.length === 0) {
            console.log(chalk.yellow('⚠ Nenhuma categoria para atualizar. Verifique o CSV.'));
            return;
        }

        // Mostrar preview
        console.log(chalk.blue('📋 Preview das mudanças:\n'));
        mappings.slice(0, 10).forEach((m, i) => {
            console.log(`  ${i + 1}. "${m.oldName}" → "${m.newName}" (${m.articleCount} artigos)`);
        });
        if (mappings.length > 10) {
            console.log(chalk.gray(`  ... e mais ${mappings.length - 10} mudanças\n`));
        }

        // Processar atualizações
        console.log(chalk.blue('\n🔄 Processando atualizações...\n'));

        let updated = 0;
        let errors = 0;
        const errorLog = [];

        for (const mapping of mappings) {
            try {
                // Buscar categoria antiga
                const { data: oldCat, error: findError } = await supabase
                    .from('categories')
                    .select('id, slug')
                    .eq('name', mapping.oldName)
                    .single();

                if (findError || !oldCat) {
                    throw new Error(`Categoria "${mapping.oldName}" não encontrada`);
                }

                // Gerar novo slug
                const newSlug = mapping.newName
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');

                // Atualizar categoria
                const { error: updateError } = await supabase
                    .from('categories')
                    .update({
                        name: mapping.newName,
                        slug: newSlug
                    })
                    .eq('id', oldCat.id);

                if (updateError) throw updateError;

                updated++;
                console.log(chalk.green(`  ✓ ${mapping.oldName} → ${mapping.newName}`));

            } catch (error) {
                errors++;
                errorLog.push({
                    oldName: mapping.oldName,
                    newName: mapping.newName,
                    error: error.message
                });
                console.log(chalk.red(`  ✗ Erro: ${mapping.oldName} - ${error.message}`));
            }
        }

        // Resumo
        console.log(chalk.bold.green(`\n\n✅ Atualização Concluída!\n`));
        console.log(chalk.gray('Estatísticas:'));
        console.log(chalk.green(`  ✓ Atualizadas: ${updated}`));
        console.log(chalk.red(`  ✗ Erros: ${errors}`));

        // Salvar log de erros
        if (errorLog.length > 0) {
            await fs.writeFile(
                './category-update-errors.json',
                JSON.stringify(errorLog, null, 2)
            );
            console.log(chalk.yellow(`\n⚠ Erros salvos em: category-update-errors.json`));
        }

        // Agora consolidar categorias duplicadas
        console.log(chalk.blue('\n\n🔗 Consolidando categorias duplicadas...\n'));
        await consolidateDuplicates();

    } catch (error) {
        console.error(chalk.red('\n❌ Erro fatal:'), error.message);
        process.exit(1);
    }
}

async function consolidateDuplicates() {
    try {
        // Buscar todas as categorias
        const { data: allCategories } = await supabase
            .from('categories')
            .select('id, name, slug');

        // Agrupar por nome
        const grouped = {};
        allCategories.forEach(cat => {
            if (!grouped[cat.name]) {
                grouped[cat.name] = [];
            }
            grouped[cat.name].push(cat);
        });

        // Encontrar duplicadas
        const duplicates = Object.entries(grouped).filter(([, cats]) => cats.length > 1);

        if (duplicates.length === 0) {
            console.log(chalk.green('  ✓ Nenhuma categoria duplicada encontrada!'));
            return;
        }

        console.log(chalk.yellow(`  ⚠ Encontradas ${duplicates.length} categorias duplicadas\n`));

        let merged = 0;

        for (const [name, cats] of duplicates) {
            // Manter a primeira, mesclar as outras
            const [keepCat, ...mergeCats] = cats;
            const mergeIds = mergeCats.map(c => c.id);

            console.log(chalk.blue(`  🔗 Mesclando "${name}" (${mergeCats.length} duplicatas)...`));

            // Atualizar artigos para usar a categoria principal
            const { error: updateError } = await supabase
                .from('articles')
                .update({ category_id: keepCat.id })
                .in('category_id', mergeIds);

            if (updateError) {
                console.log(chalk.red(`    ✗ Erro ao atualizar artigos: ${updateError.message}`));
                continue;
            }

            // Deletar categorias duplicadas
            const { error: deleteError } = await supabase
                .from('categories')
                .delete()
                .in('id', mergeIds);

            if (deleteError) {
                console.log(chalk.red(`    ✗ Erro ao deletar duplicatas: ${deleteError.message}`));
                continue;
            }

            merged += mergeCats.length;
            console.log(chalk.green(`    ✓ ${mergeCats.length} duplicatas mescladas`));
        }

        console.log(chalk.bold.green(`\n  ✅ ${merged} categorias duplicadas consolidadas!`));

    } catch (error) {
        console.error(chalk.red('  ✗ Erro ao consolidar:'), error.message);
    }
}

updateCategoriesFromCSV();
