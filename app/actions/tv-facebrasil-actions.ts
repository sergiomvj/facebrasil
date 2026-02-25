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
        console.log('[TV-Facebrasil] Tentativa de envio:', {
            url: webhookUrl,
            items: articles.length,
            ids: articles.map(a => a.id)
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
            // Importante para evitar timeouts em requisições grandes para n8n
            cache: 'no-store'
        });

        const responseText = await response.text();

        if (!response.ok) {
            console.error('[TV-Facebrasil] Erro no Workflow n8n:', response.status, responseText);

            // Se o n8n retornar um JSON com mensagem de erro, tentamos extrair
            let detailedError = responseText;
            try {
                const json = JSON.parse(responseText);
                detailedError = json.message || responseText;
            } catch (e) { }

            return {
                success: false,
                error: `Erro no servidor (n8n): ${detailedError.substring(0, 150)}`
            };
        }

        return { success: true, data: responseText };
    } catch (error: any) {
        console.error('[TV-Facebrasil] Erro de Conexão:', error.message);
        return { success: false, error: `Falha de conexão: ${error.message}` };
    }
}
