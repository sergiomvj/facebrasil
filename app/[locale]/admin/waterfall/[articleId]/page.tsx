'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
    Waves, Sparkles, Copy, Check, ArrowLeft, Instagram, Twitter, Facebook,
    RefreshCw, Loader2, MessageSquare, List, Type, Users, Zap, AlertCircle,
    Save, ImageIcon, X, CheckCircle2, Database, Send, Settings, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Article { id: string; title: string; excerpt?: string; content?: string; category?: { name: string }; }
interface Slide { number: number; text: string; }
interface Tweet { number: number; text: string; }
interface WaterfallData {
    instagram: { carousel: { slides: Slide[] }; caption: string; };
    twitter: { thread: Tweet[]; single_tweet: string; };
    facebook: { story_post: string; engagement_post: string; };
}
type SlideImages = Record<string, string>; // { "1": url, "2": url, ... }
type PlatformImageKey = 'instagram_caption' | 'twitter' | 'facebook';
type OtherImages = Partial<Record<PlatformImageKey, string>>;
type ToneOption = 'impactante' | 'acolhedor' | 'informativo' | 'urgente' | 'inspiracional';
type AngleOption = 'emocional' | 'investigativo' | 'pratico' | 'cultural' | 'provocador';
type AudienceOption = 'diaspora' | 'imigrantes' | 'profissionais' | 'familias';

interface PostStatus { status: 'idle' | 'posting' | 'done' | 'error'; url?: string; error?: string; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${copied ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'}`}
        >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiado!' : 'Copiar'}
        </button>
    );
}

