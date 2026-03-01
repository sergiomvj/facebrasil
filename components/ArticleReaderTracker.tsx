"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useXP } from '@/hooks/useXP';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Heart } from 'lucide-react';

interface ArticleReaderTrackerProps {
    articleId: string;
}

// Generate a unique session ID for this page visit
function generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ArticleReaderTracker({ articleId }: ArticleReaderTrackerProps) {
    const { grantXP } = useXP();
    const { user } = useAuth();
    const isSignedIn = !!user;

    // Read tracking state
    const sessionId = useRef(generateSessionId());
    const startTime = useRef(Date.now());
    const activeTimeRef = useRef(0);        // seconds of active reading
    const lastActiveRef = useRef(Date.now()); // for computing active intervals
    const scrollDepthRef = useRef(0);         // 0-100
    const completedRef = useRef(false);
    const viewTrackedRef = useRef(false);
    const xpAwardedRef = useRef(false);
    const savedRef = useRef(false);
    const translatorUsedRef = useRef(false);
    const translatorLangRef = useRef<string | null>(null);

    // UI state
    const [isFavorited, setIsFavorited] = useState(false);
    const [favCount, setFavCount] = useState(0);
    const [showXP, setShowXP] = useState(false);
    const [favLoading, setFavLoading] = useState(false);

    // ----- INCREMENT VIEWS (first mount, for all visitors) -----
    useEffect(() => {
        if (viewTrackedRef.current) return;
        viewTrackedRef.current = true;
        supabase.rpc('increment_article_views', { p_article_id: articleId }).catch(() => { });
    }, [articleId]);

    // ----- FETCH INITIAL FAV STATE -----
    useEffect(() => {
        supabase
            .from('articles')
            .select('favorites_count')
            .eq('id', articleId)
            .single()
            .then(({ data }) => { if (data) setFavCount(data.favorites_count || 0); });

        if (isSignedIn && user?.id) {
            supabase
                .from('article_favorites')
                .select('id')
                .eq('article_id', articleId)
                .eq('user_id', user.id)
                .maybeSingle()
                .then(({ data }) => setIsFavorited(!!data));
        }
    }, [articleId, isSignedIn, user?.id]);

    // ----- TRACK ACTIVE TIME (only when tab is visible) -----
    useEffect(() => {
        const onVisChange = () => {
            if (document.visibilityState === 'visible') {
                lastActiveRef.current = Date.now();
            } else {
                activeTimeRef.current += Math.round((Date.now() - lastActiveRef.current) / 1000);
            }
        };
        document.addEventListener('visibilitychange', onVisChange);
        return () => document.removeEventListener('visibilitychange', onVisChange);
    }, []);

    // ----- TRACK SCROLL DEPTH -----
    useEffect(() => {
        const onScroll = () => {
            const el = document.documentElement;
            const scrolled = el.scrollTop + el.clientHeight;
            const total = el.scrollHeight;
            const pct = Math.round((scrolled / total) * 100);
            if (pct > scrollDepthRef.current) {
                scrollDepthRef.current = pct;
                if (pct >= 90) completedRef.current = true;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // ----- LISTEN FOR TRANSLATOR EVENTS -----
    useEffect(() => {
        const onTranslate = (e: Event) => {
            const ce = e as CustomEvent;
            translatorUsedRef.current = true;
            translatorLangRef.current = ce.detail?.lang || null;
        };
        window.addEventListener('article-translated', onTranslate);
        return () => window.removeEventListener('article-translated', onTranslate);
    }, []);

    // ----- SAVE SESSION ON EXIT -----
    const saveSession = useCallback(() => {
        if (savedRef.current) return;
        savedRef.current = true;

        // Final active time calc
        if (document.visibilityState === 'visible') {
            activeTimeRef.current += Math.round((Date.now() - lastActiveRef.current) / 1000);
        }

        const totalSecs = activeTimeRef.current;
        const bounced = totalSecs < 5;
        const referrer = document.referrer ? new URL(document.referrer).hostname : 'direct';

        const payload = {
            p_article_id: articleId,
            p_session_id: sessionId.current,
            p_user_id: user?.id || null,
            p_read_time_seconds: totalSecs,
            p_scroll_depth: scrollDepthRef.current,
            p_completed: completedRef.current,
            p_bounced: bounced,
            p_translator_used: translatorUsedRef.current,
            p_translator_lang: translatorLangRef.current,
            p_referrer: referrer,
        };

        // Use sendBeacon for reliability on page unload
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        // Fallback via supabase rpc (works when tab stays open)
        supabase.rpc('upsert_article_read', payload).catch(() => { });
    }, [articleId, user?.id]);

    useEffect(() => {
        const onUnload = () => saveSession();
        const onVisChange = () => { if (document.visibilityState === 'hidden') saveSession(); };
        window.addEventListener('beforeunload', onUnload);
        document.addEventListener('visibilitychange', onVisChange);
        return () => {
            window.removeEventListener('beforeunload', onUnload);
            document.removeEventListener('visibilitychange', onVisChange);
        };
    }, [saveSession]);

    // ----- XP AFTER 15s -----
    useEffect(() => {
        if (!isSignedIn || xpAwardedRef.current) return;
        const timer = setTimeout(async () => {
            const pts = await grantXP('READ_ARTICLE', articleId);
            if (pts > 0) {
                xpAwardedRef.current = true;
                setShowXP(true);
                setTimeout(() => setShowXP(false), 4000);
            }
        }, 15000);
        return () => clearTimeout(timer);
    }, [isSignedIn, articleId, grantXP]);

    // ----- TOGGLE FAVORITE -----
    const handleFavorite = async () => {
        if (!isSignedIn || !user?.id || favLoading) return;
        setFavLoading(true);
        try {
            const { data } = await supabase.rpc('toggle_article_favorite', {
                p_article_id: articleId,
                p_user_id: user.id,
            });
            if (data) {
                const favorited = (data as any).favorited;
                setIsFavorited(favorited);
                setFavCount(prev => favorited ? prev + 1 : Math.max(0, prev - 1));
            }
        } catch (e) {
            console.error('Favorite toggle error', e);
        } finally {
            setFavLoading(false);
        }
    };

    return (
        <>
            {/* Favorite Button */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleFavorite}
                    disabled={!isSignedIn || favLoading}
                    title={isSignedIn ? (isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos') : 'Faça login para favoritar'}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 font-bold text-sm
                        ${isFavorited
                            ? 'bg-rose-500/10 border-rose-500/40 text-rose-500 hover:bg-rose-500/20'
                            : 'border-gray-200 dark:border-white/10 text-slate-500 hover:border-rose-400 hover:text-rose-400 dark:hover:border-rose-500'
                        }
                        ${!isSignedIn ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                >
                    <Heart
                        className={`w-4 h-4 transition-all duration-300 ${isFavorited ? 'fill-rose-500 text-rose-500 scale-110' : ''}`}
                    />
                    <span>{favCount > 0 ? favCount : ''} {isFavorited ? 'Favoritado' : 'Favoritar'}</span>
                </button>

                {!isSignedIn && (
                    <span className="text-xs text-slate-400 italic">Faça login para favoritar</span>
                )}
            </div>

            {/* XP Notification */}
            {showXP && (
                <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
                    <div className="bg-slate-900 border border-accent-yellow/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent-yellow/20 flex items-center justify-center text-accent-yellow text-lg">⚡</div>
                        <div>
                            <p className="font-bold text-accent-yellow text-sm">+50 XP Ganhos!</p>
                            <p className="text-xs text-slate-400">Obrigado por ler o artigo.</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
