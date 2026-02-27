'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
    Trophy, Gift, Star, Target, Zap, ArrowRight,
    Coins, Rocket, ChevronRight, Lock, Sparkles,
    BookOpen, Share2, MessageSquare, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { convertPointsToFacets } from '@/app/actions/gamification-actions';

interface Challenge {
    id: string;
    title: string;
    description: string;
    points_reward: number;
    facets_reward: number;
    icon: string;
    type: string;
    target_value: number;
}

interface UserProgress {
    challenge_id: string;
    current_progress: number;
    status: 'ongoing' | 'completed';
}

export default function GamificationLandingPage() {
    const { user, profile } = useAuth();
    const [stats, setStats] = useState({ total_points: 0, facets_balance: 0, level: 1, level_name: 'Leitor Casual' });
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});
    const [loading, setLoading] = useState(true);
    const [converting, setConverting] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // parallel fetch
                const [
                    { data: challengesData },
                    { data: reputationData }
                ] = await Promise.all([
                    supabase.from('challenges').select('*').eq('is_active', true),
                    user ? supabase.from('user_reputation').select('*').eq('user_id', user.id).single() : Promise.resolve({ data: null })
                ]);

                if (challengesData) setChallenges(challengesData);
                if (reputationData) setStats(reputationData);

                if (user) {
                    const { data: progressData } = await supabase
                        .from('user_challenges')
                        .select('*')
                        .eq('user_id', user.id);

                    if (progressData) {
                        const progressMap = progressData.reduce((acc: any, curr: any) => {
                            acc[curr.challenge_id] = curr;
                            return acc;
                        }, {});
                        setUserProgress(progressMap);
                    }
                }
            } catch (error) {
                console.error('Error fetching gamification data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [user]);

    const handleConvert = async (amount: number) => {
        if (!user) return;
        setConverting(true);
        try {
            const result = await convertPointsToFacets(user.id, amount);
            if (result.success) {
                setStats(prev => ({
                    ...prev,
                    total_points: result.newPoints,
                    facets_balance: result.newFacets
                }));
                alert('Conversão realizada com sucesso!');
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setConverting(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-primary selection:text-white overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-yellow/5 rounded-full blur-[120px]"></div>
            </div>

            <Navbar />

            <main className="pt-32 pb-20 px-6 max-w-[1280px] mx-auto relative z-10">

                {/* Hero Section */}
                <section className="text-center mb-20">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-primary mb-6"
                    >
                        <Sparkles className="w-4 h-4" />
                        O próximo nível do portal Facebrasil
                    </motion.div>
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mb-8 bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent leading-[0.9]"
                    >
                        Facebrasil <br /> <span className="text-primary">Legends</span>
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed"
                    >
                        Transforme sua leitura em recompensas reais. Ganhe pontos, suba de nível e troque por Facetas ($FC) para usar com nossos parceiros.
                    </motion.p>
                </section>

                {/* Main Bento Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                >
                    {/* User Stats Card */}
                    <motion.div variants={itemVariants} className="md:col-span-2 bg-slate-900/50 rounded-[2.5rem] border border-white/5 p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>

                        <div className="flex flex-col md:flex-row justify-between h-full gap-8 relative">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Seu Progresso</p>
                                    <h2 className="text-4xl font-black italic uppercase tracking-tighter">{stats.level_name}</h2>
                                    <p className="text-slate-400 text-sm font-bold">Nível {stats.level} • Próximo nível em 150 XP</p>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <div className="bg-slate-950 p-6 rounded-3xl border border-white/5 flex-1 min-w-[140px]">
                                        <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] mb-2">
                                            <Star className="w-3 h-3 fill-current" /> Pontos (XP)
                                        </div>
                                        <div className="text-3xl font-black font-mono tracking-tighter">{stats.total_points.toLocaleString()}</div>
                                    </div>
                                    <div className="bg-slate-950 p-6 rounded-3xl border border-white/5 flex-1 min-w-[140px]">
                                        <div className="flex items-center gap-2 text-accent-yellow font-black uppercase text-[10px] mb-2">
                                            <Coins className="w-3 h-3 fill-current" /> Facetas ($FC)
                                        </div>
                                        <div className="text-3xl font-black font-mono tracking-tighter">{Number(stats.facets_balance).toFixed(2)}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-end">
                                <button
                                    onClick={() => handleConvert(Math.min(stats.total_points, 1000))}
                                    disabled={stats.total_points < 1000 || converting}
                                    className="px-8 py-5 rounded-[1.5rem] bg-white text-slate-950 font-black uppercase text-sm flex items-center gap-3 shadow-xl hover:scale-[1.05] active:scale-[0.95] transition-all disabled:opacity-50 disabled:grayscale"
                                >
                                    {converting ? 'Processando...' : 'Converter 1000 pts em 1 $FC'}
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                                <p className="text-[10px] text-slate-500 text-center mt-3 font-bold uppercase tracking-widest">Taxa de conversão dinâmica</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Action Card */}
                    <motion.div variants={itemVariants} className="bg-primary rounded-[2.5rem] p-8 text-slate-950 flex flex-col justify-between group cursor-pointer hover:shadow-2xl hover:shadow-primary/30 transition-all">
                        <div>
                            <Rocket className="w-12 h-12 mb-6" />
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-4">Missão <br /> Diária</h3>
                            <p className="font-bold text-sm leading-tight opacity-80">Complete as tarefas de hoje e ganhe multiplicadores de XP.</p>
                        </div>
                        <div className="flex items-center justify-between font-black uppercase text-xs tracking-widest mt-8">
                            <span>Ver Agora</span>
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </motion.div>

                    {/* Challenges List Card (Scrollable) */}
                    <motion.div variants={itemVariants} className="md:col-span-3 bg-slate-900/30 rounded-[2.5rem] border border-white/5 p-10">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                                    <Trophy className="text-accent-yellow" />
                                    Desafios Ativos
                                </h3>
                                <p className="text-slate-500 text-sm font-medium">Complete objetivos para ganhar recompensas exclusivas.</p>
                            </div>
                            <div className="hidden md:flex gap-2">
                                <div className="px-4 py-2 rounded-full bg-white/5 text-[10px] font-black uppercase tracking-widest border border-white/10">Todos</div>
                                <div className="px-4 py-2 rounded-full bg-white/5 text-[10px] font-black uppercase tracking-widest border border-white/10 opacity-40">Especiais</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {challenges.map((challenge) => {
                                const progress = userProgress[challenge.id]?.current_progress || 0;
                                const isCompleted = userProgress[challenge.id]?.status === 'completed';
                                const percent = Math.min((progress / challenge.target_value) * 100, 100);

                                return (
                                    <div key={challenge.id} className="bg-slate-950/50 p-6 rounded-[2rem] border border-white/5 group hover:border-primary/30 transition-all relative overflow-hidden">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-primary/20 transition-colors">
                                                {challenge.type === 'reading' ? <BookOpen className="w-6 h-6 text-primary" /> :
                                                    challenge.type === 'sharing' ? <Share2 className="w-6 h-6 text-primary" /> :
                                                        <MessageSquare className="w-6 h-6 text-primary" />}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-black uppercase text-slate-500 mb-1">Prêmio</div>
                                                <div className="flex items-center gap-1 font-black text-primary italic">
                                                    +{challenge.points_reward} <Star className="w-3 h-3 fill-current" />
                                                </div>
                                            </div>
                                        </div>

                                        <h4 className="text-xl font-black uppercase italic tracking-tighter mb-2 truncate">{challenge.title}</h4>
                                        <p className="text-xs text-slate-500 font-bold mb-6 line-clamp-2 h-8">{challenge.description}</p>

                                        <div className="space-y-3">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-slate-400">Progresso</span>
                                                <span className="text-white">{progress}/{challenge.target_value}</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percent}%` }}
                                                    className="h-full bg-primary shadow-[0_0_15px_rgba(234,20,53,0.5)]"
                                                />
                                            </div>
                                        </div>

                                        {isCompleted && (
                                            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                                                <div className="size-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                                                    <Trophy className="w-8 h-8 text-green-500" />
                                                </div>
                                                <p className="text-white font-black uppercase italic text-lg mb-1">Completado!</p>
                                                <p className="text-green-500 text-[10px] font-black uppercase">Recompensas Reivindicadas</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </motion.div>

                {/* Footer Engagement */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[3rem] p-12 text-center border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-primary/5 rounded-full blur-[120px] -mt-32"></div>
                    <Gift className="w-16 h-16 text-primary mx-auto mb-8 animate-bounce" />
                    <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-6">Em Breve Marketplace</h2>
                    <p className="text-slate-400 max-w-xl mx-auto mb-10 font-bold">
                        Estamos fechando parcerias exclusivas onde você poderá usar suas Facetas ($FC) para benefícios em restaurantes, serviços de imigração, lazer e muito mais nos EUA.
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <div className="px-8 py-4 bg-white/5 rounded-2xl border border-white/10 grayscale opacity-40 flex items-center gap-3">
                            <Lock className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest">Cupom de Desconto</span>
                        </div>
                        <div className="px-8 py-4 bg-white/5 rounded-2xl border border-white/10 grayscale opacity-40 flex items-center gap-3">
                            <Lock className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest">Ingresso VIP</span>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}
