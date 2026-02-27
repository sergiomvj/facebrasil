'use client';

import React, { useState } from 'react';
import { Upload, FileType, CheckCircle2, AlertCircle, Copy, Download, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { standaloneConvertImage } from '@/app/actions/ad-image-actions';
import { toast } from 'sonner';

export default function ImageConverterPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [result, setResult] = useState<{ url: string; info: string } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleConvert = async () => {
        if (!file) {
            toast.error('Selecione um arquivo primeiro.');
            return;
        }

        setIsConverting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await standaloneConvertImage(formData);
            if (res.success && res.url && res.info) {
                setResult({ url: res.url, info: res.info });
                toast.success('Conversão concluída!');
            } else {
                toast.error(res.error || 'Erro na conversão');
            }
        } catch (error) {
            toast.error('Erro ao processar imagem.');
        } finally {
            setIsConverting(false);
        }
    };

    const copyToClipboard = () => {
        if (result) {
            navigator.clipboard.writeText(window.location.origin + result.url);
            toast.success('URL copiada!');
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter dark:text-white text-gray-900 mb-2">Conversor de Imagens SVG</h1>
                <p className="text-slate-500 font-bold">Transforme PNG, JPG e WebP em assets SVG otimizados para anúncios.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="bg-slate-900 border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-accent-yellow" />

                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 border-dashed transition-all ${file ? 'bg-accent-yellow/10 border-accent-yellow' : 'bg-slate-950 border-white/10'}`}>
                        {file ? <FileType className="w-10 h-10 text-accent-yellow" /> : <Upload className="w-10 h-10 text-slate-700" />}
                    </div>

                    <div>
                        <h2 className="font-black text-white uppercase italic tracking-wider mb-2">Upload de Origem</h2>
                        <p className="text-xs text-slate-500 max-w-[200px] mx-auto">Selecione uma imagem PNG ou JPG para converter em SVG.</p>
                    </div>

                    <label className="w-full">
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        <div className="bg-slate-950 hover:bg-slate-800 border border-white/10 p-4 rounded-2xl cursor-pointer transition-all font-black text-[10px] uppercase tracking-[0.2em] text-white italic">
                            {file ? file.name : 'Selecionar Arquivo'}
                        </div>
                    </label>

                    <button
                        onClick={handleConvert}
                        disabled={!file || isConverting}
                        className={`w-full p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${!file || isConverting
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            : 'bg-accent-yellow text-slate-950 hover:scale-[1.02] active:scale-95 shadow-lg shadow-accent-yellow/20'
                            }`}
                    >
                        {isConverting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                        {isConverting ? 'Convertendo...' : 'Converter para SVG'}
                    </button>
                </div>

                {/* Result Section */}
                <div className="bg-slate-900 border border-white/5 rounded-3xl p-8 flex flex-col space-y-6 shadow-2xl relative overflow-hidden min-h-[400px]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />

                    <h2 className="font-black text-white uppercase italic tracking-wider text-center">Resultado</h2>

                    <div className="flex-1 bg-slate-950 border border-white/10 rounded-2xl overflow-hidden relative flex items-center justify-center group">
                        {result ? (
                            <>
                                <img src={result.url} alt="Converted" className="max-w-full max-h-full object-contain" />
                                <div className="absolute inset-x-0 bottom-0 p-3 bg-black/80 backdrop-blur-sm transform translate-y-full group-hover:translate-y-0 transition-transform flex items-center justify-between">
                                    <span className="text-[9px] font-mono text-white/50 truncate pr-4">{result.url}</span>
                                    <button onClick={copyToClipboard} className="p-1.5 hover:bg-white/10 rounded-lg text-white">
                                        <Copy className="w-3 h-3" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center opacity-20">
                                <AlertCircle className="w-12 h-12 mx-auto mb-2 text-slate-500" />
                                <span className="text-[10px] font-black uppercase italic text-slate-500">Aguardando Conversão</span>
                            </div>
                        )}
                    </div>

                    {result && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4">
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                <p className="text-xs text-green-400 font-bold leading-tight">{result.info}</p>
                            </div>
                            <a
                                href={result.url}
                                download
                                className="w-full flex items-center justify-center gap-2 p-4 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                            >
                                <Download className="w-4 h-4" /> Download SVG
                            </a>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12 p-8 bg-slate-950/50 rounded-3xl border border-white/5">
                <h3 className="text-sm font-black text-white uppercase italic mb-4 tracking-widest">Por que SVG com WebP?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <div className="text-accent-yellow font-black text-xs uppercase">Performance</div>
                        <p className="text-[11px] text-slate-500 font-medium">Arquivos menores significam carregamento instantâneo, essencial para vitrines de anúncios dinâmicos.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="text-accent-yellow font-black text-xs uppercase">Compatibilidade</div>
                        <p className="text-[11px] text-slate-500 font-medium">O formato SVG é tratado nativamente pelo navegador como vetor, permitindo manipulação via CSS e animações.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="text-accent-yellow font-black text-xs uppercase">Fidelidade</div>
                        <p className="text-[11px] text-slate-500 font-medium">O wrapper WebP mantém 100% da fidelidade das cores originais enquanto reduz drasticamente o peso do arquivo.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
