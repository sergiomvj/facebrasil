import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import { fetchPosts } from '@/lib/blog-service';
import { Newspaper, TrendingUp, Zap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function FbrNewsPage() {
    const [newsData, trendingData] = await Promise.all([
        fetchPosts({ category: 'fbr-news', limit: 12 }),
        fetchPosts({ limit: 5, sort: 'popular' })
    ]);

    const news = newsData.data || [];
    const trending = trendingData.data || [];

    return (
        <div className="min-h-screen dark:bg-slate-950 bg-slate-50">
            <Navbar />

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-[1400px] mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b dark:border-white/10 border-gray-200 pb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest">
                                    <span className="size-1.5 bg-primary rounded-full animate-pulse"></span>
                                    Live Updates
                                </div>
                                <span className="text-slate-500 font-bold text-xs uppercase tracking-widest opacity-50">Global Network</span>
                            </div>
                            <h1 className="text-5xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/40 tracking-tighter flex items-center gap-4">
                                <Newspaper className="w-12 h-12 md:w-16 md:h-16 text-primary" />
                                FBR NEWS
                            </h1>
                        </div>
                        <p className="mt-4 md:mt-0 dark:text-slate-400 text-gray-600 max-w-sm text-sm font-medium border-l border-primary/30 pl-6 h-fit italic">
                            A sua fonte definitiva de notícias sobre a comunidade brasileira nos Estados Unidos e no mundo, alimentada por IA e curadoria humana.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* News Grid */}
                        <div className="lg:col-span-8 space-y-12">
                            {news.length === 0 ? (
                                <div className="text-center py-20 dark:bg-slate-900/50 bg-white rounded-3xl border dark:border-white/5 border-gray-200">
                                    <Zap className="w-12 h-12 dark:text-slate-700 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold dark:text-slate-400 text-gray-500">Nenhuma notícia encontrada</h3>
                                    <p className="dark:text-slate-500 text-gray-400">Estamos preparando as últimas atualizações.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {news.map((post) => (
                                        <ArticleCard key={post.id} article={post} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-10">
                            <section className="dark:bg-slate-900 bg-white rounded-3xl p-8 border dark:border-white/5 border-gray-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-8">
                                    <TrendingUp className="w-6 h-6 text-primary" />
                                    <h2 className="text-xl font-black dark:text-white text-gray-900">Em Destaque</h2>
                                </div>
                                <div className="space-y-6">
                                    {trending.map((post, index) => (
                                        <div key={post.id} className="group cursor-pointer">
                                            <div className="flex gap-4">
                                                <span className="text-3xl font-black dark:text-slate-800 text-gray-200 group-hover:text-primary transition-colors pr-2">
                                                    {index + 1}
                                                </span>
                                                <div className="space-y-1">
                                                    <h3 className="dark:text-white text-gray-800 font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 text-sm">
                                                        {post.title}
                                                    </h3>
                                                    <span className="text-[10px] dark:text-slate-500 text-gray-500 uppercase font-bold">
                                                        {post.categories[0]}
                                                    </span>
                                                </div>
                                            </div>
                                            {index < trending.length - 1 && <div className="h-px dark:bg-white/5 bg-gray-100 w-full mt-6" />}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <div className="dark:bg-primary/10 bg-primary/5 rounded-3xl p-8 border border-primary/20">
                                <h3 className="text-xl font-black text-primary mb-4 italic">Newsletter</h3>
                                <p className="text-xs dark:text-slate-400 text-gray-600 mb-6 font-medium">
                                    Receba o melhor da FBR News diretamente no seu e-mail.
                                </p>
                                <div className="space-y-3">
                                    <input
                                        type="email"
                                        placeholder="Seu e-mail..."
                                        className="w-full bg-white dark:bg-slate-800 border dark:border-white/10 border-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                                    />
                                    <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-full text-sm transition-all">
                                        Inscrever-se
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
