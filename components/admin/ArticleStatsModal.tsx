"use client";

import React, { useEffect, useState } from 'react';
import { X, Eye, Heart, Clock, TrendingUp, Languages, BookOpen, Zap, BarChart2, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ArticleStatsModalProps {
    articleId: string;
    articleTitle: string;
    onClose: () => void;
}

interface StatsData {
    total_reads: number;
    unique_readers: number;
    avg_read_time: number;
    avg_scroll_depth: number;
    completion_rate: number;
    bounce_rate: number;
    translator_rate: number;
    top_translation_langs: { lang: string; count: number }[];
    views: number;
    favorites_count: number;
    reads_by_day: { day: string; count: number }[];
    referrers: { referrer: string; count: number }[];
}

export default function ArticleStatsModal({ articleId, articleTitle, onClose }: ArticleStatsModalProps) {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            setLoading(true);

            const [articleRes, readsRes] = await Promise.all([
                supabase.from('articles').select('views, favorites_count').eq('id', articleId).single(),
                supabase.from('article_reads').select('*').eq('article_id', articleId),
            ]);

            const reads = readsRes.data || [];
            const total = reads.length;

            // Aggregate
            const avgReadTime = total ? Math.round(reads.reduce((acc, r) => acc + (r.read_time_seconds || 0), 0) / total) : 0;
            const avgScrollDepth = total ? Math.round(reads.reduce((acc, r) => acc + (r.scroll_depth || 0), 0) / total) : 0;
            const completed = reads.filter(r => r.completed).length;
            const bounced = reads.filter(r => r.bounced).length;
            const translatedSessions = reads.filter(r => r.translator_used);

            // Translation languages
            const langCounts: Record<string, number> = {};
            translatedSessions.forEach(r => {
                if (r.translator_lang) langCounts[r.translator_lang] = (langCounts[r.translator_lang] || 0) + 1;
            });
            const topLangs = Object.entries(langCounts)
                .map(([lang, count]) => ({ lang, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            // Reads by day (last 7 days)
            const dayMap: Record<string, number> = {};
            reads.forEach(r => {
                const day = new Date(r.created_at).toLocaleDateString('pt-BR', { month: 'short', day: '2-digit' });
                dayMap[day] = (dayMap[day] || 0) + 1;
            });
            const readsByDay = Object.entries(dayMap).map(([day, count]) => ({ day, count })).slice(-7);

            // Referrers
            const refMap: Record<string, number> = {};
            reads.forEach(r => { if (r.referrer) refMap[r.referrer] = (refMap[r.referrer] || 0) + 1; });
            const referrers = Object.entries(refMap).map(([referrer, count]) => ({ referrer, count })).sort((a, b) => b.count - a.count).slice(0, 5);

            // Unique readers (non-null user_ids)
            const uniqueUsers = new Set(reads.filter(r => r.user_id).map(r => r.user_id)).size;

            setStats({
                total_reads: total,
                unique_readers: uniqueUsers,
                avg_read_time: avgReadTime,
                avg_scroll_depth: avgScrollDepth,
                completion_rate: total ? Math.round((completed / total) * 100) : 0,
                bounce_rate: total ? Math.round((bounced / total) * 100) : 0,
                translator_rate: total ? Math.round((translatedSessions.length / total) * 100) : 0,
                top_translation_langs: topLangs,
                views: articleRes.data?.views || 0,
                favorites_count: articleRes.data?.favorites_count || 0,
                reads_by_day: readsByDay,
                referrers,
            });
            setLoading(false);
        }
        void loadStats();
    }, [articleId]);

    const formatTime = (secs: number) => {
        if (secs < 60) return `${secs}s`;
        return `${Math.floor(secs / 60)}m ${secs % 60}s`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-3xl border border-white/10 shadow-2xl animate-in zoom-in-95 fade-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-slate-900 rounded-t-3xl z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-accent-yellow/10 rounded-xl border border-accent-yellow/20">
                            <BarChart2 className="w-5 h-5 text-accent-yellow" />
                        </div>
                        <div>
                            <h2 className="font-black text-white text-lg uppercase italic tracking-tighter">Analytics do Artigo</h2>
                            <p className="text-xs text-slate-500 truncate max-w-xs">{articleTitle}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <div className="w-12 h-12 border-4 border-accent-yellow border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : stats && (
                    <div className="p-6 space-y-6">
                        {/* Primary KPIs */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <KpiCard icon={<Eye className="w-4 h-4" />} label="Views Totais" value={stats.views.toLocaleString()} color="blue" />
                            <KpiCard icon={<BookOpen className="w-4 h-4" />} label="Sessões de Leitura" value={stats.total_reads.toLocaleString()} color="yellow" />
                            <KpiCard icon={<Heart className="w-4 h-4" />} label="Favoritos" value={stats.favorites_count.toLocaleString()} color="rose" />
                            <KpiCard icon={<Users className="w-4 h-4" />} label="Leitores Logados" value={stats.unique_readers.toLocaleString()} color="green" />
                        </div>

                        {/* Reading Quality */}
                        <div className="p-5 bg-slate-950/60 rounded-2xl border border-white/5">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Qualidade de Leitura</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <MetricBar label="Tempo Médio" value={formatTime(stats.avg_read_time)} percent={Math.min(100, Math.round(stats.avg_read_time / 3))} color="blue" />
                                <MetricBar label="Scroll Médio" value={`${stats.avg_scroll_depth}%`} percent={stats.avg_scroll_depth} color="yellow" />
                                <MetricBar label="Taxa de Conclusão" value={`${stats.completion_rate}%`} percent={stats.completion_rate} color="green" />
                                <MetricBar label="Bounce Rate" value={`${stats.bounce_rate}%`} percent={stats.bounce_rate} color="rose" />
                            </div>
                        </div>

                        {/* Translation Stats */}
                        <div className="p-5 bg-slate-950/60 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-2 mb-4">
                                <Languages className="w-4 h-4 text-blue-400" />
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                                    Traduções — {stats.translator_rate}% dos leitores usaram o tradutor
                                </h3>
                            </div>
                            {stats.top_translation_langs.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {stats.top_translation_langs.map(l => (
                                        <span key={l.lang} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-bold">
                                            {l.lang.toUpperCase()} — {l.count}×
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-600 italic">Nenhuma tradução registrada ainda.</p>
                            )}
                        </div>

                        {/* Reads by Day */}
                        {stats.reads_by_day.length > 0 && (
                            <div className="p-5 bg-slate-950/60 rounded-2xl border border-white/5">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Leituras por Dia</h3>
                                <div className="flex items-end gap-2 h-24">
                                    {stats.reads_by_day.map(d => {
                                        const max = Math.max(...stats.reads_by_day.map(x => x.count));
                                        const pct = max > 0 ? (d.count / max) * 100 : 0;
                                        return (
                                            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                                                <span className="text-[8px] text-slate-500 font-bold">{d.count}</span>
                                                <div className="w-full rounded-t-sm bg-accent-yellow/70" style={{ height: `${Math.max(4, pct)}%` }} />
                                                <span className="text-[7px] text-slate-600 font-mono">{d.day}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Referrers */}
                        {stats.referrers.length > 0 && (
                            <div className="p-5 bg-slate-950/60 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Origens de Tráfego</h3>
                                </div>
                                <div className="space-y-2">
                                    {stats.referrers.map(r => {
                                        const max = stats.referrers[0]?.count || 1;
                                        return (
                                            <div key={r.referrer} className="flex items-center gap-3">
                                                <span className="text-xs text-slate-400 w-28 truncate font-mono">{r.referrer || 'direct'}</span>
                                                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-green-400 rounded-full" style={{ width: `${(r.count / max) * 100}%` }} />
                                                </div>
                                                <span className="text-xs text-slate-500 tabular-nums">{r.count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
    const colors: Record<string, string> = {
        blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        yellow: 'bg-accent-yellow/10 border-accent-yellow/20 text-accent-yellow',
        rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
        green: 'bg-green-500/10 border-green-500/20 text-green-400',
    };
    return (
        <div className={`p-4 rounded-2xl border ${colors[color]} bg-opacity-10`}>
            <div className="flex items-center gap-2 mb-2 opacity-70">{icon}<span className="text-[9px] font-black uppercase tracking-widest">{label}</span></div>
            <p className="text-2xl font-black tracking-tighter">{value}</p>
        </div>
    );
}

function MetricBar({ label, value, percent, color }: { label: string; value: string; percent: number; color: string }) {
    const track: Record<string, string> = {
        blue: 'bg-blue-400', yellow: 'bg-accent-yellow', green: 'bg-green-400', rose: 'bg-rose-400',
    };
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
                <span className="text-xs font-black text-white">{value}</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${track[color]}`} style={{ width: `${Math.min(100, percent)}%` }} />
            </div>
        </div>
    );
}
