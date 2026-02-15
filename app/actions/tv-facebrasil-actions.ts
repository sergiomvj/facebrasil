'use server';

export interface TVArticlePayload {
    id: string;
    titulo: string;
    conteudo: string;
    link: string;
}

export async function sendArticlesToTV(articles: TVArticlePayload[]) {
    let webhookUrl = process.env.TV_FACEBRASIL_WEBHOOK_URL || process.env.N8N_URL;
    const N8N_API_KEY = process.env.N8N_API_KEY;

    if (!webhookUrl) {
        console.warn('URL da TV Facebrasil não configurada (N8N_URL ou TV_FACEBRASIL_WEBHOOK_URL).');
        return { success: false, error: 'Webhook URL não configurada' };
    }

    // Ensure the URL is valid. We no longer force /webhook/ suffix to allow for direct API integration.
    // if (!webhookUrl.includes('/webhook/')) {
    //    webhookUrl = `${webhookUrl.replace(/\/$/, '')}/webhook/facebrasil-intake`;
    // }

    try {
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
            throw new Error(`Erro no envio para TV (${response.status})`);
        }

        return { success: true };
    } catch (error: any) {
        console.error('Erro ao enviar para TV Facebrasil:', error);
        return { success: false, error: error.message };
    }
}
