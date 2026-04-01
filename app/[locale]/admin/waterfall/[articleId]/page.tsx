'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
    Waves, Sparkles, Copy, Check, ChevronDown, ArrowLeft,
    Instagram, Twitter, Facebook, RefreshCw, Loader2,
    MessageSquare, List, Type, Users, Zap, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Article {
    id: string;
    title: string;
    excerpt?: string;
    content?: string;
    category?: { name: string };
}

interface Slide { number: number; text: string; }
interface Tweet { number: number; text: string; }

interface WaterfallData {
    instagram: {
        carousel: { slides: Slide[] };
        caption: string;
    };
    twitter: {
        thread: Tweet[];
        single_tweet: string;
    };
    facebook: {
        story_post: string;
        engagement_post: string;
    };
}

type ToneOption = 'impactante' | 'acolhedor' | 'informativo' | 'urgente' | 'inspiracional';
type AngleOption = 'emocional' | 'investigativo' | 'pratico' | 'cultural' | 'provocador';
type AudienceOption = 'diaspora' | 'imigrantes' | 'profissionais' | 'familias';

// ─── Small helpers ─────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };
    return (
        <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${copied
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
                }`}
        >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiado!' : 'Copiar'}
        </button>
    );
}

function SectionTag({ label, color }: { label: string; color: string }) {
    return (
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${color}`}>
            {label}
        </span>
    );
}

