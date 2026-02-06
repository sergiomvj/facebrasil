import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/articles
 * 
 * Returns filtered articles with pagination
 * 
 * Query Params:
 * - category: string (category slug)
 * - sort: 'recent' | 'popular' | 'trending'
 * - limit: number (default: 20, max: 100)
 * - offset: number (default: 0)
 * - source_type: 'manual' | 'automated' | 'all' (default: 'all')
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Parse query parameters
        const category = searchParams.get('category');
        const sort = searchParams.get('sort') || 'recent';
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
        const offset = parseInt(searchParams.get('offset') || '0');
        const sourceType = searchParams.get('source_type') || 'all';

        // Build query
        let query = supabase
            .from('articles')
            .select(`
        id,
        title,
        slug,
        excerpt,
        featured_image,
        source_type,
        original_source,
        views,
        created_at,
        published_at,
        read_time,
        category:categories(name, slug, color)
      `, { count: 'exact' })
            .eq('status', 'PUBLISHED');

        // Filter by category
        if (category) {
            const { data: categoryData } = await supabase
                .from('categories')
                .select('id')
                .eq('slug', category)
                .single();

            if (categoryData) {
                query = query.eq('category_id', categoryData.id);
            }
        }

        // Filter by source type
        if (sourceType !== 'all') {
            query = query.eq('source_type', sourceType);
        }

        // Sort
        switch (sort) {
            case 'popular':
                query = query.order('views', { ascending: false });
                break;
            case 'trending':
                // Trending = high views in last 7 days
                query = query
                    .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
                    .order('views', { ascending: false });
                break;
            case 'recent':
            default:
                query = query.order('published_at', { ascending: false });
                break;
        }

        // Pagination
        query = query.range(offset, offset + limit - 1);

        const { data: articles, error, count } = await query;

        if (error) {
            console.error('Error fetching articles:', error);
            return NextResponse.json(
                { error: 'Failed to fetch articles' },
                { status: 500 }
            );
        }

        // Add AI badge flag
        const articlesWithBadge = articles?.map(article => ({
            ...article,
            ai_badge: article.source_type === 'automated'
        }));

        return NextResponse.json({
            articles: articlesWithBadge || [],
            total: count || 0,
            page: Math.floor(offset / limit) + 1,
            limit,
            offset
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
