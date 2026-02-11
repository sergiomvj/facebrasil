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
