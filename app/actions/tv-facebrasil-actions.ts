'use server';

export interface TVArticlePayload {
    id: string;
    titulo: string;
    conteudo: string;
    link: string;
}

export async function sendArticlesToTV(articles: TVArticlePayload[]) {
    const N8N_URL = process.env.N8N_URL;
    const N8N_API_KEY = process.env.N8N_API_KEY;

    if (!N8N_URL) {
        console.warn('N8N_URL não configurado. Artigos não enviados para a TV.');
        return { success: false, error: 'Webhook URL não configurada' };
    }

    try {
        const response = await fetch(N8N_URL, {
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
