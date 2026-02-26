'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, MonitorPlay, Send, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { sendArticlesToTV } from '@/app/actions/tv-facebrasil-actions';

interface ArticleItem {
    id: string;
    title: string;
    slug: string;
    content: string;
    created_at: string;
    sent_to_tv: boolean;
    categories?: {
        name: string;
    };
}

export default function TVFacebrasilPage() {
    const [articles, setArticles] = useState<ArticleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [sending, setSending] = useState(false);
    const [debugMode, setDebugMode] = useState(false);
    const [showOnlyNotSent, setShowOnlyNotSent] = useState(true);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

    async function fetchArticles() {
        setLoading(true);
        console.log('[TV-Facebrasil] Buscando artigos...');
        const { data, error } = await supabase
            .from('articles')
            .select('id, title, slug, content, created_at, sent_to_tv, categories(name)')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Error fetching articles:', error);
        } else if (data) {
            setArticles(data as any);
        }
        setLoading(false);
    }

    useEffect(() => {
        void fetchArticles();
    }, []);

    const toggleSelection = (id: string, alreadySent: boolean) => {
        if (alreadySent && !confirm('Este artigo já foi enviado para a TV anteriormente. Deseja enviar novamente?')) {
            return;
        }

        setSelectedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(i => i !== id);
            }
            if (prev.length >= 50) {
                alert('Você só pode selecionar até 50 artigos por vez.');
                return prev;
            }
            return [...prev, id];
        });
    };

    const handleSend = async () => {
        if (selectedIds.length === 0 || selectedIds.length > 50) {
            alert('Por favor, selecione entre 1 e 50 artigos.');
            return;
        }

        setSending(true);
        setStatus({ type: null, message: '' });

        const selectedArticles = articles
            .filter(a => selectedIds.includes(a.id))
            .map(a => {
                // Limpeza básica de HTML
                let cleanContent = a.content ? a.content.replace(/<[^>]*>?/gm, '') : '';

                // Modo de depuração: envia apenas uma prévia para testar se o problema é o tamanho/buffer
                if (debugMode && cleanContent.length > 200) {
                    cleanContent = cleanContent.substring(0, 200) + '... (DEBUG MODE ACTIVE)';
                }

                // Trata o nome da categoria com segurança
                let catName = 'Geral';
                if (a.categories) {
                    if (Array.isArray(a.categories)) {
                        catName = a.categories[0]?.name || 'Geral';
                    } else {
                        catName = (a.categories as any).name || 'Geral';
                    }
                }

                return {
                    id: a.id,
                    titulo: a.title,
                    corpo: cleanContent,
                    conteudo: cleanContent,
                    link: `https://facebrasil.com/article/${a.slug}`,
                    categoria: catName
                };
            });

        const result = await sendArticlesToTV(selectedArticles);

        if (result.success) {
            setStatus({ type: 'success', message: `Pacote de ${selectedArticles.length} artigos enviado com sucesso para a TV Facebrasil!` });
            setSelectedIds([]);
            // Atualiza a lista para refletir os novos status sent_to_tv
            await fetchArticles();
        } else {
            console.error('[TV-Facebrasil] Erro reportado no envio:', result.error);
            setStatus({ type: 'error', message: `Erro ao enviar: ${result.error}` });
        }
        setSending(false);
    };

    const filteredArticles = articles.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSentFilter = showOnlyNotSent ? !a.sent_to_tv : true;
        return matchesSearch && matchesSentFilter;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black dark:text-white text-gray-900 mb-1 flex items-center gap-2">
                        <MonitorPlay className="w-8 h-8 text-primary" />
                        TV Facebrasil
                    </h1>
                    <p className="text-slate-400 text-sm">Selecione até 50 artigos para transformar em vídeos na TV Facebrasil</p>
                </div>

                <button
                    onClick={handleSend}
                    disabled={selectedIds.length === 0 || selectedIds.length > 50 || sending}
                    className={`
                        flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg
                        ${selectedIds.length > 0 && selectedIds.length <= 50 && !sending
                            ? 'bg-primary text-slate-900 hover:scale-105 shadow-primary/20'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                    `}
                >
                    {sending ? (
                        <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                    {sending ? 'Enviando...' : `Enviar Lote (${selectedIds.length}/50)`}
                </button>
            </div>

            {status.type && (
                <div className={`p-4 rounded-xl flex items-start gap-3 border ${status.type === 'success'
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                    {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
                    <p className="font-medium">{status.message}</p>
                </div>
            )}

            <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900/30 p-4 rounded-xl border border-white/5">
                <div className="flex flex-wrap items-center gap-6 pr-4 border-r border-white/10">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="showOnlyNotSent"
                            checked={showOnlyNotSent}
                            onChange={(e) => setShowOnlyNotSent(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="showOnlyNotSent" className="text-sm font-medium text-slate-300 cursor-pointer">
                            Ocultar já enviados
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="debugMode"
                            checked={debugMode}
                            onChange={(e) => setDebugMode(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="debugMode" className="text-sm font-medium text-slate-300 cursor-pointer">
                            Modo de Depuração
                        </label>
                    </div>
                </div>
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar artigos por título..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-32 bg-slate-900/50 rounded-2xl animate-pulse border border-white/5" />
                    ))
                ) : filteredArticles.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-500 bg-slate-900/30 rounded-3xl border border-dashed border-white/10 italic">
                        Nenhum artigo encontrado.
                    </div>
                ) : filteredArticles.map((article) => (
                    <div
                        key={article.id}
                        onClick={() => toggleSelection(article.id, !!article.sent_to_tv)}
                        className={`
                            relative p-5 rounded-2xl border transition-all cursor-pointer group select-none
                            ${selectedIds.includes(article.id)
                                ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5'
                                : article.sent_to_tv
                                    ? 'bg-slate-900/20 border-white/5 opacity-70 hover:opacity-100'
                                    : 'bg-slate-900/50 border-white/5 hover:border-white/20 hover:bg-slate-900'}
                        `}
                    >
                        <div className="flex justify-between items-start gap-3 mb-3">
                            <h3 className={`font-bold transition-colors line-clamp-2 ${selectedIds.includes(article.id)
                                ? 'text-primary'
                                : article.sent_to_tv ? 'text-slate-400' : 'text-white'
                                }`}>
                                {article.title}
                            </h3>
                            <div className={`
                                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
                                ${selectedIds.includes(article.id)
                                    ? 'bg-primary border-primary text-slate-900'
                                    : 'border-white/10 group-hover:border-white/30'}
                            `}>
                                {selectedIds.includes(article.id) && <CheckCircle2 className="w-4 h-4" />}
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center gap-2">
                                <Info className="w-3.5 h-3.5" />
                                <span>{new Date(article.created_at).toLocaleDateString('pt-BR')}</span>
                            </div>
                            {article.sent_to_tv && (
                                <span className="flex items-center gap-1 text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full font-bold">
                                    <CheckCircle2 className="w-3 h-3" />
                                    ENVIADO
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Info className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                    <h4 className="text-white font-bold">Instruções de envio</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Selecione até <strong>50 artigos</strong> para formar um "Pacote de TV".
                        Cada artigo será analisado pelo Editor Chefe AI para decidir se vira um Short ou Vídeo Doc.
                        O limite de 50 artigos é para otimizar o processamento e garantir a qualidade da automação.
                    </p>
                </div>
            </div>
        </div>
    );
}
