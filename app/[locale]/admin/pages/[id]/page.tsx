'use client';

import React, { useEffect, useState } from 'react';
import { fetchStaticPageBySlug, updateStaticPage, StaticPage } from '@/lib/static-pages-service';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2, Globe, Link as LinkIcon } from 'lucide-react';
import { Link, routing } from '@/i18n/routing';

export default function AdminPageEditor() {
    const { id: slug } = useParams();
    const router = useRouter();
    const [page, setPage] = useState<StaticPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        is_published: true,
        language: 'pt',
        translation_group_id: ''
    });

    async function loadPage() {
        try {
            setLoading(true);
            const data = await fetchStaticPageBySlug(slug as string);
            if (data) {
                setPage(data);
                setFormData({
                    title: data.title,
                    content: data.content,
                    is_published: data.is_published ?? true,
                    language: data.language || 'pt',
                    translation_group_id: data.translation_group_id || ''
                });
            }
        } catch (error) {
            console.error('Error loading page:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (slug) void loadPage();
    }, [slug]);

    const handleSave = async () => {
        try {
            setSaving(true);
            await updateStaticPage(slug as string, {
                ...formData,
                translation_group_id: formData.translation_group_id || null
            });
            router.push('/admin/pages');
        } catch (error) {
            console.error('Error saving page:', error);
            alert('Erro ao salvar página');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!page) return <div className="p-6">Página não encontrada.</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/pages" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black dark:text-white text-gray-900">Editar Página</h1>
                        <p className="text-xs text-slate-500">Editando: <code className="text-primary font-bold">/{page.slug}</code></p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={`/${page.slug}`}
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all font-black uppercase tracking-wider text-[10px]"
                    >
                        <Globe className="w-4 h-4" /> Ver Online
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-slate-900 rounded-xl font-black shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Salvar Alterações
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Título da Página</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-bold dark:text-white"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Conteúdo (HTML/Texto)</label>
                            <textarea
                                rows={18}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm dark:text-slate-300 leading-relaxed"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            />
                            <p className="mt-3 text-[10px] text-slate-500 font-medium">Dica: Você pode usar tags HTML básicas para formatação (h2, p, strong, ul, li).</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Configurações i18n</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <Globe className="w-3 h-3 text-primary" /> Idioma
                                </label>
                                <select
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                                    value={formData.language}
                                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                >
                                    {routing.locales.map(loc => (
                                        <option key={loc} value={loc}>{loc.toUpperCase()} - {loc === 'pt' ? 'Português' : loc === 'en' ? 'English' : 'Español'}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <LinkIcon className="w-3 h-3 text-primary" /> Grupo de Tradução
                                </label>
                                <input
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-[10px] font-mono text-slate-500"
                                    value={formData.translation_group_id}
                                    onChange={(e) => setFormData({ ...formData, translation_group_id: e.target.value })}
                                    placeholder="UUID do grupo"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                        <label className="flex items-center gap-3 cursor-pointer group w-full">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={formData.is_published}
                                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                />
                                <div className={`w-10 h-5 rounded-full transition-colors ${formData.is_published ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                                <div className={`absolute top-1 left-1 bg-white dark:bg-slate-200 w-3 h-3 rounded-full transition-transform ${formData.is_published ? 'translate-x-5' : ''}`}></div>
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Página Publicada</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
