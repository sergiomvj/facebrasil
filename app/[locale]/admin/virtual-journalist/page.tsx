'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { RefreshCcw, Cpu, Loader2, ArrowRight, CheckCircle2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VirtualJournalistDashboard() {
    const router = useRouter();
    const [agents, setAgents] = useState<any[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<string>('');
    const [newsList, setNewsList] = useState<any[]>([]);
    const [loadingNews, setLoadingNews] = useState(true);
    const [capturing, setCapturing] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [rewritingId, setRewritingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [sourceQuery, setSourceQuery] = useState<string>('');

    // Rewrite Modal States
    const [rewriteModalOpen, setRewriteModalOpen] = useState(false);
    const [rewriteSize, setRewriteSize] = useState('medium');
    const [rewriteDraftTitle, setRewriteDraftTitle] = useState('');
    const [rewriteDraftContent, setRewriteDraftContent] = useState('');
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [activeNews, setActiveNews] = useState<any>(null);

    const fetchAgents = async () => {
        const { data } = await supabase.from('virtual_agents').select('*');
        if (data) {
            setAgents(data);
            if (data.length > 0) setSelectedAgent(data[0].id);
        }
    };

    const fetchNews = async () => {
        setLoadingNews(true);
        const { data } = await supabase
            .from('captured_news')
            .select(`
                *,
                news_usage(agent_id)
            `)
            .order('created_at', { ascending: false });
        
        if (data) setNewsList(data);
        setLoadingNews(false);
    };

    useEffect(() => {
        fetchAgents();
        fetchNews();
    }, []);

    const handleCapture = async () => {
        if (!selectedAgent || selectedAgent === 'all') {
            alert('Selecione um Agente Virtual ou a Busca Genérica Aberta para direcionar a captura.');
            return;
        }
        
        setCapturing(true);
        try {
            const res = await fetch('/api/virtual-journalist/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId: selectedAgent, sourceQuery })
            });
            const data = await res.json();
            
            if (res.ok) {
                if (data.capturedCount === 0) {
                    alert('Nenhuma notícia nova encontrada para esse assunto ou perfil no momento. Tente outro assunto!');
                } else {
                    await fetchNews();
                }
            } else {
                alert(`Erro ao capturar notícias: ${data.error || 'Erro desconhecido'}`);
            }
        } catch (e) {
            console.error(e);
            alert('Falha na comunicação com a API de captura.');
        }
        setCapturing(false);
    };

    const handleProcess = async () => {
        if (!selectedAgent || selectedAgent === 'generic' || selectedAgent === 'all') {
            alert('Selecione um jornalista virtual específico para direcionar o processamento.');
            return;
        }

        setProcessing(true);
        try {
            const res = await fetch('/api/virtual-journalist/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId: selectedAgent })
            });
            const data = await res.json();
            if (res.ok) {
                await fetchNews();
            } else {
                alert(`Erro ao processar lote: ${data.error || 'Erro desconhecido'}`);
            }
        } catch (e) {
            console.error(e);
            alert('Falha na comunicação com a API de processamento.');
        }
        setProcessing(false);
    };

    const handleDiscard = async (newsId: string) => {
        if (!confirm('Tem certeza que deseja descartar esta fonte? Ela será excluída.')) return;
        
        setDeletingId(newsId);
        try {
            const res = await fetch(`/api/virtual-journalist/source?id=${newsId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                await fetchNews();
            } else {
                const data = await res.json();
                alert(`Erro ao descartar: ${data.error || 'Erro desconhecido'}`);
            }
        } catch (e) {
            console.error(e);
            alert('Falha ao comunicar com a API.');
        }
        setDeletingId(null);
    };

    const openRewriteModal = (news: any) => {
        if (!selectedAgent || selectedAgent === 'generic' || selectedAgent === 'all') {
            alert('Selecione um jornalista virtual específico para reescrever a notícia.');
            return;
        }

        setActiveNews(news);
        setRewriteDraftTitle('');
        setRewriteDraftContent('');
        setRewriteSize('medium');
        setRewriteModalOpen(true);
    };

    const generateRewrite = async () => {
        if (!activeNews) return;
        setRewritingId(activeNews.id);
        try {
            const res = await fetch('/api/virtual-journalist/rewrite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newsId: activeNews.id, agentId: selectedAgent, size: rewriteSize })
            });

            if (res.ok) {
                const data = await res.json();
                setRewriteDraftTitle(data.title);
                setRewriteDraftContent(data.content);
            } else {
                alert('Erro ao reescrever notícia.');
            }
        } catch (e) {
            console.error(e);
            alert('Erro de conexão ao tentar reescrever.');
        }
        setRewritingId(null);
    };

    const saveDraft = async () => {
        if (!rewriteDraftTitle || !rewriteDraftContent) {
            alert('O título e o conteúdo não podem estar vazios.');
            return;
        }

        setIsSavingDraft(true);
        try {
            const res = await fetch('/api/virtual-journalist/save-draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    newsId: activeNews.id, 
                    agentId: selectedAgent, 
                    title: rewriteDraftTitle, 
                    content: rewriteDraftContent 
                })
            });

            if (res.ok) {
                alert('Draft salvo com sucesso na lista de artigos!');
                setRewriteModalOpen(false);
                await fetchNews(); // Atualiza a lista
            } else {
                const err = await res.json();
                alert(`Erro ao salvar draft: ${err.error || 'Desconhecido'}`);
            }
        } catch (e) {
            console.error(e);
            alert('Erro de conexão ao tentar salvar draft.');
        }
        setIsSavingDraft(false);
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Virtual Journalist</h1>
                    <p className="text-gray-600 dark:text-gray-400">Hub de captação de notícias e geração de artigos.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleProcess} disabled={processing}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-lg transition"
                    >
                        {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                        Processar Pendentes
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-white/10 mb-8 flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-4 items-end w-full">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Agente Virtual Ativo</label>
                        <div className="flex gap-2">
                            <select 
                                value={selectedAgent}
                                onChange={(e) => setSelectedAgent(e.target.value)}
                                className="p-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg outline-none focus:border-blue-500 w-full"
                            >
                                <option value="">Selecione o Agente Virtual...</option>
                                <option value="generic">🌍 Busca Genérica Aberta (Captura sem Filtro)</option>
                                <option value="all">👁️ Visualizar Todas as Fontes (Apenas Leitura)</option>
                                {agents.map((a: any) => (
                                    <option key={a.id} value={a.id}>{a.name} ({a.location})</option>
                                ))}
                            </select>
                            <button 
                                onClick={() => router.push('/pt/admin/virtual-journalist/agents')}
                                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition text-sm font-medium whitespace-nowrap"
                            >
                                Criar / Gerenciar Agentes
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">O agente selecionado vai definir o estilo de escrita e o foco da notícia gerada.</p>
                    </div>
                </div>

                <div className="flex-1 w-full border-t border-gray-200 dark:border-white/10 pt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fonte / Assunto para Captura</label>
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            placeholder="Ex: 'Imigração Flórida', 'Brazilians in USA' ou cole uma URL..."
                            value={sourceQuery}
                            onChange={(e) => setSourceQuery(e.target.value)}
                            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                        />
                        <button 
                            onClick={handleCapture} disabled={capturing}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium flex items-center gap-2"
                        >
                            {capturing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                            Capturar Notícias
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Digite um assunto ou site específico. Deixe em branco para usar a busca padrão cruzada com o perfil do Agente.</p>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4 dark:text-white text-gray-900">Notícias Capturadas</h2>
            
            {loadingNews ? (
                <div className="text-center py-12 text-gray-500 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>
            ) : (
                <div className="space-y-4">
                    {newsList.map(news => {
                        const isProcessed = !!news.translated_title;
                        const hasBeenUsedByCurrentAgent = news.news_usage?.some((u: any) => u.agent_id === selectedAgent);

                        return (
                            <div key={news.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row items-center gap-4">
                                <div className="flex-1 w-full">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                            isProcessed ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'
                                        }`}>
                                            {isProcessed ? 'Processado' : 'Bruto'}
                                        </span>
                                        {news.sentiment && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 font-medium">
                                                {news.sentiment}
                                            </span>
                                        )}
                                        {news.category && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 font-medium">
                                                {news.category}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {isProcessed ? news.translated_title : news.original_title}
                                    </h3>
                                    {isProcessed && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-through">{news.original_title}</p>}
                                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                                        <a href={news.url} target="_blank" rel="noreferrer" className="hover:underline text-blue-500">{news.source_vehicle}</a>
                                        <span>•</span>
                                        <span>{new Date(news.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="w-full md:w-auto flex flex-col gap-2">
                                    {hasBeenUsedByCurrentAgent ? (
                                        <div className="flex items-center gap-2 px-4 py-2 text-green-600 bg-green-50 dark:bg-green-900/10 rounded-lg justify-center">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span className="font-medium text-sm">Utilizado</span>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => openRewriteModal(news)}
                                            disabled={!isProcessed || rewritingId === news.id || deletingId === news.id}
                                            className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {rewritingId === news.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                            Reescrever
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleDiscard(news.id)}
                                        disabled={deletingId === news.id || rewritingId === news.id}
                                        className="flex items-center justify-center gap-2 px-6 py-2 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                                    >
                                        {deletingId === news.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        Descartar
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {newsList.length === 0 && (
                        <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-300 dark:border-white/10">
                            Nenhuma notícia capturada ainda. Clique em "Buscar Novas".
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Reescrita */}
            {rewriteModalOpen && activeNews && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center shrink-0">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gerar Artigo com IA</h2>
                            <button onClick={() => setRewriteModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                                <Trash2 className="w-5 h-5 hidden" /> {/* spacer */}
                                ✕
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                                <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Opções do Autor</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Jornalista</label>
                                        <div className="font-medium text-gray-900 dark:text-white">{agents.find(a => a.id === selectedAgent)?.name}</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Tamanho do Artigo</label>
                                        <select 
                                            value={rewriteSize} 
                                            onChange={e => setRewriteSize(e.target.value)}
                                            className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg text-sm"
                                        >
                                            <option value="small">Curto (2 a 3 parágrafos)</option>
                                            <option value="medium">Médio (4 a 6 parágrafos)</option>
                                            <option value="large">Longo (8 a 10 parágrafos)</option>
                                        </select>
                                    </div>
                                </div>
                                <button 
                                    onClick={generateRewrite}
                                    disabled={rewritingId === activeNews.id}
                                    className="mt-4 w-full py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {rewritingId === activeNews.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Cpu className="w-5 h-5" />}
                                    Gerar / Refazer Artigo
                                </button>
                            </div>

                            {rewriteDraftTitle || rewritingId === activeNews.id ? (
                                <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título Gerado</label>
                                        <input 
                                            type="text" 
                                            value={rewriteDraftTitle}
                                            onChange={e => setRewriteDraftTitle(e.target.value)}
                                            placeholder="Aguardando geração..."
                                            disabled={rewritingId === activeNews.id}
                                            className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg font-bold text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conteúdo (HTML)</label>
                                        <textarea 
                                            value={rewriteDraftContent}
                                            onChange={e => setRewriteDraftContent(e.target.value)}
                                            placeholder="O conteúdo gerado aparecerá aqui..."
                                            disabled={rewritingId === activeNews.id}
                                            rows={12}
                                            className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg font-mono text-sm text-gray-900 dark:text-gray-300"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-400 py-12">
                                    Clique em "Gerar Artigo" para visualizar o resultado aqui.
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-white/10 flex justify-end gap-3 shrink-0 bg-gray-50 dark:bg-slate-800/50 rounded-b-2xl">
                            <button 
                                onClick={() => setRewriteModalOpen(false)}
                                className="px-6 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={saveDraft}
                                disabled={!rewriteDraftTitle || isSavingDraft || rewritingId === activeNews.id}
                                className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSavingDraft ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                Enviar para Draft de Produção
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
