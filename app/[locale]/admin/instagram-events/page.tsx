'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js';
import {
    Instagram, Wifi, WifiOff, MessageCircle, Heart, AtSign,
    BookImage, Bell, Mail, RefreshCw, Filter, ArrowLeft,
    Activity, Clock, Users, ChevronDown, X, Eye,
} from 'lucide-react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────
interface IGEvent {
    id: string;
    event_type: string;
    object: string | null;
    sender_id: string | null;
    sender_name: string | null;
    media_id: string | null;
    media_url: string | null;
    message: string | null;
    raw_payload: Record<string, unknown>;
    processed: boolean;
    created_at: string;
}

// ─── Event config ─────────────────────────────────────────────────────────────
const EVENT_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
    comment:         { label: 'Comentário',      icon: MessageCircle, color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
    mention:         { label: 'Menção',           icon: AtSign,        color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    direct_message:  { label: 'Mensagem Direta',  icon: Mail,          color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20' },
    story_insight:   { label: 'Story Insight',    icon: BookImage,     color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    feed_update:     { label: 'Feed Update',      icon: Heart,         color: 'text-pink-400',   bg: 'bg-pink-500/10',   border: 'border-pink-500/20' },
    follow:          { label: 'Novo Seguidor',    icon: Users,         color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20' },
    default:         { label: 'Evento',           icon: Bell,          color: 'text-slate-400',  bg: 'bg-slate-500/10',  border: 'border-slate-500/20' },
};

function getConfig(type: string) {
    return EVENT_CONFIG[type] || { ...EVENT_CONFIG.default, label: type };
}

// ─── Time Helpers ─────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
    const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (secs < 60) return `${secs}s atrás`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m atrás`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h atrás`;
    return new Date(iso).toLocaleDateString('pt-BR');
}

function formatFull(iso: string) {
    return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventCard({ event, isNew }: { event: IGEvent; isNew: boolean }) {
    const cfg = getConfig(event.event_type);
    const Icon = cfg.icon;
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`relative overflow-hidden rounded-2xl border ${cfg.border} ${cfg.bg} transition-all duration-500 ${isNew ? 'ring-2 ring-white/20 ring-offset-0' : ''}`}>
            {isNew && (
                <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-white animate-ping m-2" />
            )}
            <div className="p-4 flex items-start gap-4">
                {/* Icon */}
                <div className={`p-2.5 rounded-xl ${cfg.bg} border ${cfg.border} flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${cfg.color} px-2 py-0.5 rounded-full ${cfg.bg} border ${cfg.border}`}>
                            {cfg.label}
                        </span>
                        {isNew && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-white bg-white/10 px-2 py-0.5 rounded-full border border-white/20 animate-pulse">
                                NOVO
                            </span>
                        )}
                        <span className="text-[9px] text-slate-600 font-mono ml-auto">{timeAgo(event.created_at)}</span>
                    </div>

                    {event.message && (
                        <p className="text-white text-sm leading-relaxed line-clamp-2 mt-1">{event.message}</p>
                    )}

                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {event.sender_id && (
                            <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                                <Users className="w-2.5 h-2.5" /> {event.sender_id}
                            </span>
                        )}
                        {event.media_id && (
                            <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                                <BookImage className="w-2.5 h-2.5" /> {event.media_id}
                            </span>
                        )}
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-[9px] text-slate-600 hover:text-slate-400 font-black uppercase tracking-widest flex items-center gap-1 transition-colors ml-auto"
                        >
                            {expanded ? <X className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                            {expanded ? 'Fechar' : 'Payload'}
                        </button>
                    </div>

                    {expanded && (
                        <div className="mt-3 p-3 bg-black/40 rounded-xl border border-white/5 overflow-auto max-h-48">
                            <pre className="text-[9px] text-slate-400 font-mono whitespace-pre-wrap">
                                {JSON.stringify(event.raw_payload, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>

            {/* Timestamp bar */}
            <div className="px-4 pb-2">
                <p className="text-[9px] text-slate-700 font-mono">{formatFull(event.created_at)}</p>
            </div>
        </div>
    );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function EventSkeleton() {
    return (
        <div className="rounded-2xl border border-white/5 bg-slate-900 p-4 animate-pulse">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-800 rounded w-24" />
                    <div className="h-4 bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-800 rounded w-1/3" />
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InstagramEventsPage() {
    const params = useParams();
    const locale = params.locale as string;

    const [events, setEvents] = useState<IGEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [newIds, setNewIds] = useState<Set<string>>(new Set());
    const [filter, setFilter] = useState<string>('all');
    const [showFilter, setShowFilter] = useState(false);
    const [stats, setStats] = useState({ total: 0, last24h: 0, byType: {} as Record<string, number> });
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    // Load initial events
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('instagram_events')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (data) {
                setEvents(data);
                // Compute stats
                const last24h = data.filter((e: IGEvent) => Date.now() - new Date(e.created_at).getTime() < 86400000).length;
                const byType: Record<string, number> = {};
                data.forEach((e: IGEvent) => { byType[e.event_type] = (byType[e.event_type] || 0) + 1; });
                setStats({ total: data.length, last24h, byType });
            }
            setLoading(false);
        };
        load();
    }, []);

    // Supabase Realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel('instagram-events-live')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'instagram_events' },
                (payload: RealtimePostgresInsertPayload<IGEvent>) => {
                    const newEvent = payload.new as IGEvent;
                    setEvents(prev => [newEvent, ...prev.slice(0, 99)]);
                    setNewIds(prev => new Set([...prev, newEvent.id]));
                    setStats(prev => ({
                        total: prev.total + 1,
                        last24h: prev.last24h + 1,
                        byType: { ...prev.byType, [newEvent.event_type]: (prev.byType[newEvent.event_type] || 0) + 1 },
                    }));

                    // Auto-remove "new" badge after 6s
                    setTimeout(() => {
                        setNewIds(prev => { const s = new Set(prev); s.delete(newEvent.id); return s; });
                    }, 6000);

                    // Scroll to top
                    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                }
            )
            .subscribe((status: string) => {
                setConnected(status === 'SUBSCRIBED');
            });

        return () => { supabase.removeChannel(channel); };
    }, []);

    const filtered = filter === 'all' ? events : events.filter(e => e.event_type === filter);
    const allTypes = Array.from(new Set(events.map(e => e.event_type)));

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 50%, #0a0a0f 100%)' }}>
            {/* Header */}
            <div className="border-b border-white/5 bg-black/30 backdrop-blur-xl p-4 md:p-6 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href={`/${locale}/admin/articles`}
                                className="p-2 text-slate-500 hover:text-white rounded-lg border border-white/5 hover:border-white/10 transition-all">
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="p-2.5 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-xl shadow-pink-500/30">
                                        <Instagram className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-xl font-black text-white uppercase italic tracking-tighter">
                                        Instagram <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Events</span>
                                    </h1>
                                    <p className="text-[9px] text-slate-500 font-mono">https://fbr.news/api/instagram</p>
                                </div>
                            </div>
                        </div>

                        {/* Live indicator */}
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${connected ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                            <div className={`flex items-center gap-1.5 ${connected ? 'text-green-400' : 'text-red-400'}`}>
                                {connected
                                    ? <><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><Wifi className="w-3.5 h-3.5" /></>
                                    : <><WifiOff className="w-3.5 h-3.5" /></>
                                }
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${connected ? 'text-green-400' : 'text-red-400'}`}>
                                {connected ? 'Live' : 'Offline'}
                            </span>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Total eventos</p>
                            <p className="text-2xl font-black text-white">{stats.total}</p>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Últimas 24h</p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-black text-white">{stats.last24h}</p>
                                {stats.last24h > 0 && <Activity className="w-4 h-4 text-green-400 animate-pulse" />}
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Tipos distintos</p>
                            <p className="text-2xl font-black text-white">{Object.keys(stats.byType).length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 flex flex-col gap-6">
                {/* Filter bar */}
                <div className="flex items-center gap-3 flex-wrap">
                    <button onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${filter === 'all' ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'}`}>
                        Todos ({events.length})
                    </button>
                    {allTypes.map(type => {
                        const cfg = getConfig(type);
                        const Icon = cfg.icon;
                        return (
                            <button key={type} onClick={() => setFilter(type)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${filter === type ? `${cfg.bg} ${cfg.border} ${cfg.color}` : 'border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'}`}>
                                <Icon className="w-3 h-3" />
                                {cfg.label} ({stats.byType[type] || 0})
                            </button>
                        );
                    })}
                </div>

                {/* Events list */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => <EventSkeleton key={i} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    /* Empty / Waiting state */
                    <div className="flex-1 flex flex-col items-center justify-center py-32 space-y-8">
                        {/* Animated pulse rings */}
                        <div className="relative w-32 h-32">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                            <div className="absolute inset-4 rounded-full bg-gradient-to-r from-pink-500/30 to-purple-500/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.4s' }} />
                            <div className="absolute inset-8 rounded-full bg-gradient-to-r from-pink-500/40 to-purple-500/40 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.8s' }} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="p-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-2xl shadow-pink-500/30">
                                    <Instagram className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <h2 className="text-white font-black text-2xl uppercase italic tracking-tighter">
                                Aguardando Eventos
                            </h2>
                            <p className="text-slate-500 text-sm max-w-sm">
                                {connected
                                    ? 'Conectado ao feed em tempo real. Os eventos do Instagram aparecerão aqui assim que chegarem.'
                                    : 'Reconectando ao feed de eventos...'}
                            </p>
                        </div>

                        {/* Endpoint info */}
                        <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 max-w-md w-full space-y-3">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Endpoint configurado</p>
                            <div className="bg-slate-950 rounded-xl p-3 border border-white/5">
                                <code className="text-xs text-green-400 font-mono break-all">
                                    https://fbr.news/api/instagram
                                </code>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                    <span className="text-[10px] text-slate-400"><code className="text-green-400 font-mono">GET</code> — Verificação Meta (hub.challenge)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    <span className="text-[10px] text-slate-400"><code className="text-blue-400 font-mono">POST</code> — Receber eventos em tempo real</span>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-white/5">
                                <p className="text-[9px] text-slate-600 font-mono">Verify token: <span className="text-slate-400">facebrasil_ig_webhook_2026</span></p>
                            </div>
                        </div>

                        {/* Tipos de evento suportados */}
                        <div className="grid grid-cols-3 gap-2 max-w-xs w-full">
                            {Object.entries(EVENT_CONFIG).filter(([k]) => k !== 'default').map(([key, cfg]) => {
                                const Icon = cfg.icon;
                                return (
                                    <div key={key} className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl ${cfg.bg} border ${cfg.border}`}>
                                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                                        <span className={`text-[8px] font-black uppercase tracking-widest text-center ${cfg.color}`}>{cfg.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div ref={scrollRef} className="space-y-3">
                        {filtered.map(event => (
                            <EventCard
                                key={event.id}
                                event={event}
                                isNew={newIds.has(event.id)}
                            />
                        ))}

                        {filtered.length >= 50 && (
                            <p className="text-center text-[10px] text-slate-600 py-4 font-mono">
                                Mostrando os 50 eventos mais recentes
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Floating setup help */}
            {!loading && events.length === 0 && (
                <div className="fixed bottom-6 right-6 max-w-xs">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl space-y-2">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">⚙️ Como configurar no Meta</p>
                        <ol className="space-y-1.5 list-none">
                            {[
                                'Acesse developers.facebook.com',
                                'App → Webhooks → Instagram',
                                'Cole a URL do endpoint acima',
                                'Token: facebrasil_ig_webhook_2026',
                                'Assine: comments, mentions, messages',
                            ].map((step, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="text-[9px] font-black text-purple-400 w-4 flex-shrink-0">{i + 1}.</span>
                                    <span className="text-[9px] text-slate-400">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            )}
        </div>
    );
}