// ─── Instagram Card ───────────────────────────────────────────────────────────
function InstagramCard({ data }: { data: WaterfallData['instagram'] }) {
    const [activeTab, setActiveTab] = useState<'carousel' | 'caption'>('carousel');
    const [activeSlide, setActiveSlide] = useState(0);

    const carouselText = data.carousel.slides.map(s => `Slide ${s.number}:\n${s.text}`).join('\n\n');

    return (
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-pink-500/10 to-purple-500/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg shadow-pink-500/30">
                        <Instagram className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-white text-sm uppercase tracking-tighter">Instagram</h3>
                        <p className="text-[9px] text-slate-500 font-mono">2 formatos gerados</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => setActiveTab('carousel')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'carousel' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <List className="w-3 h-3 inline mr-1" />Carrossel
                    </button>
                    <button
                        onClick={() => setActiveTab('caption')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'caption' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Type className="w-3 h-3 inline mr-1" />Caption
                    </button>
                </div>
            </div>

            {activeTab === 'carousel' && (
                <div className="p-5 space-y-4">
                    {/* Slide Navigator */}
                    <div className="flex gap-1.5 flex-wrap">
                        {data.carousel.slides.map((slide, i) => (
                            <button
                                key={slide.number}
                                onClick={() => setActiveSlide(i)}
                                className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${activeSlide === i ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                            >
                                {slide.number}
                            </button>
                        ))}
                    </div>

                    {/* Active Slide */}
                    <div className="bg-slate-950 rounded-xl p-4 border border-white/5 min-h-[120px]">
                        <div className="flex items-center justify-between mb-3">
                            <SectionTag label={`Slide ${data.carousel.slides[activeSlide]?.number}`} color="text-pink-400 bg-pink-500/10 border border-pink-500/20" />
                        </div>
                        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                            {data.carousel.slides[activeSlide]?.text}
                        </p>
                    </div>

                    {/* Copy All */}
                    <div className="flex justify-end">
                        <CopyButton text={carouselText} />
                    </div>
                </div>
            )}

            {activeTab === 'caption' && (
                <div className="p-5 space-y-4">
                    <div className="bg-slate-950 rounded-xl p-4 border border-white/5">
                        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{data.caption}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-600 font-mono">{data.caption.length} chars</span>
                        <CopyButton text={data.caption} />
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Twitter Card ─────────────────────────────────────────────────────────────
function TwitterCard({ data }: { data: WaterfallData['twitter'] }) {
    const [activeTab, setActiveTab] = useState<'thread' | 'single'>('thread');
    const threadText = data.thread.map(t => `${t.number}/${data.thread.length}\n${t.text}`).join('\n\n---\n\n');

    return (
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-800/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 border border-white/10 rounded-xl">
                        <Twitter className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-white text-sm uppercase tracking-tighter">X / Twitter</h3>
                        <p className="text-[9px] text-slate-500 font-mono">Thread + Tweet único</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => setActiveTab('thread')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'thread' ? 'bg-slate-700 text-white border border-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Thread
                    </button>
                    <button
                        onClick={() => setActiveTab('single')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'single' ? 'bg-slate-700 text-white border border-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Tweet
                    </button>
                </div>
            </div>

            {activeTab === 'thread' && (
                <div className="p-5 space-y-3">
                    {data.thread.map((tweet, i) => (
                        <div key={tweet.number} className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-black text-slate-400 flex-shrink-0">
                                    {tweet.number}
                                </div>
                                {i < data.thread.length - 1 && (
                                    <div className="w-px flex-1 bg-white/5 mt-2 mb-1" />
                                )}
                            </div>
                            <div className="flex-1 bg-slate-950 rounded-xl p-3 border border-white/5 mb-2">
                                <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{tweet.text}</p>
                                <p className="text-[9px] text-slate-700 mt-2 font-mono text-right">{tweet.text.length}/280</p>
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-end pt-1">
                        <CopyButton text={threadText} />
                    </div>
                </div>
            )}

            {activeTab === 'single' && (
                <div className="p-5 space-y-4">
                    <div className="bg-slate-950 rounded-xl p-4 border border-white/5">
                        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{data.single_tweet}</p>
                        <p className="text-[9px] text-slate-600 mt-3 font-mono">{data.single_tweet.length}/280 chars</p>
                    </div>
                    <div className="flex justify-end">
                        <CopyButton text={data.single_tweet} />
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Facebook Card ────────────────────────────────────────────────────────────
function FacebookCard({ data }: { data: WaterfallData['facebook'] }) {
    const [activeTab, setActiveTab] = useState<'story' | 'engagement'>('story');

    return (
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-blue-500/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 border border-blue-500/20 rounded-xl">
                        <Facebook className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-black text-white text-sm uppercase tracking-tighter">Facebook</h3>
                        <p className="text-[9px] text-slate-500 font-mono">2 formatos gerados</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => setActiveTab('story')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'story' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Storytelling
                    </button>
                    <button
                        onClick={() => setActiveTab('engagement')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'engagement' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Engajamento
                    </button>
                </div>
            </div>

            {activeTab === 'story' && (
                <div className="p-5 space-y-4">
                    <div className="bg-slate-950 rounded-xl p-4 border border-white/5">
                        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{data.story_post}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-600 font-mono">{data.story_post.length} chars</span>
                        <CopyButton text={data.story_post} />
                    </div>
                </div>
            )}

            {activeTab === 'engagement' && (
                <div className="p-5 space-y-4">
                    <div className="bg-slate-950 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                            <MessageSquare className="w-4 h-4 text-blue-400" />
                            <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Convite ao Engajamento</span>
                        </div>
                        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{data.engagement_post}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-600 font-mono">{data.engagement_post.length} chars</span>
                        <CopyButton text={data.engagement_post} />
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WaterfallPage() {
    const params = useParams();
    const articleId = params.articleId as string;
    const locale = params.locale as string;

    const [article, setArticle] = useState<Article | null>(null);
    const [articleLoading, setArticleLoading] = useState(true);

    const [tone, setTone] = useState<ToneOption>('impactante');
    const [angle, setAngle] = useState<AngleOption>('emocional');
    const [audience, setAudience] = useState<AudienceOption>('diaspora');

    const [isGenerating, setIsGenerating] = useState(false);
    const [generated, setGenerated] = useState<WaterfallData | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch article
    useEffect(() => {
        const load = async () => {
            setArticleLoading(true);
            const { data } = await supabase
                .from('articles')
                .select('id, title, excerpt, content, category:categories(name)')
                .eq('id', articleId)
                .single();

            if (data) {
                const raw = data as any;
                setArticle({
                    ...raw,
                    category: Array.isArray(raw.category) ? raw.category[0] : raw.category,
                });
            }
            setArticleLoading(false);
        };
        if (articleId) load();
    }, [articleId]);

    const handleGenerate = async () => {
        if (!article) return;
        setIsGenerating(true);
        setError(null);
        setGenerated(null);

        try {
            const res = await fetch('/api/waterfall/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: article.title,
                    excerpt: article.excerpt || '',
                    content: article.content || '',
                    category: article.category?.name || '',
                    tone,
                    angle,
                    audience,
                }),
            });

            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.error || 'Erro desconhecido');

            setGenerated(json.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    // ── Option Selectors ──────────────────────────────────────────────────────
    const tones: { key: ToneOption; label: string; emoji: string }[] = [
        { key: 'impactante', label: 'Impactante', emoji: '⚡' },
        { key: 'acolhedor', label: 'Acolhedor', emoji: '🤝' },
        { key: 'informativo', label: 'Informativo', emoji: '📋' },
        { key: 'urgente', label: 'Urgente', emoji: '🚨' },
        { key: 'inspiracional', label: 'Inspiracional', emoji: '✨' },
    ];
    const angles: { key: AngleOption; label: string; emoji: string }[] = [
        { key: 'emocional', label: 'Emocional', emoji: '❤️' },
        { key: 'investigativo', label: 'Investigativo', emoji: '🔍' },
        { key: 'pratico', label: 'Prático', emoji: '🛠️' },
        { key: 'cultural', label: 'Cultural', emoji: '🇧🇷' },
        { key: 'provocador', label: 'Provocador', emoji: '🔥' },
    ];
    const audiences: { key: AudienceOption; label: string; emoji: string }[] = [
        { key: 'diaspora', label: 'Diáspora BR', emoji: '🌎' },
        { key: 'imigrantes', label: 'Imigrantes', emoji: '✈️' },
        { key: 'profissionais', label: 'Profissionais', emoji: '💼' },
        { key: 'familias', label: 'Famílias', emoji: '👨‍👩‍👧' },
    ];

    function OptionPill<T extends string>({
        options,
        value,
        onChange,
    }: {
        options: { key: T; label: string; emoji: string }[];
        value: T;
        onChange: (v: T) => void;
    }) {
        return (
            <div className="flex flex-wrap gap-2">
                {options.map(o => (
                    <button
                        key={o.key}
                        onClick={() => onChange(o.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border ${value === o.key
                            ? 'bg-accent-yellow/20 border-accent-yellow text-accent-yellow shadow-lg shadow-accent-yellow/10'
                            : 'bg-slate-800 border-white/5 text-slate-400 hover:border-white/15 hover:text-slate-300'
                            }`}
                    >
                        <span>{o.emoji}</span> {o.label}
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href={`/${locale}/admin/articles`}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest mb-6 transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> Voltar aos Artigos
                </Link>

                <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl border border-white/10 shadow-xl flex-shrink-0">
                        <Waves className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-1">
                            Content <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Waterfall</span>
                        </h1>
                        <p className="text-slate-400 text-sm">Transforme um artigo em 6 peças de conteúdo social prontas para publicar</p>
                    </div>
                </div>
            </div>

            {/* Article Summary */}
            {articleLoading ? (
                <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 mb-6 animate-pulse">
                    <div className="h-4 bg-slate-800 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-800 rounded w-1/3" />
                </div>
            ) : article ? (
                <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 mb-6 flex items-start gap-4">
                    <div className="p-2 bg-accent-yellow/10 rounded-xl border border-accent-yellow/20 flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-accent-yellow" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Artigo Selecionado</p>
                        <h2 className="text-white font-black text-lg leading-tight line-clamp-2 uppercase italic tracking-tight">{article.title}</h2>
                        {article.category && (
                            <span className="text-[10px] text-accent-yellow font-bold mt-1 block">{article.category.name}</span>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-6 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-sm font-bold">Artigo não encontrado.</p>
                </div>
            )}

            {/* Configuration Panel */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 mb-8 space-y-6">
                <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent-yellow" /> Configurar Geração
                </h3>

                <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block">Tom da Comunicação</label>
                    <OptionPill options={tones} value={tone} onChange={setTone} />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block">Ângulo Narrativo</label>
                    <OptionPill options={angles} value={angle} onChange={setAngle} />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                        <Users className="w-3 h-3" /> Audiência Alvo
                    </label>
                    <OptionPill options={audiences} value={audience} onChange={setAudience} />
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-4">
                    <p className="text-[10px] text-slate-600 italic">
                        GPT-4o · 6 peças · ~45 segundos de geração
                    </p>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !article || articleLoading}
                        className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Gerando Waterfall...</>
                        ) : generated ? (
                            <><RefreshCw className="w-4 h-4" /> Regerar</>
                        ) : (
                            <><Waves className="w-4 h-4" /> Gerar Waterfall</>
                        )}
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-8 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div>
                        <p className="text-red-400 font-bold text-sm">Erro na geração</p>
                        <p className="text-red-400/70 text-xs mt-0.5">{error}</p>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isGenerating && (
                <div className="text-center py-24 space-y-6">
                    <div className="relative w-20 h-20 mx-auto">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin blur-sm opacity-50" />
                        <div className="relative bg-slate-950 rounded-full w-full h-full flex items-center justify-center">
                            <Waves className="w-8 h-8 text-white animate-pulse" />
                        </div>
                    </div>
                    <div>
                        <p className="text-white font-black uppercase tracking-widest text-sm">Chiara está escrevendo...</p>
                        <p className="text-slate-500 text-xs mt-1">Transformando o artigo em 6 peças de conteúdo social</p>
                    </div>
                    <div className="flex justify-center gap-2">
                        {['Instagram', 'X/Twitter', 'Facebook'].map((p, i) => (
                            <span key={p} className="text-[10px] font-black text-slate-600 uppercase tracking-widest animate-pulse" style={{ animationDelay: `${i * 300}ms` }}>
                                {p}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Results */}
            {generated && !isGenerating && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">6 Peças Geradas</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <InstagramCard data={generated.instagram} />
                        <TwitterCard data={generated.twitter} />
                        <FacebookCard data={generated.facebook} />
                    </div>

                    <div className="text-center pt-4">
                        <p className="text-[10px] text-slate-600 italic">
                            Conteúdo gerado por IA com contexto da diáspora brasileira · Revise antes de publicar
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
