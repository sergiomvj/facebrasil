'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, Eye, Calendar, User, Search, Filter, Globe } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { deleteArticle } from '@/app/actions/article-actions';
import { routing } from '@/i18n/routing';

export default function ArticlesListPage() {
    const [articles, setArticles] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedLanguage, setSelectedLanguage] = useState('all');

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

        if (articlesRes.data) setArticles(articlesRes.data);
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

                <Link
                    href="/admin/editor"
                    className="bg-primary text-slate-900 px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all w-full md:w-auto"
                >
                    <Plus className="w-5 h-5" /> New Article
                </Link>
            </div>

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
