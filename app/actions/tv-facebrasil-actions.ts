'use server';

import { revalidatePath } from 'next/cache';

interface ArticlePayload {
    id: string;
    titulo: string;
    conteudo: string;
    link: string;
}

export async function sendArticlesToTV(articles: ArticlePayload[]) {
    try {
        const n8nUrl = process.env.N8N_URL;
        const webhookUrl = `${n8nUrl?.replace(/\/$/, '')}/webhook/facebrasil-intake`;

        if (!n8nUrl) {
            throw new Error('N8N_URL não configurada no ambiente.');
        }

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ articles }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro no n8n: ${response.status} - ${errorText}`);
        }

        revalidatePath('/admin/tv-facebrasil');
        return { success: true };
    } catch (error: any) {
        console.error('Error sending articles to TV:', error);
        return {
            success: false,
            error: error.message || 'Ocorreu um erro ao enviar os artigos.'
        };
    }
}
