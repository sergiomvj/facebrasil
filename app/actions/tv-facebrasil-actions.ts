'use server';

export interface TVArticlePayload {
    id: string;
    titulo: string;
    corpo: string;
    link: string;
    categoria: string;
}

export async function sendArticlesToTV(articles: TVArticlePayload[]) {
    // Conforme especificação atualizada pelo usuário
    const webhookUrl = process.env.TV_FACEBRASIL_WEBHOOK_URL || 'https://tv.fbr.news/api/intake';
    const API_KEY = process.env.TV_FACEBRASIL_API_KEY || process.env.N8N_API_KEY;

    if (!webhookUrl) {
        return { success: false, error: 'Webhook URL não configurada' };
    }

    try {
        console.log('[TV-Facebrasil] Enviando lote com payload final...', {
            url: webhookUrl,
            count: articles.length
        });

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY || ''
            },
            body: JSON.stringify({
                articles
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[TV-Facebrasil] Erro na Resposta:', response.status, errorText);
            throw new Error(`Erro no envio para TV (${response.status})`);
        }

        return { success: true };
    } catch (error: any) {
        console.error('Erro ao enviar para TV Facebrasil:', error);
        return { success: false, error: error.message };
    }
}
