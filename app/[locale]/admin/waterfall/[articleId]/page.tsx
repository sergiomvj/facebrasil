'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
    Waves, Sparkles, Copy, Check, ArrowLeft,
    Instagram, Twitter, Facebook, RefreshCw, Loader2,
    MessageSquare, List, Type, Users, Zap, AlertCircle,
    Save, ImageIcon, X, CheckCircle2, Clock, Database,
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
    instagram: { carousel: { slides: Slide[] }; caption: string; };
    twitter: { thread: Tweet[]; single_tweet: string; };
    facebook: { story_post: string; engagement_post: string; };
}

type PlatformImageKey = 'instagram_carousel' | 'instagram_caption' | 'twitter' | 'facebook';
type GeneratedImages = Partial<Record<PlatformImageKey, string>>;

interface WaterfallSession {
    id: string;
    article_id: string;
    tone: string;
    angle: string;
    audience: string;
    data: WaterfallData;
    images: GeneratedImages;
    created_at: string;
    updated_at: string;
}

type ToneOption = 'impactante' | 'acolhedor' | 'informativo' | 'urgente' | 'inspiracional';
type AngleOption = 'emocional' | 'investigativo' | 'pratico' | 'cultural' | 'provocador';
type AudienceOption = 'diaspora' | 'imigrantes' | 'profissionais' | 'familias';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            onClick={async () => {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${copied
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'}`}
        >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiado!' : 'Copiar'}
        </button>
    );
}

function SectionTag({ label, color }: { label: string; color: string }) {
    return <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${color}`}>{label}</span>;
}

// ─── Image Generator Button ───────────────────────────────────────────────────
function ImageGeneratorButton({
    platform, articleTitle, contentHint, sessionId, savedUrl,
    onGenerated,
}: {
    platform: PlatformImageKey;
    articleTitle: string;
    contentHint: string;
    sessionId?: string;
    savedUrl?: string;
    onGenerated: (platform: PlatformImageKey, url: string) => void;
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(savedUrl || null);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => { if (savedUrl) setImageUrl(savedUrl); }, [savedUrl]);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/waterfall/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ platform, articleTitle, contentHint, sessionId }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.error || 'Erro desconhecido');
            setImageUrl(json.imageUrl);
            onGenerated(platform, json.imageUrl);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            {imageUrl ? (
                <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-slate-950">
                    <img src={imageUrl} alt="Imagem gerada" className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                            onClick={() => setShowPreview(true)}
                            className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white text-[10px] font-black uppercase rounded-lg border border-white/20 hover:bg-white/20 transition-all"
                        >
                            Ver
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white text-[10px] font-black uppercase rounded-lg border border-white/20 hover:bg-white/20 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        </button>
                        <a
                            href={imageUrl}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white text-[10px] font-black uppercase rounded-lg border border-white/20 hover:bg-white/20 transition-all"
                        >
                            ↓
                        </a>
                    </div>
                </div>
            ) : (
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/10 hover:border-white/20 text-slate-500 hover:text-slate-300 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 group"
                >
                    {loading ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" /> Gerando imagem...</>
                    ) : (
                        <><ImageIcon className="w-3.5 h-3.5 group-hover:text-purple-400 transition-colors" /> Gerar imagem com IA</>
                    )}
                </button>
            )}

            {error && (
                <p className="text-red-400 text-[9px] font-mono">{error}</p>
            )}

            {/* Full Preview Modal */}
            {showPreview && imageUrl && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => setShowPreview(false)}
                >
                    <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setShowPreview(false)}
                            className="absolute -top-10 right-0 p-2 text-white/60 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <img src={imageUrl} alt="Preview" className="w-full rounded-2xl shadow-2xl" />
                        <div className="flex gap-2 justify-center mt-4">
                            <a
                                href={imageUrl}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 bg-white/10 text-white text-xs font-black uppercase rounded-xl border border-white/10 hover:bg-white/20 transition-all"
                            >
                                ↓ Download
                            </a>
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="px-4 py-2 bg-purple-600 text-white text-xs font-black uppercase rounded-xl hover:bg-purple-500 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                <RefreshCw className="w-3 h-3" /> Regerar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Instagram Card ───────────────────────────────────────────────────────────
function InstagramCard({
    data, articleTitle, sessionId, images, onImageGenerated,
}: {
    data: WaterfallData['instagram'];
    articleTitle: string;
    sessionId?: string;
    images: GeneratedImages;
    onImageGenerated: (platform: PlatformImageKey, url: string) => void;
}) {
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
                        <p className="text-[9px] text-slate-500 font-mono">2 formatos + imagens IA</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    {(['carousel', 'caption'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {tab === 'carousel' ? <><List className="w-3 h-3 inline mr-1" />Carrossel</> : <><Type className="w-3 h-3 inline mr-1" />Caption</>}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'carousel' && (
                <div className="p-5 space-y-4">
                    <ImageGeneratorButton
                        platform="instagram_carousel"
                        articleTitle={articleTitle}
                        contentHint={data.carousel.slides[0]?.text || ''}
                        sessionId={sessionId}
                        savedUrl={images.instagram_carousel}
                        onGenerated={onImageGenerated}
                    />
                    <div className="flex gap-1.5 flex-wrap">
                        {data.carousel.slides.map((slide, i) => (
                            <button key={slide.number} onClick={() => setActiveSlide(i)}
                                className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${activeSlide === i ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                            >{slide.number}</button>
                        ))}
                    </div>
                    <div className="bg-slate-950 rounded-xl p-4 border border-white/5 min-h-[100px]">
                        <div className="flex items-center justify-between mb-3">
                            <SectionTag label={`Slide ${data.carousel.slides[activeSlide]?.number}`} color="text-pink-400 bg-pink-500/10 border border-pink-500/20" />
                        </div>
                        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{data.carousel.slides[activeSlide]?.text}</p>
                    </div>
                    <div className="flex justify-end"><CopyButton text={carouselText} /></div>
                </div>
            )}

            {activeTab === 'caption' && (
                <div className="p-5 space-y-4">
                    <ImageGeneratorButton
                        platform="instagram_caption"
                        articleTitle={articleTitle}
                        contentHint={data.caption}
                        sessionId={sessionId}
                        savedUrl={images.instagram_caption}
                        onGenerated={onImageGenerated}
                    />
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
function TwitterCard({
    data, articleTitle, sessionId, images, onImageGenerated,
}: {
    data: WaterfallData['twitter'];
    articleTitle: string;
    sessionId?: string;
    images: GeneratedImages;
    onImageGenerated: (platform: PlatformImageKey, url: string) => void;
}) {
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
                        <p className="text-[9px] text-slate-500 font-mono">Thread + Tweet único + imagem</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    {(['thread', 'single'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-700 text-white border border-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                        >{tab === 'thread' ? 'Thread' : 'Tweet'}</button>
                    ))}
                </div>
            </div>

            <div className="p-5 space-y-4">
                <ImageGeneratorButton
                    platform="twitter"
                    articleTitle={articleTitle}
                    contentHint={data.thread[0]?.text || data.single_tweet}
                    sessionId={sessionId}
                    savedUrl={images.twitter}
                    onGenerated={onImageGenerated}
                />

                {activeTab === 'thread' && (
                    <>
                        <div className="space-y-3">
                            {data.thread.map((tweet, i) => (
                                <div key={tweet.number} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-black text-slate-400 flex-shrink-0">
                                            {tweet.number}
                                        </div>
                                        {i < data.thread.length - 1 && <div className="w-px flex-1 bg-white/5 mt-2 mb-1" />}
                                    </div>
                                    <div className="flex-1 bg-slate-950 rounded-xl p-3 border border-white/5 mb-2">
                                        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{tweet.text}</p>
                                        <p className="text-[9px] text-slate-700 mt-2 font-mono text-right">{tweet.text.length}/280</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end"><CopyButton text={threadText} /></div>
                    </>
                )}

                {activeTab === 'single' && (
                    <>
                        <div className="bg-slate-950 rounded-xl p-4 border border-white/5">
                            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{data.single_tweet}</p>
                            <p className="text-[9px] text-slate-600 mt-3 font-mono">{data.single_tweet.length}/280 chars</p>
                        </div>
                        <div className="flex justify-end"><CopyButton text={data.single_tweet} /></div>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Facebook Card ────────────────────────────────────────────────────────────
function FacebookCard({
    data, articleTitle, sessionId, images, onImageGenerated,
}: {
    data: WaterfallData['facebook'];
    articleTitle: string;
    sessionId?: string;
    images: GeneratedImages;
    onImageGenerated: (platform: PlatformImageKey, url: string) => void;
}) {
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
                        <p className="text-[9px] text-slate-500 font-mono">2 formatos + imagem</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    {(['story', 'engagement'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                        >{tab === 'story' ? 'Storytelling' : 'Engajamento'}</button>
                    ))}
                </div>
            </div>

            <div className="p-5 space-y-4">
                <ImageGeneratorButton
                    platform="facebook"
                    articleTitle={articleTitle}
                    contentHint={activeTab === 'story' ? data.story_post : data.engagement_post}
                    sessionId={sessionId}
                    savedUrl={images.facebook}
                    onGenerated={onImageGenerated}
                />

                {activeTab === 'story' && (
                    <>
                        <div className="bg-slate-950 rounded-xl p-4 border border-white/5">
                            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{data.story_post}</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-600 font-mono">{data.story_post.length} chars</span>
                            <CopyButton text={data.story_post} />
                        </div>
                    </>
                )}

                {activeTab === 'engagement' && (
                    <>
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
                    </>
                )}
            </div>
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

    // Session state
    const [sessionId, setSessionId] = useState<string | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);
    const [savedAt, setSavedAt] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImages>({});
    const [sessionLoaded, setSessionLoaded] = useState(false);

    // Load article
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
                setArticle({ ...raw, category: Array.isArray(raw.category) ? raw.category[0] : raw.category });
            }
            setArticleLoading(false);
        };
        if (articleId) load();
    }, [articleId]);

    // Load existing session
    useEffect(() => {
        const loadSession = async () => {
            try {
                const res = await fetch(`/api/waterfall/session?articleId=${articleId}`);
                const json = await res.json();
                if (json.success && json.session) {
                    const s: WaterfallSession = json.session;
                    setSessionId(s.id);
                    setGenerated(s.data);
                    setGeneratedImages(s.images || {});
                    setTone(s.tone as ToneOption);
                    setAngle(s.angle as AngleOption);
                    setAudience(s.audience as AudienceOption);
                    setSavedAt(s.updated_at);
                }
            } catch { /* no session yet */ }
            setSessionLoaded(true);
        };
        if (articleId) loadSession();
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
                    tone, angle, audience,
                }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.error || 'Erro desconhecido');
            setGenerated(json.data);
            setGeneratedImages({}); // Reset images on regeneration
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!generated || !article) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/waterfall/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: sessionId,
                    article_id: article.id,
                    tone, angle, audience,
                    data: generated,
                    images: generatedImages,
                }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.error);
            setSessionId(json.session.id);
            setSavedAt(json.session.updated_at);
        } catch (err: any) {
            alert('Erro ao salvar: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageGenerated = useCallback((platform: PlatformImageKey, url: string) => {
        setGeneratedImages(prev => ({ ...prev, [platform]: url }));
    }, []);

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
        options, value, onChange,
    }: { options: { key: T; label: string; emoji: string }[]; value: T; onChange: (v: T) => void }) {
        return (
            <div className="flex flex-wrap gap-2">
                {options.map(o => (
                    <button
                        key={o.key}
                        onClick={() => onChange(o.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border ${value === o.key
                            ? 'bg-accent-yellow/20 border-accent-yellow text-accent-yellow shadow-lg shadow-accent-yellow/10'
                            : 'bg-slate-800 border-white/5 text-slate-400 hover:border-white/15 hover:text-slate-300'}`}
                    >
                        <span>{o.emoji}</span> {o.label}
                    </button>
                ))}
            </div>
        );
    }

    const formatDate = (iso: string) => new Date(iso).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit',
    });

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
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl border border-white/10 shadow-xl flex-shrink-0">
                            <Waves className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-1">
                                Content <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Waterfall</span>
                            </h1>
                            <p className="text-slate-400 text-sm">Transforme um artigo em 6 peças de conteúdo social com imagens IA</p>
                        </div>
                    </div>

                    {/* Saved badge */}
                    {savedAt && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-xl flex-shrink-0">
                            <Database className="w-3.5 h-3.5 text-green-400" />
                            <div>
                                <p className="text-[9px] text-green-400 font-black uppercase tracking-widest">Salvo</p>
                                <p className="text-[9px] text-slate-500 font-mono">{formatDate(savedAt)}</p>
                            </div>
                        </div>
                    )}
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
                    <div className="min-w-0 flex-1">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Artigo Selecionado</p>
                        <h2 className="text-white font-black text-lg leading-tight line-clamp-2 uppercase italic tracking-tight">{article.title}</h2>
                        {article.category && <span className="text-[10px] text-accent-yellow font-bold mt-1 block">{article.category.name}</span>}
                    </div>
                    {!sessionLoaded && (
                        <div className="flex items-center gap-2 text-slate-600 text-[10px]">
                            <Loader2 className="w-3 h-3 animate-spin" /> Buscando sessão...
                        </div>
                    )}
                    {sessionLoaded && sessionId && !savedAt && (
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono">
                            <Clock className="w-3 h-3" /> Sessão carregada
                        </div>
                    )}
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
                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-4 flex-wrap">
                    <p className="text-[10px] text-slate-600 italic">GPT-4o · 6 peças · ~45s · DALL-E 3 por imagem</p>
                    <div className="flex gap-3">
                        {/* Save Button */}
                        {generated && (
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-green-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isSaving
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                                    : <><Save className="w-4 h-4" /> {savedAt ? 'Atualizar' : 'Salvar'}</>
                                }
                            </button>
                        )}

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !article || articleLoading}
                            className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</>
                                : generated
                                    ? <><RefreshCw className="w-4 h-4" /> Regerar</>
                                    : <><Waves className="w-4 h-4" /> Gerar Waterfall</>
                            }
                        </button>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-8 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div>
                        <p className="text-red-400 font-bold text-sm">Erro na geração</p>
                        <p className="text-red-400/70 text-xs mt-0.5">{error}</p>
                    </div>
                </div>
            )}

            {/* Loading */}
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
                    <div className="flex justify-center gap-4">
                        {['Instagram', 'X/Twitter', 'Facebook'].map((p, i) => (
                            <span key={p} className="text-[10px] font-black text-slate-600 uppercase tracking-widest animate-pulse" style={{ animationDelay: `${i * 300}ms` }}>{p}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Results */}
            {generated && !isGenerating && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">6 Peças · Imagens DALL-E 3</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <InstagramCard
                            data={generated.instagram}
                            articleTitle={article?.title || ''}
                            sessionId={sessionId}
                            images={generatedImages}
                            onImageGenerated={handleImageGenerated}
                        />
                        <TwitterCard
                            data={generated.twitter}
                            articleTitle={article?.title || ''}
                            sessionId={sessionId}
                            images={generatedImages}
                            onImageGenerated={handleImageGenerated}
                        />
                        <FacebookCard
                            data={generated.facebook}
                            articleTitle={article?.title || ''}
                            sessionId={sessionId}
                            images={generatedImages}
                            onImageGenerated={handleImageGenerated}
                        />
                    </div>

                    {/* Bottom save bar */}
                    <div className="flex items-center justify-between bg-slate-900 border border-white/10 rounded-2xl p-4">
                        <div>
                            {savedAt ? (
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    <span className="text-green-400 text-xs font-black uppercase tracking-widest">Salvo em {formatDate(savedAt)}</span>
                                </div>
                            ) : (
                                <p className="text-slate-500 text-xs italic">Sessão ainda não salva — as imagens também ficam salvas</p>
                            )}
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-green-500/20 transition-all disabled:opacity-60"
                        >
                            {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : <><Save className="w-4 h-4" /> {savedAt ? 'Atualizar Sessão' : 'Salvar Sessão'}</>}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-[10px] text-slate-600 italic">
                            Conteúdo gerado por IA · Revise antes de publicar · Imagens: DALL-E 3
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
