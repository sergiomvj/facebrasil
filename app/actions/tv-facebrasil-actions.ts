'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';

export interface TVArticlePayload {
    id: string;
    titulo: string;
    corpo: string;
    conteudo: string;
    link: string;
    categoria: string;
}

export async function sendArticlesToTV(articles: TVArticlePayload[]) {
    // URL OFICIAL DE PRODUÇÃO conforme o guia técnico
    const webhookUrl = process.env.TV_FACEBRASIL_WEBHOOK_URL || 'https://tools-n8n.ldm9ti.easypanel.host/webhook/facebrasil-intake';
    const API_KEY = process.env.TV_FACEBRASIL_API_KEY || process.env.N8N_API_KEY;

    try {
        console.log('[TV-Facebrasil] Enfileirando Lote:', {
            url: webhookUrl,
            count: articles.length,
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
            cache: 'no-store'
        });

        const responseText = await response.text();

        if (!response.ok) {
            console.error('[TV-Facebrasil] n8n Error:', response.status, responseText);
            return {
                success: false,
                error: `n8n Reportou: ${responseText}`
            };
        }

        // Marcar artigos como enviados no banco de dados
        const articleIds = articles.map(a => a.id);
        const { error: dbError } = await (supabaseAdmin
            .from('articles') as any)
            .update({
                sent_to_tv: true,
                tv_sent_at: new Date().toISOString()
            })
            .in('id', articleIds);

        if (dbError) {
            console.warn('[TV-Facebrasil] Erro ao atualizar status no banco:', dbError);
            // Não falha a operação pois o envio para o n8n deu certo
        }

        return { success: true, data: responseText };
    } catch (error: any) {
        console.error('[TV-Facebrasil] Connection Fatal:', error.message);
        return { success: false, error: `Falha de rede: ${error.message}` };
    }
}

