import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * Proxy de Mídia - Facebrasil
 * Evita bloqueio por Ad-Blockers roteando requisições do Storage do Supabase 
 * através do próprio domínio da aplicação.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: pathSegments } = await params;
        const filePath = pathSegments.join('/');
        
        if (!filePath) {
            return new NextResponse('Caminho não fornecido', { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        // O bucket padrão para este proxy é 'ads', mas pode ser expandido.
        // Ocultamos o nome 'ads' na URL externa mas usamos internamente.
        const { data, error } = await supabase
            .storage
            .from('ads')
            .download(filePath);

        if (error || !data) {
            console.error('[AssetProxy] Erro ao baixar arquivo:', error);
            return new NextResponse('Recurso não encontrado', { status: 404 });
        }

        // Determinar o Content-Type original ou fallback
        const contentType = data.type || 'application/octet-stream';

        // Retornar a imagem com headers de cache agressivos para performance
        return new NextResponse(data, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin': '*', // Permite uso cross-origin se necessário
            },
        });
    } catch (err) {
        console.error('[AssetProxy] Erro inesperado:', err);
        return new NextResponse('Erro interno do servidor', { status: 500 });
    }
}
