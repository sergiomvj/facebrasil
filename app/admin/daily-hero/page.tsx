'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Star, Search, Calendar, Eye } from 'lucide-react';
import Image from 'next/image';

interface Article {
    id: string;
    title: string;
    slug: string;
    featured_image: any;
    colocar_hero: boolean;
    hero_set_at: string | null;
    views: number;
    created_at: string;
}

export default function DailyHeroPage() {
    const [currentHero, setCurrentHero] = useState<Article | null>(null);
    const [articles, setArticles] = useState<Article[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);

        // Fetch current hero
        const { data: heroData } = await supabase
            .from('articles')
            .select('*')
            .eq('colocar_hero', true)
            .eq('status', 'PUBLISHED')
            .single();

        setCurrentHero(heroData);

        // Fetch all published articles
        const { data: articlesData } = await supabase
            .from('articles')
            .select('*')
            .eq('status', 'PUBLISHED')
            .order('created_at', { ascending: false })
            .limit(20);

        setArticles(articlesData || []);
        setLoading(false);
    };

    const setAsHero = async (articleId: string) => {
        if (!confirm('Definir este artigo como Hero Diário?')) return;
        setLoading(true);

        try {
            // Optional: Explicitly uncheck others to keep it clean, though backend logic sorts by date.
            // This ensures only ONE is set to true at a time if we want strictness.
            if (currentHero) {
                await supabase
                    .from('articles')
                    .update({ colocar_hero: false })
                    .eq('id', currentHero.id);
            }

            // Set new hero with explicit timestamp
            const { error } = await supabase
                .from('articles')
                .update({
                    colocar_hero: true,
                    hero_set_at: new Date().toISOString()
                })
                .eq('id', articleId);

            if (error) {
                console.error('Error setting hero:', error);
                alert('Erro ao definir Hero: ' + error.message);
            } else {
                await fetchData();
            }
        } catch (err) {
            console.error(err);
            alert('Erro inesperado.');
        } finally {
            setLoading(false);
        }
    };

    const removeHero = async () => {
        if (!currentHero || !confirm('Remover o Hero Diário atual?')) return;

        const { error } = await supabase
            .from('articles')
            .update({ colocar_hero: false })
            .eq('id', currentHero.id);

        if (!error) {
            fetchData();
        }
    };

    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getImageUrl = (featuredImage: any) => {
        try {
            const parsed = typeof featuredImage === 'string' ? JSON.parse(featuredImage) : featuredImage;
            return parsed.url || '';
        } catch {
            return typeof featuredImage === 'string' ? featuredImage : '';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black dark:text-white text-gray-900 mb-2">Hero Diário</h1>
                <p className="dark:text-slate-400 text-gray-600">Gerencie o artigo em destaque na página inicial</p>
            </div>

            {/* Current Hero */}
            <div className="dark:bg-slate-900 bg-white rounded-xl p-6 border dark:border-white/10 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-black dark:text-white text-gray-900 flex items-center gap-2">
                        <Star className="w-6 h-6 text-primary" fill="currentColor" />
                        Hero Atual
                    </h2>
                    {currentHero && (
                        <button
                            onClick={removeHero}
                            className="px-4 py-2 rounded-lg dark:bg-slate-800 bg-gray-200 dark:hover:bg-slate-700 hover:bg-gray-300 dark:text-slate-300 text-gray-700 font-medium transition-colors"
                        >
                            Remover Hero
                        </button>
                    )}
                </div>

                {currentHero ? (
                    <div className="flex gap-6">
                        <div className="w-48 h-32 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 relative">
                            {getImageUrl(currentHero.featured_image) && (
                                <Image
                                    src={getImageUrl(currentHero.featured_image)}
                                    alt={currentHero.title}
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold dark:text-white text-gray-900 mb-2">{currentHero.title}</h3>
                            <div className="flex items-center gap-4 text-sm dark:text-slate-400 text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    <span>{currentHero.views || 0} visualizações</span>
                                </div>
                                {currentHero.hero_set_at && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Definido em {new Date(currentHero.hero_set_at).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 dark:text-slate-500 text-gray-400">
                        Nenhum Hero Diário definido
                    </div>
                )}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-slate-400 text-gray-500" />
                <input
                    type="text"
                    placeholder="Buscar artigos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-lg dark:bg-slate-900 bg-white border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            {/* Articles List */}
            <div className="dark:bg-slate-900 bg-white rounded-xl border dark:border-white/10 border-gray-200 overflow-hidden">
                <div className="p-6 border-b dark:border-white/10 border-gray-200">
                    <h2 className="text-xl font-black dark:text-white text-gray-900">Selecionar Novo Hero</h2>
                </div>
                <div className="divide-y dark:divide-white/10 divide-gray-200">
                    {filteredArticles.map((article) => (
                        <div
                            key={article.id}
                            className="flex items-center gap-4 p-4 dark:hover:bg-slate-800 hover:bg-gray-50 transition-colors"
                        >
                            <div className="w-24 h-16 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 relative">
                                {getImageUrl(article.featured_image) && (
                                    <Image
                                        src={getImageUrl(article.featured_image)}
                                        alt={article.title}
                                        fill
                                        className="object-cover"
                                    />
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold dark:text-white text-gray-900 mb-1">{article.title}</h3>
                                <p className="text-sm dark:text-slate-400 text-gray-600">
                                    {article.views || 0} visualizações • {new Date(article.created_at).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                            <button
                                onClick={() => setAsHero(article.id)}
                                disabled={article.id === currentHero?.id}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${article.id === currentHero?.id
                                    ? 'dark:bg-slate-800 bg-gray-200 dark:text-slate-500 text-gray-400 cursor-not-allowed'
                                    : 'bg-primary hover:bg-primary/90 text-white'
                                    }`}
                            >
                                {article.id === currentHero?.id ? 'Hero Atual' : 'Definir como Hero'}
                            </button>
                        </div>
                    ))}
                    {filteredArticles.length === 0 && (
                        <div className="p-12 text-center dark:text-slate-500 text-gray-400">
                            Nenhum artigo encontrado
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
