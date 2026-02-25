'use server';

export interface TVArticlePayload {
    id: string;
    titulo: string;
    corpo: string;
    conteudo: string;
    link: string;
    categoria: string;
}

export async function sendArticlesToTV(articles: TVArticlePayload[]) {
    const webhookUrl = process.env.TV_FACEBRASIL_WEBHOOK_URL || 'https://tools-n8n.ldm9ti.easypanel.host/webhook-test/facebrasil-intake';
    const API_KEY = process.env.TV_FACEBRASIL_API_KEY || process.env.N8N_API_KEY;

    try {
        console.log('[TV-Facebrasil] Payload Send:', {
            url: webhookUrl,
            count: articles.length,
            debug: articles[0]?.corpo?.includes('DEBUG MODE ACTIVE')
        });

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY || ''
            },
            body: JSON.stringify({
                articles
            }),
            cache: 'no-store'
        });

        const responseText = await response.text();

        if (!response.ok) {
            console.error('[TV-Facebrasil] n8n Final Error:', response.status, responseText);

            // Tenta ver se é um erro amigável do n8n
            let msg = responseText;
            try {
                const parsed = JSON.parse(responseText);
                msg = parsed.message || parsed.error || responseText;
            } catch (e) { }

            return {
                success: false,
                error: `n8n Reportou: ${msg}`
            };
        }

        return { success: true, data: responseText };
    } catch (error: any) {
        console.error('[TV-Facebrasil] Connection Fatal:', error.message);
        return { success: false, error: `Falha de rede/dns: ${error.message}` };
    }
}
