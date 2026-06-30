'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { RefreshCcw, Cpu, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
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
        setCapturing(true);
        try {
            const res = await fetch('/api/virtual-journalist/capture', { method: 'POST' });
            if (res.ok) await fetchNews();
            else alert('Erro ao capturar notícias.');
        } catch (e) {
            console.error(e);
        }
        setCapturing(false);
    };

    const handleProcess = async () => {
        setProcessing(true);
        try {
            const res = await fetch('/api/virtual-journalist/process', { method: 'POST' });
            if (res.ok) await fetchNews();
            else alert('Erro ao processar lote.');
        } catch (e) {
            console.error(e);
        }
        setProcessing(false);
    };

    const handleRewrite = async (newsId: string) => {
        if (!selectedAgent) {
            alert('Selecione um agente virtual primeiro.');
            return;
        }

        setRewritingId(newsId);
        try {
            const res = await fetch('/api/virtual-journalist/rewrite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newsId, agentId: selectedAgent })
            });

            if (res.ok) {
                const data = await res.json();
                
                // Save to local storage for the new article page to pick up
                localStorage.setItem('virtual_journalist_draft', JSON.stringify({
                    title: data.title,
                    content: data.content,
                    original_url: data.original_url
                }));

                router.push('/pt/admin/articles'); // Ou a URL real de criação dependendo de como é o router do projeto
            } else {
                alert('Erro ao reescrever notícia.');
            }
        } catch (e) {
            console.error(e);
            alert('Erro de conexão ao tentar reescrever.');
        }
        setRewritingId(null);
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
                        onClick={handleCapture} disabled={capturing}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition"
                    >
                        {capturing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                        Buscar Novas
                    </button>
                    <button 
                        onClick={handleProcess} disabled={processing}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-lg transition"
                    >
                        {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                        Processar Pendentes
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-white/10 mb-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Agente Virtual Ativo</label>
                <select 
                    value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}
                    className="w-full md:w-1/3 px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                >
                    <option value="" disabled>Selecione um jornalista virtual...</option>
                    {agents.map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.location})</option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">O agente selecionado vai definir o estilo de escrita e o foco da notícia gerada.</p>
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
                                            onClick={() => handleRewrite(news.id)}
                                            disabled={!isProcessed || rewritingId === news.id}
                                            className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {rewritingId === news.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                            Reescrever
                                        </button>
                                    )}
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
        </div>
    );
}
