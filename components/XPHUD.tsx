"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, TrendingUp } from 'lucide-react';

interface XPData {
    xp: number;
    level: number;
    xpForCurrentLevel: number;
    xpForNextLevel: number;
    progress: number;
}

export default function XPHUD() {
    const { user } = useAuth();
    const isSignedIn = !!user;

    const [data, setData] = useState<XPData>({
        xp: 0,
        level: 1,
        xpForCurrentLevel: 0,
        xpForNextLevel: 100,
        progress: 0
    });
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [loading, setLoading] = useState(true);
    // Ref instead of state so that updating it doesn't recreate the fetchXP
    // callback and trigger an unnecessary effect re-run + double API call.
    const previousLevelRef = useRef(1);

    const fetchXP = useCallback(async () => {
        if (!isSignedIn) return;

        try {
            const response = await fetch('/api/gamification/xp/balance');
            if (!response.ok) throw new Error('Failed to fetch');

            const result = await response.json();

            if (result.success) {
                // Verificar se subiu de nível
                if (result.level > previousLevelRef.current && previousLevelRef.current !== 1) {
                    setShowLevelUp(true);
                    setTimeout(() => setShowLevelUp(false), 4000);
                }

                previousLevelRef.current = result.level;
                setData({
                    xp: result.xp,
                    level: result.level,
                    xpForCurrentLevel: result.xpForCurrentLevel,
                    xpForNextLevel: result.xpForNextLevel,
                    progress: result.progress
                });
            }
        } catch (error) {
            console.error('[XPHUD] Error fetching XP:', error);
        } finally {
            setLoading(false);
        }
    }, [isSignedIn]);

    useEffect(() => {
        fetchXP();

        // Atualizar a cada 30 segundos
        const interval = setInterval(fetchXP, 30000);

        // Listener para evento de ganho de XP
        const handleXPGained = () => {
            fetchXP();
        };

        window.addEventListener('xp_gained', handleXPGained);

        return () => {
            clearInterval(interval);
            window.removeEventListener('xp_gained', handleXPGained);
        };
    }, [fetchXP]);

    if (!isSignedIn) return null;

    if (loading) {
        return (
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md animate-pulse">
                <div className="w-8 h-8 rounded-full bg-white/10" />
                <div className="w-24 h-4 bg-white/10 rounded" />
            </div>
        );
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer group"
                title={`${data.xpForNextLevel - data.xpForCurrentLevel} XP para o próximo nível`}
            >
                {/* Level Badge */}
                <div className="relative">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center font-black text-white text-xs shadow-lg shadow-orange-500/30"
                    >
                        {data.level}
                    </motion.div>

                    <AnimatePresence>
                        {showLevelUp && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="absolute -top-14 left-1/2 -translate-x-1/2 z-50"
                            >
                                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black text-xs px-3 py-2 rounded-xl shadow-2xl whitespace-nowrap flex items-center gap-1">
                                    <Trophy className="w-4 h-4" />
                                    Level Up!
                                </div>
                                <div className="w-2 h-2 bg-yellow-400 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* XP Progress */}
                <div className="flex flex-col w-28">
                    <div className="flex justify-between text-[10px] font-bold text-slate-300 mb-1">
                        <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400" />
                            LVL {data.level}
                        </span>
                        <span className="text-slate-400">{data.xpForCurrentLevel}/{data.xpForNextLevel}</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${data.progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-primary to-purple-500"
                        />
                    </div>
                </div>

                {/* Total XP (hover) */}
                <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    whileHover={{ opacity: 1, width: 'auto' }}
                    className="hidden group-hover:flex items-center gap-1 text-xs font-bold text-yellow-400 overflow-hidden"
                >
                    <TrendingUp className="w-3 h-3" />
                    {data.xp.toLocaleString()}
                </motion.div>
            </motion.div>
        </>
    );
}
