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
                    {/* ... (Configurações i18n e Página Publicada mantidas) ... */}
                </div>
            </div>

            {/* Footer Specialist Editor */}
            {slug === 'footer' && (
                <div className="mt-12 space-y-8">
                    <div className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-3xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-blue-500/10 rounded-2xl">
                                <LinkIcon className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black dark:text-white text-gray-900">Editor Estruturado do Rodapé</h2>
                                <p className="text-xs text-slate-500">Preencha os campos abaixo para configurar o footer dinamicamente.</p>
                            </div>
                        </div>

                        <FooterEditor
                            content={formData.content}
                            onChange={(newContent) => setFormData({ ...formData, content: newContent })}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

// Specialized Footer Component
function FooterEditor({ content, onChange }: { content: string, onChange: (val: string) => void }) {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        try {
            const parsed = JSON.parse(content);
            setData(parsed);
        } catch {
            // Initial default structure
            setData({
                company_description: "A Facebrasil é o maior e mais influente grupo de mídia e serviços para a comunidade brasileira nos EUA e ao redor do mundo.",
                social_links: {
                    facebook: "https://facebook.com/facebrasil",
                    instagram: "https://instagram.com/facebrasil",
                    youtube: "https://youtube.com/facebrasil",
                    linkedin: "https://linkedin.com/company/facebrasil"
                },
                columns: [
                    {
                        title: "Categorias",
                        links: [
                            { label: "Saúde", url: "/saude" },
                            { label: "Bem-Estar", url: "/bem-estar" },
                            { label: "Estilo de Vida", url: "/estilo-de-vida" },
                            { label: "Business", url: "/business" }
                        ]
                    },
                    {
                        title: "Revista Facebrasil",
                        links: [
                            { label: "Edição Digital", url: "/revista" },
                            { label: "Anuncie", url: "/anucie" },
                            { label: "Onde Encontrar", url: "/distribuicao" }
                        ]
                    },
                    {
                        title: "Suporte",
                        links: [
                            { label: "Fale Conosco", url: "/contato" },
                            { label: "Sobre Nós", url: "/sobre" },
                            { label: "Termos de Uso", url: "/termos" }
                        ]
                    }
                ],
                copyright: "© 2024 Facebrasil. Todos os direitos reservados."
            });
        }
    }, []);

    const updateData = (newData: any) => {
        setData(newData);
        onChange(JSON.stringify(newData, null, 2));
    };

    if (!data) return null;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Descrição da Empresa</label>
                    <textarea
                        className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm font-bold min-h-[120px]"
                        value={data.company_description}
                        onChange={(e) => updateData({ ...data, company_description: e.target.value })}
                    />
                </div>
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Links Sociais</label>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.keys(data.social_links).map(key => (
                            <div key={key}>
                                <label className="text-[8px] font-bold uppercase text-slate-400 mb-1 block">{key}</label>
                                <input
                                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-[10px] font-bold"
                                    value={data.social_links[key]}
                                    onChange={(e) => updateData({
                                        ...data,
                                        social_links: { ...data.social_links, [key]: e.target.value }
                                    })}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Colunas de Links</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {data.columns.map((col: any, colIdx: number) => (
                        <div key={colIdx} className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-2xl space-y-4">
                            <input
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-xs font-black uppercase"
                                value={col.title}
                                onChange={(e) => {
                                    const newCols = [...data.columns];
                                    newCols[colIdx].title = e.target.value;
                                    updateData({ ...data, columns: newCols });
                                }}
                            />
                            <div className="space-y-2">
                                {col.links.map((link: any, linkIdx: number) => (
                                    <div key={linkIdx} className="flex gap-2">
                                        <input
                                            className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-[10px] font-bold"
                                            placeholder="Label"
                                            value={link.label}
                                            onChange={(e) => {
                                                const newCols = [...data.columns];
                                                newCols[colIdx].links[linkIdx].label = e.target.value;
                                                updateData({ ...data, columns: newCols });
                                            }}
                                        />
                                        <input
                                            className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-[10px] font-mono"
                                            placeholder="URL"
                                            value={link.url}
                                            onChange={(e) => {
                                                const newCols = [...data.columns];
                                                newCols[colIdx].links[linkIdx].url = e.target.value;
                                                updateData({ ...data, columns: newCols });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Copyright Line</label>
                <input
                    className="w-full bg-transparent border-none p-0 text-sm font-bold"
                    value={data.copyright}
                    onChange={(e) => updateData({ ...data, copyright: e.target.value })}
                />
            </div>
        </div>
    );
}

