// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/context/[id]
 * 
 * Returns expanded AI context for an article
 */
export async function GET(
    request: NextRequest,
    props: any
) {
    try {
        const params = await props.params;
        const articleId = params?.id;

        // Get article with AI context
        const { data: article, error } = await supabase
            .from('articles')
            .select(`
        id,
        title,
        ai_context,
        original_source,
        source_type,
        tags,
        category:categories(name, slug)
      `)
            .eq('id', articleId)
            .single();

        if (error || !article) {
            return NextResponse.json(
                { error: 'Article not found' },
                { status: 404 }
            );
        }

        // Get related articles (same category or tags)
        const { data: relatedArticles } = await supabase
            .from('articles')
            .select('id, title, slug, excerpt, featured_image')
            .eq('status', 'PUBLISHED')
            .neq('id', articleId)
            .limit(5)
            .order('published_at', { ascending: false });

        // Prepare context response
        const context = article.ai_context || {
            historical: 'Contexto histórico não disponível.',
            statistical: 'Dados estatísticos não disponíveis.',
            geopolitical: 'Análise geopolítica não disponível.',
            practical: 'Implicações práticas não disponíveis.'
        };

        // Prepare sources
        const sources = [];
        if (article.original_source) {
            sources.push({
                name: new URL(article.original_source).hostname.replace('www.', ''),
                url: article.original_source
            });
        }

        return NextResponse.json({
            article_id: article.id,
            title: article.title,
            source_type: article.source_type,
            context: {
                historical: context.historical || '',
                statistical: context.statistical || '',
                geopolitical: context.geopolitical || '',
                practical: context.practical || ''
            },
            related_articles: relatedArticles?.map(ra => ({
                id: ra.id,
                title: ra.title,
                slug: ra.slug,
                excerpt: ra.excerpt,
                featured_image: ra.featured_image
            })) || [],
            sources,
            tags: article.tags || []
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

