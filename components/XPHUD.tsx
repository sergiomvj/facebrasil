"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

export default function XPHUD() {
    const { isSignedIn, user } = useUser();
    const [xp, setXp] = useState(0);
    const [level, setLevel] = useState(1);
    const [progress, setProgress] = useState(0);
    const [showLevelUp, setShowLevelUp] = useState(false);

    // In a real app, use a Context or React Query to share this state and avoid fetching everywhere
    // For MVP, we fetch on mount.
    useEffect(() => {
        if (!isSignedIn) return;

        // Initial Fetch (Mocked for now since we don't have a GET route yet, or we assume 0)
        // To make it real, we'd need a GET /api/gamification/xp/balance endpoint.
        // For the immediate visual feedback demo, I'll simulate a fetch or use local storage if available.
        // Ideally we subscribe to realtime updates or just poll.

        // Let's implement a simple poll/listener pattern for the demo
        const checkXP = () => {
            // Mock calculation
            const currentXP = parseInt(localStorage.getItem('user_xp') || '0');
            setXp(currentXP);

            // Level logic: Level = 1 + floor(XP / 100)
            const newLevel = 1 + Math.floor(currentXP / 100);
            const xpForNextLevel = 100;
            const currentLevelXP = currentXP % 100;

            if (newLevel > level && level !== 1) {
                setShowLevelUp(true);
                setTimeout(() => setShowLevelUp(false), 3000);
            }

            setLevel(newLevel);
            setProgress((currentLevelXP / xpForNextLevel) * 100);
        };

        checkXP();

        // Listen for custom event 'xp_gained' which we will emit from other components
        window.addEventListener('xp_gained', checkXP);
        return () => window.removeEventListener('xp_gained', checkXP);
    }, [isSignedIn, level]);

    if (!isSignedIn) return null;

    return (
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md">
            <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-yellow to-orange-500 flex items-center justify-center font-black text-white text-xs shadow-lg shadow-orange-500/20">
                    {level}
                </div>
                {showLevelUp && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce bg-accent-yellow text-black font-bold text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                        Level Up!
                    </div>
                )}
            </div>

            <div className="flex flex-col w-24">
                <div className="flex justify-between text-[10px] font-bold text-slate-300 mb-1">
                    <span>XP</span>
                    <span>{Math.floor(xp)}</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}
