'use server';

export interface TVArticlePayload {
    id: string;
    titulo: string;
    link: string;
}

export async function sendArticlesToTV(articles: TVArticlePayload[]) {
    const webhookUrl = process.env.TV_FACEBRASIL_WEBHOOK_URL || process.env.N8N_URL || 'https://tv.fbr.news/api/webhooks/facebrasil';
    const N8N_API_KEY = process.env.N8N_API_KEY;

    if (!webhookUrl) {
        console.warn('URL da TV Facebrasil não configurada (N8N_URL ou TV_FACEBRASIL_WEBHOOK_URL).');
        return { success: false, error: 'Webhook URL não configurada' };
    }

    try {
        console.log('[TV-Facebrasil] Enviando payload otimizado...', {
            url: webhookUrl,
            articlesCount: articles.length,
            timestamp: new Date().toISOString()
        });

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': N8N_API_KEY || ''
            },
            body: JSON.stringify({
                source: 'admin-panel',
                timestamp: new Date().toISOString(),
                articles
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[TV-Facebrasil] Erro do Servidor (n8n):', response.status, errorText);
            throw new Error(`Erro no envio para TV (${response.status})`);
        }

        return { success: true };
    } catch (error: any) {
        console.error('Erro ao enviar para TV Facebrasil:', error);
        return { success: false, error: error.message };
    }
}
