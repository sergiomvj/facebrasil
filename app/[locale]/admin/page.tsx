// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FileText, Eye, Video, FolderOpen, TrendingUp, Clock, Calendar, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface DashboardStats {
    publishedThisMonth: number;
    viewsThisMonth: number;
    avgReadTime: number;
    totalArticles: number;
    postsEuReporterMonth: number;
    totalViews: number;
    activeCategories: number;
    articlesFbrNews: number;
    viewsFbrNews: number;
    avgReadTimeFbr: number;
}

export default function AdminDashboard() {
    const params = useParams();
    const locale = (params.locale as string) || 'pt';
    const [stats, setStats] = useState<DashboardStats>({
        publishedThisMonth: 0,
        viewsThisMonth: 0,
        avgReadTime: 0,
        totalArticles: 0,
        postsEuReporterMonth: 0,
        totalViews: 0,
        activeCategories: 0,
        articlesFbrNews: 0,
        viewsFbrNews: 0,
        avgReadTimeFbr: 0,
    });
    interface RecentArticle {
        id: string;
        title: string;
        slug: string;
        status: string;
        created_at: string;
        author?: { name: string } | null;
    }

    const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchDashboardData() {
        setLoading(true);
        console.log('[Dashboard] Fetching data...');

        try {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const startStr = startOfMonth.toISOString();

            const [
                { count: totalCount },
                { count: publishedThisMonth },
                { data: allArticlesViews },
                { data: allReads },
                { data: fbrNewsCategory },
                { data: categories },
                { data: recent },
                { count: euReporterThisMonth }
            ] = await Promise.all([
                supabase.from('articles').select('*', { count: 'exact', head: true }),
                supabase.from('articles').select('*', { count: 'exact', head: true })
                    .eq('status', 'PUBLISHED')
                    .gte('published_at', startStr),
                supabase.from('articles').select('id, views, category_id, read_time'),
                supabase.from('article_reads').select('read_time_seconds, article_id, created_at'),
                supabase.from('categories').select('id').eq('slug', 'fbr-news').single(),
                supabase.from('categories').select('id'),
                supabase.from('articles').select(`
                    id, title, slug, status, created_at,
                    author:profiles(name)
                `).order('created_at', { ascending: false }).limit(5),
                supabase.from('user_video_reports').select('*', { count: 'exact', head: true })
                    .gte('created_at', startStr)
            ]);

            const fbrCatId = fbrNewsCategory?.id;

            const articles = allArticlesViews || [];
            const reads = allReads || [];

            const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
            const viewsThisMonth = reads.filter(r => new Date(r.created_at) >= startOfMonth).length;

            const avgReadTime = reads.length > 0
                ? Math.round(reads.reduce((sum, r) => sum + (r.read_time_seconds || 0), 0) / reads.length)
                : articles.length > 0
                    ? Math.round((articles.reduce((sum, a) => sum + (a.read_time || 0), 0) / articles.length) * 60)
                    : 0;

            const fbrArticles = articles.filter(a => a.category_id === fbrCatId);
            const articlesFbrNews = fbrArticles.length;
            const viewsFbrNews = fbrArticles.reduce((sum, a) => sum + (a.views || 0), 0);
            
            const fbrArticleIds = new Set(fbrArticles.map(a => a.id));
            const fbrReads = reads.filter(r => fbrArticleIds.has(r.article_id));
            const avgReadTimeFbr = fbrReads.length > 0
                ? Math.round(fbrReads.reduce((sum, r) => sum + (r.read_time_seconds || 0), 0) / fbrReads.length)
                : fbrArticles.length > 0
                    ? Math.round((fbrArticles.reduce((sum, a) => sum + (a.read_time || 0), 0) / fbrArticles.length) * 60)
                    : 0;

            setStats({
                publishedThisMonth: publishedThisMonth || 0,
                viewsThisMonth,
                avgReadTime,
                totalArticles: totalCount || 0,
                postsEuReporterMonth: euReporterThisMonth || 0,
                totalViews,
                activeCategories: categories?.length || 0,
                articlesFbrNews,
                viewsFbrNews,
                avgReadTimeFbr
            });
            setRecentArticles((recent as unknown as RecentArticle[]) || []);
        } catch (error) {
            console.error('[Dashboard] Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void fetchDashboardData();
    }, []);

    const formatTime = (secs: number) => {
        if (secs < 60) return `${secs}s`;
        return `${Math.floor(secs / 60)}m ${secs % 60}s`;
    };

    const topRowCards = [
        { title: 'Publicados no mês', value: stats.publishedThisMonth, icon: Calendar, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
        { title: 'Visualizações do mês', value: stats.viewsThisMonth.toLocaleString(), icon: Eye, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
        { title: 'Tempo de Leitura Médio', value: formatTime(stats.avgReadTime), icon: Clock, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
        { title: 'Total de artigos', value: stats.totalArticles.toLocaleString(), icon: FileText, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
        { title: 'Posts Eu-reporter do mês', value: stats.postsEuReporterMonth.toLocaleString(), icon: Video, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    ];

    const bottomRowCards = [
        { title: 'Categorias Ativas', value: stats.activeCategories, icon: FolderOpen, color: 'text-slate-400', bgColor: 'bg-slate-500/10' },
        { title: 'Artigos FBR-News', value: stats.articlesFbrNews.toLocaleString(), icon: FileText, color: 'text-rose-500', bgColor: 'bg-rose-500/10' },
        { title: 'Visualizações FBR-News', value: stats.viewsFbrNews.toLocaleString(), icon: BarChart2, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
        { title: 'Tempo Médio FBR-News', value: formatTime(stats.avgReadTimeFbr), icon: Clock, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
        { title: 'Total de visualizações', value: stats.totalViews.toLocaleString(), icon: TrendingUp, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="dark:text-slate-400 text-gray-600">Carregando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black dark:text-white text-gray-900 mb-2">Dashboard</h1>
                <p className="dark:text-slate-400 text-gray-600">Visão geral do seu conteúdo</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                    href={`/${locale}/admin/editor`}
                    className="dark:bg-slate-900 bg-white rounded-xl p-8 border dark:border-white/10 border-gray-200 hover:border-primary transition-all group lg:flex lg:items-center lg:gap-8 hover:scale-[1.01] active:scale-[0.99]"
                >
                    <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary transition-colors">
                        <FileText className="w-10 h-10 text-primary group-hover:text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black dark:text-white text-gray-900 mb-1">Novo Artigo</h3>
                        <p className="dark:text-slate-400 text-gray-600 text-sm">Criar um novo artigo ou editorial para o portal</p>
                    </div>
                </Link>

                <Link
                    href={`/${locale}/admin/video-reports`}
                    className="dark:bg-slate-900 bg-white rounded-xl p-8 border dark:border-white/10 border-gray-200 hover:border-primary transition-all group lg:flex lg:items-center lg:gap-8 hover:scale-[1.01] active:scale-[0.99]"
                >
                    <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary transition-colors">
                        <Video className="w-10 h-10 text-primary group-hover:text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black dark:text-white text-gray-900 mb-1">Moderar Vídeos</h3>
                        <p className="dark:text-slate-400 text-gray-600 text-sm">Acessar painel de videoreportagem e comunidade</p>
                    </div>
                </Link>
            </div>

            {/* Stats Grid - Row 1 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {topRowCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.title}
                            className="dark:bg-slate-900 bg-white rounded-xl p-4 border dark:border-white/10 border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest dark:text-slate-400 text-gray-600 mb-1">{card.title}</p>
                                    <p className="text-2xl font-black dark:text-white text-gray-900">{card.value}</p>
                                </div>
                                <div className={`p-2 rounded-lg ${card.bgColor} hidden sm:block`}>
                                    <Icon className={`w-5 h-5 ${card.color}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Stats Grid - Row 2 */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {bottomRowCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.title}
                            className="dark:bg-slate-900 bg-white rounded-xl p-4 border dark:border-white/10 border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest dark:text-slate-400 text-gray-600 mb-1">{card.title}</p>
                                    <p className="text-xl font-black dark:text-white text-gray-900">{card.value}</p>
                                </div>
                                <div className={`p-2 rounded-lg ${card.bgColor} hidden sm:block`}>
                                    <Icon className={`w-4 h-4 ${card.color}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Activity */}
            <div className="dark:bg-slate-900 bg-white rounded-xl border dark:border-white/10 border-gray-200 overflow-hidden">
                <div className="p-6 border-b dark:border-white/10 border-gray-200">
                    <h2 className="text-xl font-black dark:text-white text-gray-900">Atividade Recente</h2>
                </div>
                <div className="divide-y dark:divide-white/10 divide-gray-200">
                    {recentArticles.map((article) => (
                        <Link
                            key={article.id}
                            href={`/${locale}/admin/editor?id=${article.id}`}
                            className="flex items-center justify-between p-6 dark:hover:bg-slate-800 hover:bg-gray-50 transition-colors group"
                        >
                            <div className="flex-1">
                                <h3 className="font-bold dark:text-white text-gray-900 group-hover:text-primary transition-colors mb-1">
                                    {article.title}
                                </h3>
                                <p className="text-sm dark:text-slate-400 text-gray-600">
                                    Por {article.author?.name || 'Desconhecido'} • {new Date(article.created_at).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${article.status === 'PUBLISHED'
                                    ? 'bg-green-500/10 text-green-500'
                                    : 'bg-amber-500/10 text-amber-500'
                                    }`}
                            >
                                {article.status === 'PUBLISHED' ? 'PUBLICADO' : 'RASCUNHO'}
                            </span>
                        </Link>
                    ))}
                    {recentArticles.length === 0 && (
                        <div className="p-12 text-center dark:text-slate-500 text-gray-400">
                            Nenhum artigo recente
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

