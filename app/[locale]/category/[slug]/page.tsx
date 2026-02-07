import React from 'react';
import ArticleCard from '@/components/ArticleCard';
import { supabase } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import { Tag } from 'lucide-react';
import { fetchPosts } from '@/lib/blog-service';
import { getTranslations } from 'next-intl/server';

// Force dynamic since we use DB
export const dynamic = 'force-dynamic';

interface CategoryPageProps {
    params: Promise<{
        locale: string;
        slug: string;
    }>;
}

// Fetch category by slug
async function getCategory(slug: string) {
    const { data } = await supabase.from('categories').select('*').eq('slug', slug).single();
    return data;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { slug, locale } = await params;
    const t = await getTranslations('Home');

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
        limit: 50,
        language: locale
    });

    return (
        <div className="min-h-screen dark:bg-slate-950 bg-slate-50 selection:bg-primary selection:text-white pt-[100px]">
            {/* Category Hero */}
            <div className="pt-20 pb-20 px-6 relative overflow-hidden bg-white dark:bg-transparent">
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
                            {locale === 'pt' ? 'Categoria' : locale === 'es' ? 'Categoría' : 'Category'}
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 dark:text-white text-gray-900 capitalize">
                            {category.name}
                        </h1>
                        <div className="h-1.5 w-24 bg-primary rounded-full mb-8"></div>
                        <p className="dark:text-slate-400 text-gray-600 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                            {locale === 'pt' ? `Acompanhe as últimas notícias, histórias e conteúdos exclusivos sobre ${category.name} na Facebrasil.` :
                                locale === 'es' ? `Siga las últimas noticias, historias y contenidos exclusivos sobre ${category.name} en Facebrasil.` :
                                    `Follow the latest news, stories and exclusive content about ${category.name} on Facebrasil.`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Articles Grid */}
            <main className="max-w-[1400px] mx-auto px-6 pb-32">
                {posts.length === 0 ? (
                    <div className="text-center py-24 dark:bg-slate-900/50 bg-white rounded-[40px] border dark:border-white/5 border-gray-200 shadow-sm">
                        <Tag className="w-16 h-16 dark:text-slate-800 text-gray-200 mx-auto mb-6" />
                        <h3 className="text-2xl font-black dark:text-slate-400 text-gray-500 mb-2">
                            {locale === 'pt' ? 'Nenhum artigo encontrado' : locale === 'es' ? 'Nenhum artículo encontrado' : 'No articles found'}
                        </h3>
                        <p className="dark:text-slate-600 text-gray-400">
                            {locale === 'pt' ? `Estamos trabalhando para trazer conteúdos incríveis em ${category.name}.` :
                                locale === 'es' ? `Estamos trabajando para traer contenidos increíbles en ${category.name}.` :
                                    `We are working to bring amazing content in ${category.name}.`}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                        {posts.map((post) => (
                            <ArticleCard key={post.id} article={post} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
