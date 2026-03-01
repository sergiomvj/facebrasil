import React from 'react';
import { Zap, Clock, BookOpen, Calendar } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import AIAssistant from '@/components/AIAssistant';
import ArticleReaderTracker from '@/components/ArticleReaderTracker';
import AdSpace from '@/components/AdSpace';
import ContentRenderer from '@/components/ContentRenderer';
import SocialShareBar from '@/components/SocialShareBar';
import { fetchPost, fetchPosts } from '@/lib/blog-service';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { FALLBACK_ARTICLE_IMAGE } from '@/lib/constants';

interface PageProps {
    params: Promise<{
        locale: string;
        id: string; // Slug
    }>;
}

// Generate static params for all supported locales
export async function generateStaticParams() {
    const locales = routing.locales;
    const params = [];

    for (const locale of locales) {
        const { data: posts } = await fetchPosts({ limit: 50, language: locale });
        for (const post of posts) {
            params.push({ locale, id: post.slug });
        }
    }
    return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id, locale } = await params;
    const article = await fetchPost(id, locale);
    if (!article) return { title: 'Article Not Found' };
    return {
        title: `${article.seo.metaTitle} | Facebrasil`,
        description: article.seo.metaDescription,
    };
}

export default async function ArticlePage({ params }: PageProps) {
    const { id, locale } = await params;
    const supabase = await createClient();
    const article = await fetchPost(id, locale, supabase);
    const t = await getTranslations('Home');

    if (!article) {
        notFound();
    }

    return (
        <article className="min-h-screen pb-20 pt-[100px]">
            {/* Ad Space Banner Top */}
            <div className="max-w-[1024px] mx-auto w-full px-6 mb-8">
                <AdSpace position="banner_top" className="h-[150px] w-full" />
            </div>

            {/* Article Header / Hero */}
            <div className="relative h-[60vh] w-full">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${article.featuredImage?.url || FALLBACK_ARTICLE_IMAGE}')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-[1000px] mx-auto z-10">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6 border border-primary/30 backdrop-blur-md">
                        {article.categories[0]}
                    </span>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                        {article.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-slate-300">
                        <div className="flex items-center gap-3">
                            {article.author.avatar && (
                                <div
                                    className="w-10 h-10 rounded-full bg-cover border border-white/20 shadow-lg"
                                    style={{ backgroundImage: `url('${article.author.avatar}')` }}
                                ></div>
                            )}
                            <div>
                                <p className="text-sm font-bold text-white capitalize">{article.author.name}</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Editor</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4" />
                                <span>{t('readTime', { time: article.readTime })}</span>
                            </div>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(article.publishedAt).toLocaleDateString(locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-US')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-[800px] mx-auto px-6 -mt-16 relative z-10">
                {/* Fixed Background for content area */}
                <div className="bg-white dark:bg-slate-950 rounded-3xl p-8 md:p-12 shadow-2xl border dark:border-white/5 border-gray-100">

                    {/* AI Context Highlights (Automated News) */}
                    {article.source_type === 'automated' && article.ai_context && (
                        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 mb-12 shadow-inner">
                            <div className="flex items-center gap-2 mb-6 text-accent-yellow">
                                <Zap className="w-5 h-5 fill-current" />
                                <span className="text-xs font-black uppercase tracking-widest">IA Insight: Contexto Adicional</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {article.ai_context.historical && (
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Histórico</h4>
                                        <p className="text-sm text-slate-300 italic">{"\""}{article.ai_context.historical}{"\""}</p>
                                    </div>
                                )}
                                {article.ai_context.statistical && (
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dados & Estatísticas</h4>
                                        <p className="text-sm text-slate-300 italic">{"\""}{article.ai_context.statistical}{"\""}</p>
                                    </div>
                                )}
                                {article.ai_context.geopolitical && (
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Impacto Geopolítico</h4>
                                        <p className="text-sm text-slate-300 italic">{"\""}{article.ai_context.geopolitical}{"\""}</p>
                                    </div>
                                )}
                                {article.ai_context.practical && (
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dica Prática</h4>
                                        <p className="text-sm text-slate-300 italic">{"\""}{article.ai_context.practical}{"\""}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Article Body */}
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        <ContentRenderer content={article.content} />
                    </div>

                    {/* XP Tracker */}
                    <div className="mt-12 pt-8 border-t dark:border-white/10 border-gray-100">
                        <ArticleReaderTracker articleId={article.id} />
                    </div>
                </div>

                {/* Sidebar Like Mobile Bottom Navigation or similar could go here */}
            </div>

            <SocialShareBar
                articleId={article.id}
                title={article.title}
                socialSummary={article.socialSummary || article.excerpt}
                instagramUrl={article.instagramPostUrl}
            />


            <div className="mt-16 py-12 bg-slate-100 dark:bg-slate-900/30">
                <AdSpace position="super_footer" />
            </div>
        </article>
    );
}
