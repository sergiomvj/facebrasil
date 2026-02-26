"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useXP } from '@/hooks/useXP';
import { useAuth } from '@/contexts/AuthContext';


export default function ArticleReaderTracker({ articleId }: { articleId: string }) {
    const { grantXP } = useXP();
    const { user } = useAuth();
    const isSignedIn = !!user;

    const awardedRef = useRef(false);
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        if (!isSignedIn || awardedRef.current) return;

        const timer = setTimeout(async () => {
            // Award XP after 15 seconds of reading
            const points = await grantXP('READ_ARTICLE', articleId);
            if (points > 0) {
                awardedRef.current = true;
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 4000);
            }
        }, 15000); // 15 seconds

        return () => clearTimeout(timer);
    }, [isSignedIn, articleId, grantXP]);

    if (!showNotification) return null;

    return (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="bg-slate-900 border border-accent-yellow/50 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-yellow/20 flex items-center justify-center text-accent-yellow">
                    <span className="material-symbols-outlined">military_tech</span>
                </div>
                <div>
                    <p className="font-bold text-accent-yellow text-sm">XP Gained!</p>
                    <p className="text-xs text-slate-400">You earned 50 XP for reading.</p>
                </div>
            </div>
        </div>
    );
}
