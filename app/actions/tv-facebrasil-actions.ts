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
    const webhookUrl = process.env.TV_FACEBRASIL_WEBHOOK_URL || 'https://tools-n8n.ldm9ti.easypanel.host/webhook/facebrasil-intake';
    const API_KEY = process.env.TV_FACEBRASIL_API_KEY || process.env.N8N_API_KEY;

    try {
        // Log detalhado para depuração no console do servidor
        console.log('[TV-Facebrasil] Payload Debug:');
        articles.forEach((art, i) => {
            console.log(`  Article[${i}]:`, {
                id: art.id,
                titulo: art.titulo?.substring(0, 30) + '...',
                corpoLen: art.corpo?.length || 0,
                categoria: art.categoria
            });
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

        const responseText = await response.text();

        if (!response.ok) {
            console.error('[TV-Facebrasil] Erro 500 n8n:', responseText);
            throw new Error(responseText || `Erro ${response.status}`);
        }

        return { success: true, data: responseText };
    } catch (error: any) {
        console.error('[TV-Facebrasil] Erro Fatal:', error.message);
        return { success: false, error: error.message };
    }
}
