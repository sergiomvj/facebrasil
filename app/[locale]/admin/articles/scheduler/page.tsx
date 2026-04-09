'use client';

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Download, Upload, Play, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { generateArticle } from '@/app/actions/ai-actions';
import { AVAILABLE_MODELS } from '@/lib/ai-models';
import { upsertArticle } from '@/app/actions/article-actions';
import { createClient } from '@/lib/supabase/client';

interface CSVMockup {
    Topic: string;
    Keywords: string;
    Style: string;
    Size: 'small' | 'medium' | 'large';
    Language: string;
    Scope: string;
    Category: string;
    PublishedAt: string;
}

interface ProcessingState extends CSVMockup {
    status: 'pending' | 'processing' | 'success' | 'error';
    error?: string;
}

export default function ArticleScheduler() {
    const [rows, setRows] = useState<ProcessingState[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();
    const [selectedModel, setSelectedModel] = useState('gpt-4o');

    const downloadTemplate = () => {
        const template = 'Topic,Keywords,Style,Size,Language,Scope,Category,PublishedAt\n' +
            '"O Futuro da IA","tecnologia, openai, futuro","Informativo","medium","pt","Foco em impactos sociais","tecnologia","2026-03-25T10:00"\n' +
            '"Receita de Bolo de Cenoura","bolo, receita, fácil","Descontraído","small","pt","Foco em versão fitness","culinária","2026-04-01T15:30"';
        const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'template_agendador_ia.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsedRows = results.data as any[];

                const formattedRows: ProcessingState[] = parsedRows.map((row) => ({
                    Topic: row.Topic || '',
                    Keywords: row.Keywords || '',
                    Style: row.Style || 'Jornalístico',
                    Size: (row.Size === 'small' || row.Size === 'large') ? row.Size : 'medium',
                    Language: row.Language?.toLowerCase() || 'pt',
                    Scope: row.Scope || '',
                    Category: row.Category || '',
                    PublishedAt: row.PublishedAt || new Date().toISOString(),
                    status: 'pending'
                }));

                setRows(formattedRows);
            },
            error: (err) => {
                alert('Erro ao processar CSV: ' + err.message);
            }
        });
    };

    const processBatch = async () => {
        if (rows.length === 0) return alert('Nenhum dado importado.');

        setIsProcessing(true);

        // Map categories from text to UUID
        const { data: categoriesData } = await supabase.from('categories').select('id, name, slug');
        let catsMap = new Map();
        if (categoriesData) {
            categoriesData.forEach((c: any) => {
                if (c.name) catsMap.set(c.name.toLowerCase().trim(), c.id);
                if (c.slug) catsMap.set(c.slug.toLowerCase().trim(), c.id);
            });
        }

        let updatedRows = [...rows];

        for (let i = 0; i < updatedRows.length; i++) {
            if (updatedRows[i].status === 'success') continue; // Skip already completed

            updatedRows[i].status = 'processing';
            setRows([...updatedRows]);

            try {
                // 1. Generate Article Context via AI
                const aiResult = await generateArticle({
                    topic: updatedRows[i].Topic,
                    keywords: updatedRows[i].Keywords.split(',').map((k: string) => k.trim()),
                    style: updatedRows[i].Style,
                    size: updatedRows[i].Size,
                    language: updatedRows[i].Language,
                    scope: updatedRows[i].Scope,
                    model: selectedModel
                });

                if (!aiResult.success || !aiResult.title || !aiResult.content) {
                    throw new Error(aiResult.error || 'Erro desconhecido na geração de IA.');
                }

                const slug = aiResult.title.toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '');

                const publishedDate = updatedRows[i].PublishedAt
                    ? new Date(updatedRows[i].PublishedAt).toISOString()
                    : new Date().toISOString();

                // 2. Save as DRAFT-IA with accurate PublishedAt
                const payload = {
                    title: aiResult.title,
                    slug,
                    content: aiResult.content,
                    status: 'DRAFT-IA' as any,
                    language: updatedRows[i].Language,
                    translation_group_id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2),
                    read_time: Math.ceil(aiResult.content.split(' ').length / 200) || 1,
                    category_id: updatedRows[i].Category ? (catsMap.get(updatedRows[i].Category.toLowerCase().trim()) || null) : null,
                    published_at: publishedDate,
                    updated_at: new Date().toISOString(),
                };

                const saveResult = await upsertArticle(payload as any) as any;

                if (!saveResult.success) {
                    throw new Error(saveResult.error || 'Erro ao persistir banco de dados.');
                }

                updatedRows[i].status = 'success';
            } catch (err: any) {
                updatedRows[i].status = 'error';
                updatedRows[i].error = err.message;
            }

            setRows([...updatedRows]);
        }

        setIsProcessing(false);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
                        Agendador IA (Bulk CSV)
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Automatize a criação e agendamento de dezenas de artigos simultaneamente usando um arquivo CSV paramétrico.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={downloadTemplate}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        Baixar Template CSV
                    </button>

                    <label className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-sm">
                        <Upload className="w-4 h-4" />
                        Importar CSV
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={isProcessing}
                        />
                    </label>
                </div>
            </header>

            {/* Renderization Table */}
            {rows.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-6">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {rows.length} Artigo(s) Carregado(s)
                            </span>

                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Modelo IA:</span>
                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    disabled={isProcessing}
                                    className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-accent-yellow outline-none transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {AVAILABLE_MODELS.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={processBatch}
                            disabled={isProcessing}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${isProcessing
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800'
                                    : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-accent-yellow dark:text-slate-900 dark:hover:bg-yellow-400'
                                }`}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processando Lote...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4" />
                                    Iniciar Geração IA
                                </>
                            )}
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Tópico</th>
                                    <th className="px-6 py-4 font-semibold">Palavras-Chave</th>
                                    <th className="px-6 py-4 font-semibold">Estilo</th>
                                    <th className="px-6 py-4 font-semibold">Idioma</th>
                                    <th className="px-6 py-4 font-semibold">Tamanho</th>
                                    <th className="px-6 py-4 font-semibold">Agendamento</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {rows.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4">
                                            {row.status === 'pending' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"><Clock className="w-3.5 h-3.5" /> Aguardando</span>}
                                            {row.status === 'processing' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"><Loader2 className="w-3.5 h-3.5 animate-spin" /> IA Gerando</span>}
                                            {row.status === 'success' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Sucesso (DRAFT-IA)</span>}
                                            {row.status === 'error' && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                                        <AlertCircle className="w-3.5 h-3.5" /> Falha
                                                    </span>
                                                    <span className="text-[10px] text-red-500 truncate max-w-[120px]" title={row.error}>{row.error}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white truncate max-w-[200px]" title={row.Topic}>
                                            {row.Topic || '-'}
                                        </td>
                                        <td className="px-6 py-4 truncate max-w-[150px]" title={row.Keywords}>
                                            {row.Keywords || '-'}
                                        </td>
                                        <td className="px-6 py-4">{row.Style}</td>
                                        <td className="px-6 py-4 uppercase">{row.Language}</td>
                                        <td className="px-6 py-4">{row.Size}</td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {row.PublishedAt ? new Date(row.PublishedAt).toLocaleString() : 'Imediato'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {rows.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                        <Upload className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Nenhum CSV importado ainda</h3>
                    <p className="text-slate-500 mt-2 mb-6 max-w-sm text-center">
                        Faça o download do template acima, preencha suas pautas no Excel ou Google Sheets e importe para gerar o conteúdo usando Inteligência Artificial.
                    </p>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-sm"
                    >
                        Procurar Arquivo CSV
                    </button>
                </div>
            )}
        </div>
    );
}

// Helper icon component for status
function Clock(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}
