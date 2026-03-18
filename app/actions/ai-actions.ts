'use server';

import { OpenAI } from 'openai';

function getOpenAI() {
    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}

export interface GenerateArticleOptions {
    topic: string;
    keywords: string[];
    style: string;
    size: 'small' | 'medium' | 'large';
    language: string;
    scope?: string;
}

export interface GenerateArticleResult {
    success: boolean;
    title?: string;
    content?: string;
    error?: string;
}

export async function generateArticle(options: GenerateArticleOptions): Promise<GenerateArticleResult> {
    try {
        const wordCount = options.size === 'small' ? 400 : options.size === 'medium' ? 800 : 1200;

        const prompt = `Crie um artigo de alta qualidade em ${options.language === 'en' ? 'Inglês' : options.language === 'es' ? 'Espanhol' : 'Português Brasileiro'} sobre o tema: "${options.topic}".
        ${options.scope ? `O artigo deve focar especificamente no seguinte escopo/tópico: "${options.scope}".` : ''}
        Use as seguintes palavras-chave: ${options.keywords.join(', ')}.
        O estilo deve ser ${options.style}.
        O tamanho aproximado deve ser de ${wordCount} palavras.
        Retorne no formato JSON com as chaves "title" e "content" (em HTML semântico).`;

        const completion = await getOpenAI().chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'Você é um assistente especializado em criar artigos de alta qualidade para blogs. Sempre retorne JSON válido.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const responseText = completion.choices[0]?.message?.content;
        if (!responseText) throw new Error('Empty response from AI');

        const parsed = JSON.parse(responseText);
        return {
            success: true,
            title: parsed.title,
            content: parsed.content
        };
    } catch (error: any) {
        console.error('AI Article Generation Error:', error);
        return { success: false, error: error.message };
    }
}

export async function generateKeywords(topic: string): Promise<{ success: boolean; keywords?: string[]; error?: string }> {
    try {
        const prompt = `Sugira 5 a 8 palavras-chave relevantes (SEO) para o tema: "${topic}". Retorne apenas um array JSON de strings.`;

        const completion = await getOpenAI().chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
        });

        const responseText = completion.choices[0]?.message?.content;
        if (!responseText) throw new Error('Empty response');

        const parsed = JSON.parse(responseText);
        return { success: true, keywords: parsed.keywords || parsed };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function generateMetadata(content: string, type: 'slug' | 'excerpt' | 'social_summary'): Promise<{ success: boolean; content?: string; error?: string }> {
    try {
        let prompt = '';
        if (type === 'slug') prompt = `Gere um slug de URL amigável (apenas letras, números e hifens) baseado neste conteúdo: "${content.substring(0, 500)}". Retorne apenas o slug.`;
        if (type === 'excerpt') prompt = `Gere um resumo curto (máximo 160 caracteres) para este conteúdo: "${content.substring(0, 1000)}".`;
        if (type === 'social_summary') prompt = `Gere uma legenda cativante para Instagram/Social Media baseada neste conteúdo: "${content.substring(0, 1000)}". Máximo 150 palavras.`;

        const completion = await getOpenAI().chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
        });

        return { success: true, content: completion.choices[0]?.message?.content?.trim() };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function generateSEOStrategy(socialSummary: string): Promise<{ success: boolean; keywords?: string[]; error?: string }> {
    try {
        const prompt = `Analise o seguinte resumo de artigo e BUSQUE 3 a 5 palavras-chave ou frases curtas altamente relevantes para SEO desse artigo. Retorne APENAS um array JSON de strings, sem formatação markdown ou explicações. Resumo: "${socialSummary}".`;

        const completion = await getOpenAI().chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'Você é um especialista em SEO. Retorne sempre JSON válido.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.5,
        });

        const responseText = completion.choices[0]?.message?.content;
        if (!responseText) throw new Error('Empty response');

        const parsed = JSON.parse(responseText);
        // Sometimes the AI wraps it in a "keywords" key, sometimes it's just the array
        const keywords = Array.isArray(parsed) ? parsed : (parsed.keywords || Object.values(parsed)[0]);
        
        return { 
            success: true, 
            keywords: Array.isArray(keywords) ? keywords : [] 
        };
    } catch (error: any) {
        console.error('SEO Strategy Error:', error);
        return { success: false, error: error.message };
    }
}

export async function generateSEOTitle(content: string, keywords: string[]): Promise<{ success: boolean; title?: string; error?: string }> {
    try {
        const prompt = `Com base nos melhores termos chave para o artigo apontados pela estratégia de SEO produza um titulo com no máximo 85 caracteres que seja de alto impacto para o leitor.
        Conteúdo: "${content.substring(0, 1500)}".
        Palavras-chave: ${keywords.join(', ')}.
        Retorne no formato JSON com a chave "title".`;

        const completion = await getOpenAI().chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'Você é um redator sênior e especialista em SEO. Retorne sempre JSON válido.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.8,
        });

        const responseText = completion.choices[0]?.message?.content;
        if (!responseText) throw new Error('Empty response');

        const parsed = JSON.parse(responseText);
        return { success: true, title: parsed.title };
    } catch (error: any) {
        console.error('SEO Title Error:', error);
        return { success: false, error: error.message };
    }
}

export async function applySEOStrategy(content: string, keywords: string[]): Promise<{ success: boolean; content?: string; error?: string }> {
    try {
        const prompt = `Aqui está o conteúdo HTML de um artigo e uma lista de palavras-chave de SEO.
        Reescreva ou ajuste o texto para incluir essas palavras-chave de forma muito natural e com bom senso, preservando o máximo possível a fluidez original.
        TODAS as vezes que uma das palavras-chave foco aparecer (ou for inserida), envolva-a na tag <strong> para deixá-la em negrito e ajudar no SEO.
        Preserve estritamente as outras marcações HTML originais (p, h2, ul, etc.).
        Conteúdo HTML: "${content}".
        Palavras-chave: ${keywords.join(', ')}.
        Retorne um objeto JSON contendo a chave "content" com o HTML modificado inteiro. Não adicione marcação markdown solta, apenas o JSON.`;

        const completion = await getOpenAI().chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'Você é um editor sênior focado em SEO. Retorne apenas JSON válido contendo a chave content.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.5,
        });

        const responseText = completion.choices[0]?.message?.content;
        if (!responseText) throw new Error('Empty response');

        const parsed = JSON.parse(responseText);
        return { success: true, content: parsed.content };
    } catch (error: any) {
        console.error('Apply SEO Strategy Error:', error);
        return { success: false, error: error.message };
    }
}
