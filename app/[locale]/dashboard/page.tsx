'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { BookOpen, Heart, Trophy, Clock, Star, User as UserIcon, Settings, FolderHeart } from 'lucide-react';
import Link from 'next/link';

interface ArticleItem {
    id: string;
    title: string;
    slug: string;
    featured_image?: { url: string };
    created_at: string;
}

interface UserStats {
    total_points: number;
    level: number;
    level_name: string;
    articles_read: number;
}

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState<UserStats>({
        total_points: 0,
        level: 1,
        level_name: 'Leitor Casual',
        articles_read: 0
    });
    const [history, setHistory] = useState<ArticleItem[]>([]);
    const [favorites, setFavorites] = useState<ArticleItem[]>([]);
    const [collections, setCollections] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'history' | 'favorites' | 'collections'>('history');
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        if (!user) return;

        async function fetchDashboardData() {
            if (!user) return;
            setLoading(true);
            try {
                // Parallel fetch all needed data
                const [
                    { data: repData },
                    { data: histData },
                    { data: favData },
                    { data: collData },
                    { data: profileData }
                ] = await Promise.all([
                    supabase.from('user_reputation').select('*').eq('user_id', user.id).single(),
                    supabase.from('user_activities')
                        .select('article:articles(id, title, slug, featured_image, created_at)')
                        .eq('user_id', user.id)
                        .eq('activity_type', 'read_complete')
                        .order('created_at', { ascending: false })
                        .limit(5),
                    supabase.from('user_activities')
                        .select('article:articles(id, title, slug, featured_image, created_at)')
                        .eq('user_id', user.id)
                        .eq('activity_type', 'bookmark')
                        .order('created_at', { ascending: false }),
                    supabase.from('user_collections')
                        .select('*, items:user_collection_items(count)')
                        .eq('user_id', user.id),
                    supabase.from('profiles').select('*').eq('id', user.id).single()
                ]);

                if (repData) setStats(repData);
                if (histData) setHistory((histData as any[]).map(d => d.article).filter(Boolean) as ArticleItem[]);
                if (favData) setFavorites((favData as any[]).map(d => d.article).filter(Boolean) as ArticleItem[]);
                if (collData) setCollections(collData);
                if (profileData) setProfile(profileData);

            } catch (error) {
                console.error('[Dashboard] Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, [user]);

    if (authLoading || (user && loading)) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-medium">Carregando seu painel...</p>
            </div>
        );
    }

    if (!user) return null;

    const displayName = profile?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
    const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-primary selection:text-white">
            <Navbar />

            <main className="pt-24 pb-20 px-6 max-w-[1280px] mx-auto">

                {/* User Profile Header */}
                <section className="mb-12 flex flex-col md:flex-row items-center gap-8 bg-slate-900/50 p-8 rounded-2xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>

                    <div className="relative w-28 h-28 rounded-full bg-slate-800 border-2 border-primary/50 overflow-hidden flex items-center justify-center ring-4 ring-primary/10">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-14 h-14 text-primary/40" />
                        )}
                    </div>

                    <div className="relative text-center md:text-left flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                            <h1 className="text-4xl font-black">{displayName}</h1>
                            <Link
                                href="/pt/settings"
                                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-bold border border-white/10 transition-all self-center md:self-auto"
                            >
                                <Settings className="w-4 h-4" />
                                Editar Perfil
                            </Link>
                        </div>
                        <p className="text-slate-400 mb-6">Membro desde {user?.created_at ? new Date(user.created_at).getFullYear() : '2025'}</p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-full text-xs font-bold text-accent-yellow border border-accent-yellow/20">
                                <Trophy className="w-4 h-4" />
                                <span>{stats.level_name} • Nível {stats.level}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-full text-xs font-bold text-primary border border-primary/20">
                                <Star className="w-4 h-4" />
                                <span>{stats.total_points.toLocaleString()} Facetas</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content Area (History & Favorites) */}
                    <div className="lg:col-span-2 space-y-8">

                        <div className="border-b border-white/10 flex gap-8">
                            {[
                                { id: 'history', label: 'Lidos Recentemente', icon: Clock },
                                { id: 'favorites', label: 'Favoritos', icon: Heart },
                                { id: 'collections', label: 'Coleções', icon: FolderHeart }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`pb-4 text-sm font-bold transition-all flex items-center gap-2 relative ${activeTab === tab.id
                                        ? 'text-white'
                                        : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full shadow-[0_0_10px_rgba(234,20,53,0.5)]"></div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Content List */}
                        <div className="space-y-4 min-h-[400px]">
                            {activeTab === 'history' && (
                                history.length > 0 ? history.map((article) => (
                                    <Link key={article.id} href={`/pt/article/${article.slug}`} className="flex gap-5 p-4 rounded-xl bg-slate-900/30 border border-white/5 hover:bg-slate-900/50 hover:border-white/10 transition-all group animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="w-24 h-24 rounded-lg bg-slate-800 shrink-0 overflow-hidden relative">
                                            {article.featured_image?.url ? (
                                                <img src={article.featured_image.url} alt={article.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-700">
                                                    <BookOpen className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 text-[10px] text-primary uppercase font-black mb-2 tracking-widest">
                                                <Clock className="w-3 h-3" />
                                                <span>{new Date(article.created_at).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                            <h3 className="text-xl font-black leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2 italic uppercase">
                                                {article.title}
                                            </h3>
                                        </div>
                                    </Link>
                                )) : <EmptyState message="Você ainda não leu nenhum artigo recentemente." />
                            )}

                            {activeTab === 'favorites' && (
                                favorites.length > 0 ? favorites.map((article) => (
                                    <Link key={article.id} href={`/pt/article/${article.slug}`} className="flex gap-5 p-4 rounded-xl bg-slate-900/30 border border-white/5 hover:bg-slate-900/50 hover:border-white/10 transition-all group animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="w-24 h-24 rounded-lg bg-slate-800 shrink-0 overflow-hidden relative">
                                            {article.featured_image?.url ? (
                                                <img src={article.featured_image.url} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                            ) : <BookOpen className="w-8 h-8 m-auto text-slate-700 h-full" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 text-[10px] text-primary uppercase font-black mb-2 tracking-widest">
                                                <Heart className="w-3 h-3 fill-current" />
                                                <span>Favoritado</span>
                                            </div>
                                            <h3 className="text-xl font-black leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2 italic uppercase">
                                                {article.title}
                                            </h3>
                                        </div>
                                    </Link>
                                )) : <EmptyState message="Sua lista de favoritos está vazia." />
                            )}

                            {activeTab === 'collections' && (
                                collections.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {collections.map((coll) => (
                                            <div key={coll.id} className="p-6 rounded-xl bg-slate-900/30 border border-white/5 hover:border-primary/30 transition-all group h-fit">
                                                <FolderHeart className="w-8 h-8 text-primary mb-4" />
                                                <h3 className="text-xl font-black mb-1 italic uppercase">{coll.name}</h3>
                                                <p className="text-sm text-slate-500 mb-4">{coll.items?.length || 0} itens salvos</p>
                                                <button className="text-xs font-bold text-primary uppercase tracking-widest group-hover:underline">Ver Coleção</button>
                                            </div>
                                        ))}
                                    </div>
                                ) : <EmptyState message="Você ainda não criou nenhuma coleção." />
                            )}
                        </div>

                    </div>

                    {/* Sidebar (Gamification & Stats) */}
                    <div className="space-y-6">

                        {/* Weekly Challenge (Mock logic but real XP context) */}
                        <div className="bg-gradient-to-br from-primary/20 to-slate-900 p-6 rounded-2xl border border-primary/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16"></div>

                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 relative">
                                <Trophy className="w-5 h-5 text-accent-yellow" />
                                Desafio Semanal
                            </h3>
                            <div className="space-y-4 relative">
                                <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-300 font-bold">Ler 5 Artigos de Negócios</span>
                                        <span className="text-primary font-black">{Math.min(stats.articles_read, 5)}/5</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-1000 shadow-[0_0_10px_rgba(234,20,53,0.5)]"
                                            style={{ width: `${Math.min((stats.articles_read / 5) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <button className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20">
                                    Ver Todos os Desafios
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                                <Star className="w-5 h-5 text-primary" />
                                Suas Estatísticas
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-950 p-5 rounded-xl text-center border border-white/5">
                                    <div className="text-3xl font-black text-white mb-1 tracking-tighter">{stats.articles_read}</div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Artigos Lidos</div>
                                </div>
                                <div className="bg-slate-950 p-5 rounded-xl text-center border border-white/5">
                                    <div className="text-3xl font-black text-white mb-1 tracking-tighter">{(stats.total_points / 100).toFixed(0)}</div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Conquistas</div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

            </main>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-20 text-center bg-slate-900/10 rounded-2xl border border-dashed border-white/10">
            <BookOpen className="w-12 h-12 text-slate-700 mb-4" />
            <p className="text-slate-500 italic">{message}</p>
        </div>
    );
}
