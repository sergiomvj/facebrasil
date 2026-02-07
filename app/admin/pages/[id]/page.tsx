'use client';

import React, { useEffect, useState } from 'react';
import { fetchStaticPageBySlug, updateStaticPage, StaticPage } from '@/lib/static-pages-service';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2, Globe } from 'lucide-react';
import Link from 'next/link';

export default function AdminPageEditor() {
    const { id: slug } = useParams();
    const router = useRouter();
    const [page, setPage] = useState<StaticPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        is_published: true
    });

    useEffect(() => {
        if (slug) loadPage();
    }, [slug]);

    const loadPage = async () => {
        try {
            setLoading(true);
            const data = await fetchStaticPageBySlug(slug as string);
            if (data) {
                setPage(data);
                setFormData({
                    title: data.title,
                    content: data.content,
                    is_published: data.is_published ?? true
                });
            }
        } catch (error) {
            console.error('Error loading page:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await updateStaticPage(slug as string, formData);
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
                    <Link href="/admin/pages" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black dark:text-white text-gray-900">Editar Página</h1>
                        <p className="text-xs text-slate-500">Editando: <code className="text-primary">/{page.slug}</code></p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={`/${page.slug}`}
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                    >
                        <Globe className="w-4 h-4" /> Ver Online
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-bold shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Salvar Alterações
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Título da Página</label>
                        <input
                            type="text"
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary font-bold "
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Conteúdo (HTML/Texto)</label>
                        <textarea
                            rows={15}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        />
                        <p className="mt-2 text-[10px] text-slate-500">Dica: Você pode usar tags HTML básicas para formatação (h2, p, strong, ul, li).</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-200 dark:border-white/10">
                    <input
                        type="checkbox"
                        id="published"
                        className="size-4 accent-primary"
                        checked={formData.is_published}
                        onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    />
                    <label htmlFor="published" className="text-sm font-bold text-slate-600 dark:text-slate-300">Página Publicada</label>
                </div>
            </div>
        </div>
    );
}
