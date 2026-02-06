import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import { supabase } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import { Tag } from 'lucide-react';
import { fetchPosts } from '@/lib/blog-service';

// Force dynamic since we use DB
export const dynamic = 'force-dynamic';

interface CategoryPageProps {
    params: Promise<{
        slug: string;
    }>;
}

// Fetch category by slug
async function getCategory(slug: string) {
    const { data } = await supabase.from('categories').select('*').eq('slug', slug).single();
    return data;
}

// Fetch articles by category ID
async function getArticles(categoryId: string) {
    const { data } = await supabase
        .from('articles')
        .select(`
            *,
            author:profiles(name, avatar_url),
            category:categories(name, slug, color)
        `)
        .eq('category_id', categoryId)
        .eq('status', 'PUBLISHED')
        .order('published_at', { ascending: false });

    // Manual mapping for Articles to match BlogPost type expected by ArticleCard
    return (data || []).map((row: any) => ({
        ...row,
        author: {
            name: row.author?.name || 'Facebrasil',
            avatar: row.author?.avatar_url
        },
        categories: row.category ? [row.category.name] : [],
        readTime: row.read_time || 5,
        featuredImage: typeof row.featured_image === 'string' ? JSON.parse(row.featured_image) : row.featured_image,
        publishedAt: row.published_at
    }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { slug } = await params;

    // Handle Legacy WP Redirects
    if (slug === 'aconteceu') {
        redirect('/events');
    }
    if (slug === 'fbr-news') {
        redirect('/fbr-news');
    }
    if (slug === 'face-brasileira') {
        redirect('/category/face-brasil-na-america');
    }

    // Fetch Category Title/Details independently
    const category = await getCategory(slug);

    if (!category) {
        notFound();
    }

    // Fetch Posts using centralized service
    const { data: posts } = await fetchPosts({
        category: slug,
        limit: 50
    });

    return (
        <div className="min-h-screen dark:bg-slate-950 bg-slate-50 selection:bg-primary selection:text-white">
            <Navbar />

            {/* Category Hero */}
            <div className="pt-40 pb-20 px-6 relative overflow-hidden bg-white dark:bg-transparent">
                <div
                    className="absolute inset-0 opacity-10 blur-[120px]"
                    style={{ backgroundColor: category.color || '#3b82f6' }}
                ></div>
                <div className="max-w-[1280px] mx-auto relative z-10">
                    <div className="flex flex-col items-center text-center">
                        <span
                            className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border"
                            style={{
                                backgroundColor: `${category.color || '#3b82f6'}15`,
                                color: category.color || '#3b82f6',
                                borderColor: `${category.color || '#3b82f6'}30`
                            }}
                        >
                            Categoria
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 dark:text-white text-gray-900">
                            {category.name}
                        </h1>
                        <div className="h-1.5 w-24 bg-primary rounded-full mb-8"></div>
                        <p className="dark:text-slate-400 text-gray-600 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                            Acompanhe as últimas notícias, histórias e conteúdos exclusivos sobre {category.name} na Facebrasil.
                        </p>
                    </div>
                </div>
            </div>

            {/* Articles Grid */}
            <main className="max-w-[1400px] mx-auto px-6 pb-32">
                {posts.length === 0 ? (
                    <div className="text-center py-24 dark:bg-slate-900/50 bg-white rounded-[40px] border dark:border-white/5 border-gray-200 shadow-sm">
                        <Tag className="w-16 h-16 dark:text-slate-800 text-gray-200 mx-auto mb-6" />
                        <h3 className="text-2xl font-black dark:text-slate-400 text-gray-500 mb-2">Nenhum artigo encontrado</h3>
                        <p className="dark:text-slate-600 text-gray-400">Estamos trabalhando para trazer conteúdos incríveis em {category.name}.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                        {posts.map((post) => (
                            <ArticleCard key={post.id} article={post as any} />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
