'use client';

import React, { useEffect, useState } from 'react';
import { fetchStaticPages, StaticPage } from '@/lib/static-pages-service';
import { Link, routing } from '@/i18n/routing';
import { Edit2, Eye, Plus, Search, Globe } from 'lucide-react';

export default function AdminPagesPage() {
    const [pages, setPages] = useState<StaticPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('all');

    async function loadPages() {
        try {
            setLoading(true);
            const data = await fetchStaticPages();
            setPages(data);
        } catch (error) {
            console.error('Error loading pages:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadPages();
    }, []);

    const filteredPages = pages.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.slug.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLanguage = selectedLanguage === 'all' || p.language === selectedLanguage;
        return matchesSearch && matchesLanguage;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black dark:text-white text-gray-900 mb-1">Gerenciamento de Páginas</h1>
                    <p className="text-slate-500 text-sm">Edite o conteúdo das páginas institucionais em todos os idiomas.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-primary text-slate-900 rounded-xl font-bold font-black shadow-lg hover:shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <Plus className="w-5 h-5" /> Nova Página
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por título ou slug..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative min-w-[200px] w-full md:w-auto">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            className="w-full pl-10 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm appearance-none cursor-pointer font-bold"
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                        >
                            <option value="all">Todos os Idiomas</option>
                            {routing.locales.map(loc => (
                                <option key={loc} value={loc}>{loc.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-white/5">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Título</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Idioma</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Slug</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium italic">Carregando páginas...</td>
                                </tr>
                            ) : filteredPages.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium italic italic">Nenhuma página encontrada para os critérios selecionados.</td>
                                </tr>
                            ) : (
                                filteredPages.map((page) => (
                                    <tr key={page.id || page.slug} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-black dark:text-white text-gray-900 group-hover:text-primary transition-colors">{page.title}</div>
                                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Institucional</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider border border-gray-200 dark:border-white/5">
                                                {page.language || 'pt'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-[10px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono tracking-tight group-hover:bg-primary/10 transition-colors">/{page.slug}</code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/${page.slug}`}
                                                    target="_blank"
                                                    className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-primary transition-all"
                                                    title="Visualizar"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/admin/pages/${page.slug}`}
                                                    className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-primary transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
