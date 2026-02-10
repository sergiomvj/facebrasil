'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, Eye, Calendar, User, Search, Filter, Globe, Sparkles, X, BrainCircuit, Type, FileText, Languages } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { deleteArticle, upsertArticle } from '@/app/actions/article-actions';
import { generateArticle, generateKeywords } from '@/app/actions/ai-actions';
import { routing } from '@/i18n/routing';

interface ArticleListItem {
    id: string;
    title: string;
    slug: string;
    status: string;
    published_at: string;
    views: number;
    created_at: string;
    language: string;
    author: { name: string } | null;
    category: { name: string; color: string; slug: string } | null;
}

interface CategoryListItem {
    id: string;
    name: string;
    slug: string;
}

export default function ArticlesListPage() {
    const [articles, setArticles] = useState<ArticleListItem[]>([]);
    const [categories, setCategories] = useState<CategoryListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedLanguage, setSelectedLanguage] = useState('all');

    // AI Generation Modal State
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiTopic, setAiTopic] = useState('');
    const [aiKeywords, setAiKeywords] = useState<string[]>([]);
    const [aiStyle, setAiStyle] = useState('jornalístico e informativo');
    const [aiSize, setAiSize] = useState<'small' | 'medium' | 'large'>('medium');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSuggestingKeywords, setIsSuggestingKeywords] = useState(false);

    const handleSuggestKeywords = async () => {
        if (!aiTopic) return alert('Digite um tema primeiro');
        setIsSuggestingKeywords(true);
        try {
            const res = await generateKeywords(aiTopic);
            if (res.success && res.keywords) setAiKeywords(res.keywords);
        } finally {
            setIsSuggestingKeywords(false);
        }
    };

    const handleGenerateArticle = async () => {
        if (!aiTopic) return alert('Digite um tema');
        setIsGenerating(true);
        try {
            const result = await generateArticle({
                topic: aiTopic,
                keywords: aiKeywords,
                style: aiStyle,
                size: aiSize,
                language: selectedLanguage === 'all' ? 'pt' : selectedLanguage
            });

            if (result.success && result.title && result.content) {
                // Criar Draft e redirecionar
                const slug = result.title.toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '');

                const payload = {
                    title: result.title,
                    slug,
                    content: result.content,
                    status: 'DRAFT',
                    language: selectedLanguage === 'all' ? 'pt' : selectedLanguage,
                    translation_group_id: crypto.randomUUID(),
                    read_time: Math.ceil(result.content.split(' ').length / 200) || 1,
                    updated_at: new Date().toISOString(),
                };

                const response = await upsertArticle(payload as any) as { success: boolean, data?: any, error?: string };

                if (!response.success) {
                    alert('Erro ao criar artigo: ' + response.error);
                } else if (response.data) {
                    window.location.href = `/admin/editor?id=${response.data.id}`;
                }
            } else {
                alert('Erro na geração: ' + result.error);
            }
        } catch (error: any) {
            alert('Erro crítico: ' + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    async function fetchInitialData() {
        setLoading(true);
        const [articlesRes, categoriesRes] = await Promise.all([
            supabase
                .from('articles')
                .select(`
                    id, title, slug, status, published_at, views, created_at, language,
                    author:profiles(name),
                    category:categories(name, color, slug)
                `)
                .order('created_at', { ascending: false }),
            supabase.from('categories').select('id, name, slug')
        ]);

        if (articlesRes.data) {
            // Create a type that matches the raw structure returned by the query
            interface RawArticle {
                id: string;
                title: string;
                slug: string;
                status: string;
                published_at: string;
                views: number;
                created_at: string;
                language: string;
                author: { name: string } | { name: string }[] | null;
                category: { name: string; color: string; slug: string } | { name: string; color: string; slug: string }[] | null;
            }

            const rawArticles = articlesRes.data as unknown as RawArticle[];

            const mappedArticles: ArticleListItem[] = rawArticles.map((item) => ({
                id: item.id,
                title: item.title,
                slug: item.slug,
                status: item.status,
                published_at: item.published_at,
                views: item.views,
                created_at: item.created_at,
                language: item.language,
                author: Array.isArray(item.author) ? item.author[0] : item.author,
                category: Array.isArray(item.category) ? item.category[0] : item.category
            }));

            setArticles(mappedArticles);
        }
        if (categoriesRes.data) setCategories(categoriesRes.data);
        setLoading(false);
    }

    useEffect(() => {
        void fetchInitialData();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this article?')) return;
        const result = await deleteArticle(id);
        if (!result.success) alert(result.error);
        else fetchInitialData();
    };

    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.slug.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || article.category?.slug === selectedCategory;
        const matchesLanguage = selectedLanguage === 'all' || article.language === selectedLanguage;
        return matchesSearch && matchesCategory && matchesLanguage;
    });

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black dark:text-white text-gray-900 mb-1">Articles</h1>
                    <p className="text-slate-400 text-sm">Manage your editorial content across all languages</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setIsAiModalOpen(true)}
                        className="bg-slate-900 border border-purple-500/30 text-purple-400 px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-500/10 transition-all group"
                    >
                        <Sparkles className="w-5 h-5 group-hover:animate-pulse" /> Gerar com IA
                    </button>
                    <Link
                        href="/admin/editor"
                        className="bg-primary text-slate-900 px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
                    >
                        <Plus className="w-5 h-5" /> New Article
                    </Link>
                </div>
            </div>

            {/* AI Generation Modal */}
            {isAiModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden scale-in-center">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <BrainCircuit className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Gerar Artigo com IA</h2>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">GPT-4o Premium Engine</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAiModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                                    <Type className="w-3 h-3" /> Tema ou Título da Matéria
                                </label>
                                <input
                                    type="text"
                                    value={aiTopic}
                                    onChange={(e) => setAiTopic(e.target.value)}
                                    placeholder="Ex: O impacto da inteligência artificial no mercado imobiliário em Orlando"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                                        <FileText className="w-3 h-3" /> Palavras-chave (Opcional)
                                    </label>
                                    <button
                                        onClick={handleSuggestKeywords}
                                        disabled={isSuggestingKeywords}
                                        className="text-[10px] font-black text-purple-400 uppercase tracking-widest hover:text-purple-300 transition-colors disabled:opacity-50"
                                    >
                                        {isSuggestingKeywords ? 'Sugerindo...' : 'Sugerir com IA'}
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={aiKeywords.join(', ')}
                                    onChange={(e) => setAiKeywords(e.target.value.split(',').map(s => s.trim()))}
                                    placeholder="Separe por vírgulas..."
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Estilo de Escrita</label>
                                    <select
                                        value={aiStyle}
                                        onChange={(e) => setAiStyle(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:ring-1 focus:ring-purple-500/50 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="jornalístico e informativo">Jornalístico (Padrão)</option>
                                        <option value="storytelling envolvente">Storytelling</option>
                                        <option value="técnico e detalhado">Técnico</option>
                                        <option value="coloquial e amigável">Amigável</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Tamanho Estimado</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['small', 'medium', 'large'] as const).map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => setAiSize(size)}
                                                className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${aiSize === size
                                                        ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                                                        : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/10'
                                                    }`}
                                            >
                                                {size === 'small' ? 'Curto' : size === 'medium' ? 'Médio' : 'Longo'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-950/50 border-t border-white/5 flex gap-3">
                            <button
                                onClick={() => setIsAiModalOpen(false)}
                                className="flex-1 px-6 py-4 rounded-xl border border-white/10 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleGenerateArticle}
                                disabled={isGenerating || !aiTopic}
                                className="flex-[2] bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:from-purple-500 hover:to-blue-500 shadow-xl shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Gerando Artigo...
                                    </>
                                ) : (
                                    <>
                                        🚀 Começar Geração
                                        <Sparkles className="w-4 h-4 group-hover:animate-bounce" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search articles by title or slug..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="relative min-w-[150px]">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <select
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-8 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                        >
                            <option value="all">All Languages</option>
                            {routing.locales.map(loc => (
                                <option key={loc} value={loc}>{loc.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative min-w-[200px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <select
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-8 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.slug}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                {loading ? <div className="p-12 text-center text-slate-400">Loading articles...</div> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-950/50 border-b border-white/5 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                                <tr>
                                    <th className="p-4 pl-6">Title</th>
                                    <th className="p-4">Language</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Author</th>
                                    <th className="p-4">Status & Date</th>
                                    <th className="p-4 text-center">Views</th>
                                    <th className="p-4 text-right pr-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredArticles.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-500 italic">No articles found matching your criteria.</td>
                                    </tr>
                                ) : filteredArticles.map((post) => (
                                    <tr key={post.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-4 pl-6">
                                            <p className="font-bold text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">{post.title}</p>
                                            <p className="text-[10px] text-slate-500 font-mono tracking-tight">{post.slug}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-black uppercase tracking-wider border border-white/5">
                                                {post.language || 'pt'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {post.category && (
                                                <span
                                                    className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider"
                                                    style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
                                                >
                                                    {post.category.name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 overflow-hidden">
                                                    <User className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-xs text-slate-300 font-medium">{post.author?.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className={`text-[9px] uppercase font-black mb-1 w-fit ${post.status === 'PUBLISHED' ? 'text-green-400' : 'text-amber-400'}`}>
                                                    {post.status}
                                                </span>
                                                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(post.published_at || post.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center font-mono text-xs text-slate-400">
                                            {post.views || 0}
                                        </td>
                                        <td className="p-4 text-right pr-6">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                <Link href={`/article/${post.slug}`} target="_blank" className="p-2 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-blue-400/10 transition-colors" title="View">
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link href={`/admin/editor?id=${post.id}`} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors" title="Edit">
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button onClick={() => handleDelete(post.id)} className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-colors" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
