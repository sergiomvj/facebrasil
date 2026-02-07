'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BlogPost } from '@/lib/fbr-types';
import { supabase } from '@/lib/supabase';
import ArticleCard from '@/components/ArticleCard';

export default function SearchResultsContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchResults() {
            if (!query) return;
            setLoading(true);

            const { data, error } = await supabase
                .from('articles')
                .select(`
          *,
          author:profiles(name, avatar_url),
          category:categories(name, slug)
        `)
                .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
                .eq('status', 'PUBLISHED')
                .order('published_at', { ascending: false })
                .limit(20);

            if (!error && data) {
                // Map data to BlogPost type using a simplified version of the logic in blog-service
                const mappedResults = (data as unknown[]).map((rowItem) => {
                    const row = rowItem as {
                        id: string;
                        slug: string;
                        title: string;
                        excerpt: string;
                        content: string;
                        author: { name: string; avatar_url: string } | null;
                        category: { name: string; slug: string } | null;
                        featured_image: string | { url: string } | null;
                        published_at: string;
                        created_at: string;
                        read_time?: number;
                    };

                    return {
                        id: row.id,
                        slug: row.slug,
                        title: row.title,
                        excerpt: row.excerpt,
                        content: row.content,
                        author: {
                            name: row.author?.name || 'Facebrasil',
                            avatar: row.author?.avatar_url,
                        },
                        categories: row.category ? [row.category.slug] : [],
                        featuredImage: typeof row.featured_image === 'string' ? { url: row.featured_image } : (row.featured_image as { url: string }),
                        publishedAt: row.published_at || row.created_at,
                        readTime: row.read_time || 5
                    };
                });
                setResults(mappedResults as BlogPost[]);
            }
            setLoading(false);
        }

        void fetchResults();
    }, [query]);

    if (!query) return <div className="text-slate-500">Digite algo para pesquisar.</div>;
    if (loading) return <div className="text-slate-500">Buscando por &quot;{query}&quot;...</div>;
    if (results.length === 0) return (
        <div className="text-center py-20">
            <p className="text-xl text-slate-400">Nenhum artigo encontrado para &quot;{query}&quot;.</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map((post) => (
                <ArticleCard key={post.id} article={post} />
            ))}
        </div>
    );
}
