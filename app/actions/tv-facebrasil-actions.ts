'use server';

export interface TVArticlePayload {
    id: string;
    titulo: string;
    corpo: string;
    conteudo: string; // Adicionado para compatibilidade
    link: string;
    categoria: string;
}

export async function sendArticlesToTV(articles: TVArticlePayload[]) {
    const webhookUrl = process.env.TV_FACEBRASIL_WEBHOOK_URL || 'https://tv.fbr.news/api/intake';
    const API_KEY = process.env.TV_FACEBRASIL_API_KEY || process.env.N8N_API_KEY;

    try {
        console.log('[TV-Facebrasil] Enviando com compatibilidade dupla...', {
            url: webhookUrl,
            items: articles.length,
            hasAuth: !!API_KEY
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
            const errorBody = await response.text();
            console.error('[TV-Facebrasil] Erro do Servidor:', response.status, errorBody);
            throw new Error(`Erro ${response.status}: ${errorBody.substring(0, 100)}`);
        }

        return { success: true };
    } catch (error: any) {
        console.error('[TV-Facebrasil] Falha:', error.message);
        return { success: false, error: error.message };
    }
}