// ─── Image Generator (single) ─────────────────────────────────────────────────
function ImageGen({
    platform, articleTitle, contentHint, sessionId, savedUrl, onGenerated, size = 'md'
}: {
    platform: string; articleTitle: string; contentHint: string;
    sessionId?: string; savedUrl?: string;
    onGenerated: (url: string) => void; size?: 'sm' | 'md';
}) {
    const [loading, setLoading] = useState(false);
    const [url, setUrl] = useState<string | null>(savedUrl || null);
    const [preview, setPreview] = useState(false);

    useEffect(() => { if (savedUrl) setUrl(savedUrl); }, [savedUrl]);

    const generate = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/waterfall/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ platform, articleTitle, contentHint, sessionId }),
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.error);
            setUrl(json.imageUrl);
            onGenerated(json.imageUrl);
        } catch (err: any) {
            alert('Erro na imagem: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (url) return (
        <div className={`relative group rounded-xl overflow-hidden border border-white/10 ${size === 'sm' ? 'h-24' : 'h-32'}`}>
            <img src={url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                <button onClick={() => setPreview(true)} className="px-2 py-1 bg-white/10 text-white text-[9px] font-black rounded border border-white/20 hover:bg-white/20">Ver</button>
                <button onClick={generate} disabled={loading} className="px-2 py-1 bg-white/10 text-white text-[9px] font-black rounded border border-white/20 hover:bg-white/20 disabled:opacity-50">
                    {loading ? '...' : '↺'}
                </button>
                <a href={url} download target="_blank" rel="noreferrer" className="px-2 py-1 bg-white/10 text-white text-[9px] font-black rounded border border-white/20 hover:bg-white/20">↓</a>
            </div>
            {preview && (
                <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setPreview(false)}>
                    <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setPreview(false)} className="absolute -top-9 right-0 text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
                        <img src={url} alt="" className="w-full rounded-2xl shadow-2xl" />
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <button onClick={generate} disabled={loading}
            className={`w-full flex items-center justify-center gap-2 ${size === 'sm' ? 'py-2 text-[9px]' : 'py-3 text-[10px]'} rounded-xl border border-dashed border-white/10 hover:border-purple-500/30 text-slate-600 hover:text-purple-400 font-black uppercase tracking-widest transition-all disabled:opacity-40`}
        >
            {loading ? <><Loader2 className="w-3 h-3 animate-spin" />Gerando...</> : <><ImageIcon className="w-3 h-3" />Gerar imagem IA</>}
        </button>
    );
}

// ─── Post Button ──────────────────────────────────────────────────────────────
function PostButton({ label, onClick, status, color = 'default' }: {
    label: string; onClick: () => void; status: PostStatus; color?: 'pink' | 'slate' | 'blue' | 'default';
}) {
    const colorMap = {
        pink: 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-pink-500/20',
        slate: 'bg-slate-700 hover:bg-slate-600',
        blue: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20',
        default: 'bg-slate-700 hover:bg-slate-600',
    };

    if (status.status === 'done') return (
        <a href={status.url} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-500/30 transition-all">
            <CheckCircle2 className="w-3 h-3" /> Publicado <ExternalLink className="w-2.5 h-2.5" />
        </a>
    );

    if (status.status === 'error') return (
        <button onClick={onClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500/30 transition-all">
            <AlertCircle className="w-3 h-3" /> Tentar novamente
        </button>
    );

    return (
        <button onClick={onClick} disabled={status.status === 'posting'}
            className={`flex items-center gap-1.5 px-3 py-1.5 ${colorMap[color]} text-white shadow-lg rounded-lg text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-60`}>
            {status.status === 'posting'
                ? <><Loader2 className="w-3 h-3 animate-spin" />Publicando...</>
                : <><Send className="w-3 h-3" />{label}</>
            }
        </button>
    );
}

// ─── Instagram Card ───────────────────────────────────────────────────────────
function InstagramCard({
    data, articleTitle, sessionId, slideImages, captionImage, onSlideImageGenerated, onCaptionImageGenerated, onPost,
}: {
    data: WaterfallData['instagram']; articleTitle: string; sessionId?: string;
    slideImages: SlideImages; captionImage?: string;
    onSlideImageGenerated: (slideNum: string, url: string) => void;
    onCaptionImageGenerated: (url: string) => void;
    onPost: (type: string, payload: Record<string, unknown>) => Promise<PostStatus>;
}) {
    const [activeTab, setActiveTab] = useState<'carousel' | 'caption'>('carousel');
    const [activeSlide, setActiveSlide] = useState(0);
    const [carouselPostStatus, setCarouselPostStatus] = useState<PostStatus>({ status: 'idle' });
    const [captionPostStatus, setCaptionPostStatus] = useState<PostStatus>({ status: 'idle' });

    const slides = data.carousel.slides;
    const carouselText = slides.map(s => `Slide ${s.number}:\n${s.text}`).join('\n\n');

    const handlePostCarousel = async () => {
        setCarouselPostStatus({ status: 'posting' });
        const slideUrls = slides.map(s => slideImages[String(s.number)]).filter(Boolean) as string[];
        const result = await onPost('instagram_carousel', {
            platform: 'instagram_carousel',
            contentType: 'carousel',
            text: data.caption,
            slideImageUrls: slideUrls,
        });
        setCarouselPostStatus(result);
    };

    const handlePostCaption = async () => {
        setCaptionPostStatus({ status: 'posting' });
        const result = await onPost('instagram_caption', {
            platform: 'instagram_caption',
            contentType: 'caption',
            text: data.caption,
            imageUrl: captionImage,
        });
        setCaptionPostStatus(result);
    };

    return (
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-pink-500/10 to-purple-500/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg shadow-pink-500/30">
                        <Instagram className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-white text-sm uppercase tracking-tighter">Instagram</h3>
                        <p className="text-[9px] text-slate-500 font-mono">5 slides + caption · imagem por slide</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    {(['carousel', 'caption'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'text-slate-500 hover:text-slate-300'}`}>
                            {tab === 'carousel' ? <><List className="w-3 h-3 inline mr-1" />Carrossel</> : <><Type className="w-3 h-3 inline mr-1" />Caption</>}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'carousel' && (
                <div className="p-5 space-y-4">
                    {/* Slide selector */}
                    <div className="flex gap-1.5">
                        {slides.map((slide, i) => (
                            <button key={slide.number} onClick={() => setActiveSlide(i)}
                                className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${activeSlide === i ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>
                                {slide.number}
                            </button>
                        ))}
                    </div>

                    {/* Active slide with its image */}
                    <div className="bg-slate-950 rounded-xl border border-white/5 overflow-hidden">
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[9px] font-black text-pink-400 uppercase tracking-widest bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-full">
                                    Slide {slides[activeSlide]?.number}
                                </span>
                            </div>
                            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{slides[activeSlide]?.text}</p>
                        </div>
                        <div className="px-4 pb-4">
                            <ImageGen
                                platform={`instagram_carousel_slide_${slides[activeSlide]?.number}`}
                                articleTitle={articleTitle}
                                contentHint={slides[activeSlide]?.text || ''}
                                sessionId={sessionId}
                                savedUrl={slideImages[String(slides[activeSlide]?.number)]}
                                onGenerated={(url) => onSlideImageGenerated(String(slides[activeSlide]?.number), url)}
                                size="md"
                            />
                        </div>
                    </div>

                    {/* Slide image grid overview */}
                    <div className="grid grid-cols-5 gap-1.5">
                        {slides.map(slide => (
                            <div key={slide.number} onClick={() => setActiveSlide(slide.number - 1)}
                                className={`aspect-square rounded-lg border cursor-pointer overflow-hidden transition-all ${activeSlide === slide.number - 1 ? 'border-pink-500' : 'border-white/5 hover:border-white/15'}`}>
                                {slideImages[String(slide.number)]
                                    ? <img src={slideImages[String(slide.number)]} alt="" className="w-full h-full object-cover" />
                                    : <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[9px] text-slate-600 font-black">{slide.number}</div>}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <CopyButton text={carouselText} />
                        <PostButton
                            label="Publicar Carrossel"
                            onClick={handlePostCarousel}
                            status={carouselPostStatus}
                            color="pink"
                        />
                    </div>
                </div>
            )}

            {activeTab === 'caption' && (
                <div className="p-5 space-y-4">
                    <ImageGen
                        platform="instagram_caption"
                        articleTitle={articleTitle}
                        contentHint={data.caption}
                        sessionId={sessionId}
                        savedUrl={captionImage}
                        onGenerated={onCaptionImageGenerated}
                    />
                    <div className="bg-slate-950 rounded-xl p-4 border border-white/5">
                        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{data.caption}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <CopyButton text={data.caption} />
                        <PostButton label="Publicar Caption" onClick={handlePostCaption} status={captionPostStatus} color="pink" />
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Twitter Card ─────────────────────────────────────────────────────────────
function TwitterCard({
    data, articleTitle, sessionId, twitterImage, onImageGenerated, onPost,
}: {
    data: WaterfallData['twitter']; articleTitle: string; sessionId?: string;
    twitterImage?: string; onImageGenerated: (url: string) => void;
    onPost: (type: string, payload: Record<string, unknown>) => Promise<PostStatus>;
}) {
    const [activeTab, setActiveTab] = useState<'thread' | 'single'>('thread');
    const [threadStatus, setThreadStatus] = useState<PostStatus>({ status: 'idle' });
    const [tweetStatus, setTweetStatus] = useState<PostStatus>({ status: 'idle' });
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
                        <p className="text-[9px] text-slate-500 font-mono">Thread + Tweet · 1 imagem</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    {(['thread', 'single'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-700 text-white border border-white/10' : 'text-slate-500 hover:text-slate-300'}`}>
                            {tab === 'thread' ? 'Thread' : 'Tweet'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-5 space-y-4">
                <ImageGen
                    platform="twitter"
                    articleTitle={articleTitle}
                    contentHint={data.thread[0]?.text || data.single_tweet}
                    sessionId={sessionId}
                    savedUrl={twitterImage}
                    onGenerated={onImageGenerated}
                />

                {activeTab === 'thread' && (
                    <>
                        <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                            {data.thread.map((tweet, i) => (
                                <div key={tweet.number} className="flex gap-3">
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[9px] font-black text-slate-400">{tweet.number}</div>
                                        {i < data.thread.length - 1 && <div className="w-px flex-1 bg-white/5 mt-1.5 mb-0.5" />}
                                    </div>
                                    <div className="flex-1 bg-slate-950 rounded-xl p-3 border border-white/5 mb-1.5">
                                        <p className="text-white text-xs leading-relaxed whitespace-pre-wrap">{tweet.text}</p>
                                        <p className="text-[9px] text-slate-700 mt-1.5 font-mono text-right">{tweet.text.length}/280</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-white/5">
                            <CopyButton text={threadText} />
                            <PostButton label="Publicar Thread"
                                onClick={async () => {
                                    setThreadStatus({ status: 'posting' });
                                    const texts = data.thread.map(t => t.text);
                                    const result = await onPost('twitter_thread', { platform: 'twitter_thread', contentType: 'thread', texts, imageUrl: twitterImage });
                                    setThreadStatus(result);
                                }}
                                status={threadStatus} color="slate" />
                        </div>
                    </>
                )}

                {activeTab === 'single' && (
                    <>
                        <div className="bg-slate-950 rounded-xl p-4 border border-white/5">
                            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{data.single_tweet}</p>
                            <p className="text-[9px] text-slate-600 mt-2 font-mono">{data.single_tweet.length}/280 chars</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <CopyButton text={data.single_tweet} />
                            <PostButton label="Tweetar"
                                onClick={async () => {
                                    setTweetStatus({ status: 'posting' });
                                    const result = await onPost('twitter_tweet', { platform: 'twitter_tweet', contentType: 'tweet', text: data.single_tweet, imageUrl: twitterImage });
                                    setTweetStatus(result);
                                }}
                                status={tweetStatus} color="slate" />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Facebook Card ────────────────────────────────────────────────────────────
function FacebookCard({
    data, articleTitle, sessionId, fbImage, onImageGenerated, onPost,
}: {
    data: WaterfallData['facebook']; articleTitle: string; sessionId?: string;
    fbImage?: string; onImageGenerated: (url: string) => void;
    onPost: (type: string, payload: Record<string, unknown>) => Promise<PostStatus>;
}) {
    const [activeTab, setActiveTab] = useState<'story' | 'engagement'>('story');
    const [storyStatus, setStoryStatus] = useState<PostStatus>({ status: 'idle' });
    const [engStatus, setEngStatus] = useState<PostStatus>({ status: 'idle' });

    return (
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-blue-500/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 border border-blue-500/20 rounded-xl">
                        <Facebook className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-black text-white text-sm uppercase tracking-tighter">Facebook</h3>
                        <p className="text-[9px] text-slate-500 font-mono">2 formatos + 1 imagem</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    {(['story', 'engagement'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'}`}>
                            {tab === 'story' ? 'Storytelling' : 'Engajamento'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-5 space-y-4">
                <ImageGen
                    platform="facebook"
                    articleTitle={articleTitle}
                    contentHint={activeTab === 'story' ? data.story_post : data.engagement_post}
                    sessionId={sessionId}
                    savedUrl={fbImage}
                    onGenerated={onImageGenerated}
                />

                {activeTab === 'story' && (
                    <>
                        <div className="bg-slate-950 rounded-xl p-4 border border-white/5">
                            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{data.story_post}</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <CopyButton text={data.story_post} />
                            <PostButton label="Publicar no Facebook"
                                onClick={async () => {
                                    setStoryStatus({ status: 'posting' });
                                    const result = await onPost('facebook', { platform: 'facebook', contentType: 'story', text: data.story_post, imageUrl: fbImage });
                                    setStoryStatus(result);
                                }}
                                status={storyStatus} color="blue" />
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
                            <CopyButton text={data.engagement_post} />
                            <PostButton label="Publicar Engajamento"
                                onClick={async () => {
                                    setEngStatus({ status: 'posting' });
                                    const result = await onPost('facebook', { platform: 'facebook', contentType: 'engagement', text: data.engagement_post, imageUrl: fbImage });
                                    setEngStatus(result);
                                }}
                                status={engStatus} color="blue" />
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

    // Session
    const [sessionId, setSessionId] = useState<string | undefined>();
    const [isSaving, setIsSaving] = useState(false);
    const [savedAt, setSavedAt] = useState<string | null>(null);

    // Images
    const [slideImages, setSlideImages] = useState<SlideImages>({});
    const [otherImages, setOtherImages] = useState<OtherImages>({});

    // Load article
    useEffect(() => {
        const load = async () => {
            setArticleLoading(true);
            const { data } = await supabase.from('articles')
                .select('id, title, excerpt, content, category:categories(name)')
                .eq('id', articleId).single();
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
        const load = async () => {
            try {
                const res = await fetch(`/api/waterfall/session?articleId=${articleId}`);
                const json = await res.json();
                if (json.success && json.session) {
                    const s = json.session;
                    setSessionId(s.id);
                    setGenerated(s.data);
                    setTone(s.tone); setAngle(s.angle); setAudience(s.audience);
                    setSavedAt(s.updated_at);
                    setSlideImages(s.slide_images || {});
                    setOtherImages(s.images || {});
                }
            } catch { /* no session */ }
        };
        if (articleId) load();
    }, [articleId]);

    const handleGenerate = async () => {
        if (!article) return;
        setIsGenerating(true); setError(null); setGenerated(null);
        setSlideImages({}); setOtherImages({});
        try {
            const res = await fetch('/api/waterfall/generate', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: article.title, excerpt: article.excerpt || '', content: article.content || '', category: article.category?.name || '', tone, angle, audience }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.error);
            setGenerated(json.data);
        } catch (err: any) { setError(err.message); }
        finally { setIsGenerating(false); }
    };

    const handleSave = async () => {
        if (!generated || !article) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/waterfall/session', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: sessionId, article_id: article.id, tone, angle, audience, data: generated, images: otherImages, slide_images: slideImages }),
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.error);
            setSessionId(json.session.id);
            setSavedAt(json.session.updated_at);
        } catch (err: any) { alert('Erro ao salvar: ' + err.message); }
        finally { setIsSaving(false); }
    };

    const handlePost = useCallback(async (_type: string, payload: Record<string, unknown>): Promise<PostStatus> => {
        try {
            const res = await fetch('/api/waterfall/post', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...payload, sessionId }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                if (json.notConfigured) return { status: 'error', error: 'Credenciais não configuradas. Configure em Contas de Redes Sociais.' };
                throw new Error(json.error);
            }
            return { status: 'done', url: json.postUrl };
        } catch (err: any) {
            return { status: 'error', error: err.message };
        }
    }, [sessionId]);

    const tones = [
        { key: 'impactante' as ToneOption, label: 'Impactante', emoji: '⚡' },
        { key: 'acolhedor' as ToneOption, label: 'Acolhedor', emoji: '🤝' },
        { key: 'informativo' as ToneOption, label: 'Informativo', emoji: '📋' },
        { key: 'urgente' as ToneOption, label: 'Urgente', emoji: '🚨' },
        { key: 'inspiracional' as ToneOption, label: 'Inspiracional', emoji: '✨' },
    ];
    const angles = [
        { key: 'emocional' as AngleOption, label: 'Emocional', emoji: '❤️' },
        { key: 'investigativo' as AngleOption, label: 'Investigativo', emoji: '🔍' },
        { key: 'pratico' as AngleOption, label: 'Prático', emoji: '🛠️' },
        { key: 'cultural' as AngleOption, label: 'Cultural', emoji: '🇧🇷' },
        { key: 'provocador' as AngleOption, label: 'Provocador', emoji: '🔥' },
    ];
    const audiences = [
        { key: 'diaspora' as AudienceOption, label: 'Diáspora BR', emoji: '🌎' },
        { key: 'imigrantes' as AudienceOption, label: 'Imigrantes', emoji: '✈️' },
        { key: 'profissionais' as AudienceOption, label: 'Profissionais', emoji: '💼' },
        { key: 'familias' as AudienceOption, label: 'Famílias', emoji: '👨‍👩‍👧' },
    ];

    function Pill<T extends string>({ options, value, onChange }: { options: { key: T; label: string; emoji: string }[]; value: T; onChange: (v: T) => void }) {
        return (
            <div className="flex flex-wrap gap-2">
                {options.map(o => (
                    <button key={o.key} onClick={() => onChange(o.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border ${value === o.key ? 'bg-accent-yellow/20 border-accent-yellow text-accent-yellow' : 'bg-slate-800 border-white/5 text-slate-400 hover:border-white/15 hover:text-slate-300'}`}>
                        <span>{o.emoji}</span> {o.label}
                    </button>
                ))}
            </div>
        );
    }

    const fmt = (iso: string) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <Link href={`/${locale}/admin/articles`} className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /> Voltar
                    </Link>
                    <Link href={`/${locale}/admin/social-credentials`}
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/20">
                        <Settings className="w-3.5 h-3.5" /> Contas Sociais
                    </Link>
                </div>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl border border-white/10 shadow-xl flex-shrink-0">
                            <Waves className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-1">
                                Content <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Waterfall</span>
                            </h1>
                            <p className="text-slate-400 text-sm">6 peças · 5 imagens por slide IG · Publicar direto nas redes</p>
                        </div>
                    </div>
                    {savedAt && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-xl flex-shrink-0">
                            <Database className="w-3.5 h-3.5 text-green-400" />
                            <div>
                                <p className="text-[9px] text-green-400 font-black uppercase tracking-widest">Salvo</p>
                                <p className="text-[9px] text-slate-500 font-mono">{fmt(savedAt)}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Article */}
            {articleLoading ? (
                <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 mb-6 animate-pulse h-20" />
            ) : article ? (
                <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 mb-6 flex items-start gap-4">
                    <div className="p-2 bg-accent-yellow/10 rounded-xl border border-accent-yellow/20 flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-accent-yellow" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Artigo</p>
                        <h2 className="text-white font-black text-lg leading-tight line-clamp-1 uppercase italic tracking-tight">{article.title}</h2>
                        {article.category && <span className="text-[10px] text-accent-yellow font-bold">{article.category.name}</span>}
                    </div>
                </div>
            ) : (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-6 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-red-400 text-sm font-bold">Artigo não encontrado.</p>
                </div>
            )}

            {/* Config */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 mb-8 space-y-5">
                <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent-yellow" /> Configurar Geração
                </h3>
                <div className="space-y-2"><label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block">Tom</label><Pill options={tones} value={tone} onChange={setTone} /></div>
                <div className="space-y-2"><label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block">Ângulo</label><Pill options={angles} value={angle} onChange={setAngle} /></div>
                <div className="space-y-2"><label className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1"><Users className="w-3 h-3" />Audiência</label><Pill options={audiences} value={audience} onChange={setAudience} /></div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-4 flex-wrap">
                    <p className="text-[10px] text-slate-600 italic">GPT-4o · 5 slides IG · DALL-E 3 por imagem</p>
                    <div className="flex gap-3">
                        {generated && (
                            <button onClick={handleSave} disabled={isSaving}
                                className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg disabled:opacity-60 transition-all">
                                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</> : <><Save className="w-4 h-4" />{savedAt ? 'Atualizar' : 'Salvar'}</>}
                            </button>
                        )}
                        <button onClick={handleGenerate} disabled={isGenerating || !article || articleLoading}
                            className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl transition-all disabled:opacity-50">
                            {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" />Gerando...</> : generated ? <><RefreshCw className="w-4 h-4" />Regerar</> : <><Waves className="w-4 h-4" />Gerar Waterfall</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-8 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div><p className="text-red-400 font-bold text-sm">Erro na geração</p><p className="text-red-400/70 text-xs">{error}</p></div>
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
                    <p className="text-white font-black uppercase tracking-widest text-sm">Processando...</p>
                    <p className="text-slate-500 text-xs">5 slides IG · Thread X · Posts Facebook</p>
                </div>
            )}

            {/* Results */}
            {generated && !isGenerating && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">6 Peças · DALL-E 3 por slide</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <InstagramCard
                            data={generated.instagram}
                            articleTitle={article?.title || ''}
                            sessionId={sessionId}
                            slideImages={slideImages}
                            captionImage={otherImages.instagram_caption}
                            onSlideImageGenerated={(n, url) => setSlideImages(prev => ({ ...prev, [n]: url }))}
                            onCaptionImageGenerated={(url) => setOtherImages(prev => ({ ...prev, instagram_caption: url }))}
                            onPost={handlePost}
                        />
                        <TwitterCard
                            data={generated.twitter}
                            articleTitle={article?.title || ''}
                            sessionId={sessionId}
                            twitterImage={otherImages.twitter}
                            onImageGenerated={(url) => setOtherImages(prev => ({ ...prev, twitter: url }))}
                            onPost={handlePost}
                        />
                        <FacebookCard
                            data={generated.facebook}
                            articleTitle={article?.title || ''}
                            sessionId={sessionId}
                            fbImage={otherImages.facebook}
                            onImageGenerated={(url) => setOtherImages(prev => ({ ...prev, facebook: url }))}
                            onPost={handlePost}
                        />
                    </div>

                    {/* Bottom bar */}
                    <div className="flex items-center justify-between bg-slate-900 border border-white/10 rounded-2xl p-4">
                        <div>
                            {savedAt
                                ? <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /><span className="text-green-400 text-xs font-black uppercase">Salvo em {fmt(savedAt)}</span></div>
                                : <p className="text-slate-500 text-xs italic">Sessão não salva — imagens de slide ficam salvas ao salvar</p>
                            }
                        </div>
                        <button onClick={handleSave} disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg disabled:opacity-60 transition-all">
                            {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</> : <><Save className="w-4 h-4" />{savedAt ? 'Atualizar Sessão' : 'Salvar Sessão'}</>}
                        </button>
                    </div>
                    <p className="text-center text-[10px] text-slate-600 italic">IA · Revise antes de publicar · DALL-E 3</p>
                </div>
            )}
        </div>
    );
}
