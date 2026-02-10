export interface SEOArticlePayload {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    link: string;
    category?: string;
}

export async function reportArticleToSEO(article: SEOArticlePayload) {
    const SEO_API_URL = process.env.SEO_API_URL;
    const SEO_API_KEY = process.env.SEO_API_KEY;

    if (!SEO_API_URL || !SEO_API_KEY) {
        console.warn('SEO_API_URL ou SEO_API_KEY não configurados. Artigo não reportado ao SEO.');
        return { success: false, error: 'Configuração ausente' };
    }

    try {
        const response = await fetch(`${SEO_API_URL.replace(/\/$/, '')}/api/v1/articles/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': SEO_API_KEY
            },
            body: JSON.stringify(article)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro na SEO API (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error: any) {
        console.error('Erro ao reportar artigo para SEO:', error);
        return { success: false, error: error.message };
    }
}
