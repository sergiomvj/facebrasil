import React from 'react';
import { Zap } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import AIAssistant from '@/components/AIAssistant';
import ArticleReaderTracker from '@/components/ArticleReaderTracker';
import AdSpace from '@/components/AdSpace';
import ContentRenderer from '@/components/ContentRenderer';
import SocialShareBar from '@/components/SocialShareBar';
import { fetchPost, fetchPosts } from '@/lib/blog-service';

interface PageProps {
    params: Promise<{
        id: string; // Dynamic route uses 'id' but we treat it as slug in service
    }>;
}

// Generate static params for static generation
export async function generateStaticParams() {
    const { data: posts } = await fetchPosts({ limit: 100 });
    return posts.map((post) => ({
        id: post.slug,
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const article = await fetchPost(id);
    if (!article) return { title: 'Article Not Found' };
    return {
        title: `${article.seo.metaTitle} | Facebrasil`,
        description: article.seo.metaDescription,
    };
}

export default async function ArticlePage({ params }: PageProps) {
    const { id } = await params;
    const article = await fetchPost(id);

    if (!article) {
        notFound();
    }

    // Sanitize content or use simple display for now (Note: Use DOMPurify Client Side if rendering HTML)
    // For Server Components we trust the backend sanitization or use a library like 'sanitize-html' if needed.
    // Since we are creating a custom display with blocks in future, for now we will just dump text.

    return (
        <article className="min-h-screen pb-20">
            {/* Article Header / Hero */}
            <div className="relative h-[60vh] w-full">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${article.featuredImage.url}')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-[1000px] mx-auto">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6 border border-primary/30 backdrop-blur-md">
                        {article.categories[0]}
                    </span>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                        {article.title}
                    </h1>

                    <div className="flex items-center gap-4 text-slate-300">
                        <div className="flex items-center gap-3">
                            {article.author.avatar && (
                                <div
                                    className="w-10 h-10 rounded-full bg-cover border border-white/20"
                                    style={{ backgroundImage: `url('${article.author.avatar}')` }}
                                ></div>
                            )}
                            <div>
                                <p className="text-sm font-bold text-white">{article.author.name}</p>
                                <p className="text-xs text-slate-400">Editor</p>
                            </div>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                        <span className="text-sm">{article.readTime} min read</span>
                        <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                        <span className="text-sm">{new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-[800px] mx-auto px-6 -mt-10 relative z-10">

                {/* AI Context Highlights (Automated News) */}
                {article.source_type === 'automated' && article.ai_context && (
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 mb-12 shadow-2xl backdrop-blur-md">
                        <div className="flex items-center gap-2 mb-6 text-accent-yellow">
                            <Zap className="w-5 h-5 fill-current" />
                            <span className="text-xs font-black uppercase tracking-widest">IA Insight: Contexto Adicional</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {article.ai_context.historical && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Histórico</h4>
                                    <p className="text-sm text-slate-300 italic">"{article.ai_context.historical}"</p>
                                </div>
                            )}
                            {article.ai_context.statistical && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dados & Estatísticas</h4>
                                    <p className="text-sm text-slate-300 italic">"{article.ai_context.statistical}"</p>
                                </div>
                            )}
                            {article.ai_context.geopolitical && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Impacto Geopolítico</h4>
                                    <p className="text-sm text-slate-300 italic">"{article.ai_context.geopolitical}"</p>
                                </div>
                            )}
                            {article.ai_context.practical && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dica Prática</h4>
                                    <p className="text-sm text-slate-300 italic">"{article.ai_context.practical}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* AI Assistant - Temporarily disabled */}
                {/* <AIAssistant articleContent={article.content} /> */}

                {/* Article Body */}
                <ContentRenderer content={article.content} />

                {/* XP Tracker */}
                <ArticleReaderTracker articleId={article.id} />
            </div>

            <SocialShareBar
                title={article.title}
                socialSummary={article.socialSummary || article.excerpt}
                instagramUrl={article.instagramPostUrl}
            />
        </article>
    );
}
