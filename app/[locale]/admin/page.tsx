// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FileText, Eye, Video, FolderOpen, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    totalViews: number;
    pendingVideos: number;
    activeCategories: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalArticles: 0,
        publishedArticles: 0,
        draftArticles: 0,
        totalViews: 0,
        pendingVideos: 0,
        activeCategories: 0,
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
            // Fetch total, published, and draft counts correctly (handling > 1000 items)
            const [
                { count: totalCount },
                { count: publishedCount },
                { count: draftCount },
                { data: viewsData },
                { data: videos },
                { data: categories },
                { data: recent }
            ] = await Promise.all([
                supabase.from('articles').select('*', { count: 'exact', head: true }),
                supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'PUBLISHED'),
                supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'DRAFT'),
                supabase.from('articles').select('views'),
                supabase.from('user_video_reports').select('id').eq('status', 'PENDING'),
                supabase.from('categories').select('id'),
                supabase.from('articles').select(`
                    id, title, slug, status, created_at,
                    author:profiles(name)
                `).order('created_at', { ascending: false }).limit(5)
            ]);

            const totalViews = viewsData?.reduce((sum, a) => sum + (a.views || 0), 0) || 0;

            const finalStats = {
                totalArticles: totalCount || 0,
                publishedArticles: publishedCount || 0,
                draftArticles: draftCount || 0,
                totalViews,
                pendingVideos: videos?.length || 0,
                activeCategories: categories?.length || 0,
            };

            setStats(finalStats);
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

    const statCards = [
        {
            title: 'Total de Artigos',
            value: stats.totalArticles,
            icon: FileText,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            title: 'Publicados',
            value: stats.publishedArticles,
            icon: TrendingUp,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
        {
            title: 'Rascunhos',
            value: stats.draftArticles,
            icon: Clock,
            color: 'text-amber-500',
            bgColor: 'bg-amber-500/10',
        },
        {
            title: 'Visualizações Totais',
            value: stats.totalViews.toLocaleString(),
            icon: Eye,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
        },
        {
            title: 'Vídeos Pendentes',
            value: stats.pendingVideos,
            icon: Video,
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
        },
        {
            title: 'Categorias Ativas',
            value: stats.activeCategories,
            icon: FolderOpen,
            color: 'text-indigo-500',
            bgColor: 'bg-indigo-500/10',
        },
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.title}
                            className="dark:bg-slate-900 bg-white rounded-xl p-6 border dark:border-white/10 border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm dark:text-slate-400 text-gray-600 mb-1">{card.title}</p>
                                    <p className="text-3xl font-black dark:text-white text-gray-900">{card.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                                    <Icon className={`w-6 h-6 ${card.color}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                    href="/admin/editor"
                    className="dark:bg-slate-900 bg-white rounded-xl p-8 border dark:border-white/10 border-gray-200 hover:border-primary transition-all group"
                >
                    <FileText className="w-12 h-12 text-primary mb-4" />
                    <h3 className="text-xl font-black dark:text-white text-gray-900 mb-2">Novo Artigo</h3>
                    <p className="dark:text-slate-400 text-gray-600">Criar um novo artigo ou editorial</p>
                </Link>

                <Link
                    href="/admin/video-reports"
                    className="dark:bg-slate-900 bg-white rounded-xl p-8 border dark:border-white/10 border-gray-200 hover:border-primary transition-all group"
                >
                    <Video className="w-12 h-12 text-primary mb-4" />
                    <h3 className="text-xl font-black dark:text-white text-gray-900 mb-2">Moderar Vídeos</h3>
                    <p className="dark:text-slate-400 text-gray-600">
                        {stats.pendingVideos} vídeo{stats.pendingVideos !== 1 ? 's' : ''} aguardando aprovação
                    </p>
                </Link>
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
                            href={`/admin/editor?id=${article.id}`}
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

