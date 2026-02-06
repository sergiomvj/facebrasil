import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * POST /api/articles/new
 * 
 * Receives article generated via N8N automation
 * 
 * Headers:
 * - Authorization: Bearer <N8N_API_KEY>
 * 
 * Body:
 * {
 *   title: string,
 *   content: string (HTML),
 *   excerpt: string,
 *   category: string (slug),
 *   context_summary: object,
 *   source_url: string,
 *   source_name: string,
 *   tags: string[],
 *   featured_image: string (URL),
 *   reading_time: number,
 *   language: string
 * }
 */
export async function POST(request: NextRequest) {
    try {
        // Verify API key
        const authHeader = request.headers.get('authorization');
        const apiKey = authHeader?.replace('Bearer ', '');

        if (!apiKey || apiKey !== process.env.N8N_API_KEY) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate required fields
        const { title, content, category, source_url } = body;
        if (!title || !content || !category || !source_url) {
            return NextResponse.json(
                { error: 'Missing required fields: title, content, category, source_url' },
                { status: 400 }
            );
        }

        // Get category ID
        const { data: categoryData, error: categoryError } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', category)
            .single();

        if (categoryError || !categoryData) {
            return NextResponse.json(
                { error: `Category not found: ${category}` },
                { status: 400 }
            );
        }

        // Generate slug
        const slug = generateSlug(title);

        // Check for duplicate slug
        const { data: existingArticle } = await supabase
            .from('articles')
            .select('id')
            .eq('slug', slug)
            .single();

        if (existingArticle) {
            return NextResponse.json(
                { error: 'Article with this title already exists' },
                { status: 409 }
            );
        }

        // Prepare article data
        const articleData = {
            title,
            slug,
            content,
            excerpt: body.excerpt || content.substring(0, 200).replace(/<[^>]*>/g, '') + '...',
            category_id: categoryData.id,
            featured_image: body.featured_image || null,
            read_time: body.reading_time || Math.ceil(content.split(' ').length / 200),
            status: 'PUBLISHED',
            published_at: new Date().toISOString(),

            // FBR-News specific fields
            source_type: 'automated',
            original_source: source_url,
            ai_context: body.context_summary || null,

            // Metadata
            tags: body.tags || [],
            language: body.language || 'pt-BR'
        };

        // Insert article
        const { data: article, error: insertError } = await supabase
            .from('articles')
            .insert(articleData)
            .select()
            .single();

        if (insertError) {
            console.error('Error inserting article:', insertError);
            return NextResponse.json(
                { error: 'Failed to create article' },
                { status: 500 }
            );
        }

        // Update news_queue if queue_id provided
        if (body.queue_id) {
            await supabase
                .from('news_queue')
                .update({
                    status: 'published',
                    processed_article_id: article.id,
                    processed_at: new Date().toISOString()
                })
                .eq('id', body.queue_id);
        }

        return NextResponse.json({
            success: true,
            article_id: article.id,
            slug: article.slug,
            published_at: article.published_at
        }, { status: 201 });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
