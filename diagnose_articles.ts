import { fetchPosts } from './lib/blog-service';
import * as fs from 'fs';

async function diagnose() {
    console.log('Iniciando diagnóstico detalhado...');
    try {
        const { data: posts } = await fetchPosts({ limit: 1000 });

        const noTags = posts.filter((p: any) => !p.content.trim().startsWith('<'));
        const withTags = posts.filter((p: any) => p.content.trim().startsWith('<'));

        let report = '# Relatório Final de Diagnóstico de Formatação\n\n';
        report += `Total analisado: ${posts.length}\n`;
        report += `Artigos COM tags HTML: ${withTags.length}\n`;
        report += `Artigos SEM tags HTML (Texto Puro): ${noTags.length}\n\n`;

        if (noTags.length > 0) {
            report += `## Exemplos de Artigos SEM TAGS (Problemáticos para o Prose)\n\n`;
            noTags.slice(0, 10).forEach((post: any) => {
                report += `### ${post.title}\n`;
                report += `**Slug:** ${post.slug} | **Source:** ${post.source_type || 'null'}\n`;
                report += `**Content:**\n\n\`\`\`text\n`;
                report += post.content.substring(0, 300) + '...';
                report += `\n\`\`\`\n\n`;
            });
        }

        if (withTags.length > 0) {
            report += `## Exemplos de Artigos COM TAGS (Verificar se há inline styles)\n\n`;
            withTags.slice(0, 5).forEach((post: any) => {
                report += `### ${post.title}\n`;
                report += `**Slug:** ${post.slug} | **Source:** ${post.source_type || 'null'}\n`;
                report += `**Snippet:**\n\n\`\`\`html\n`;
                report += post.content.substring(0, 400);
                report += `\n\`\`\`\n\n`;
            });
        }

        fs.writeFileSync('article_diagnostics.md', report);
        console.log('Diagnóstico concluído! Leia article_diagnostics.md');
    } catch (err) {
        console.error('Erro:', err);
    }
}

diagnose();
