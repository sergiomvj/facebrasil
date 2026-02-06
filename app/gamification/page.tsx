'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Trophy, Gift, ShoppingBag, Lock, Crown, Star } from 'lucide-react';
import { useXP } from '@/hooks/useXP';

export default function GamificationPage() {
    const [activeTab, setActiveTab] = useState<'leaderboard' | 'store'>('leaderboard');
    const userXP = 4500; // Mock

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-primary selection:text-white">
            <Navbar />

            <main className="pt-24 pb-20 px-6 max-w-[1280px] mx-auto">

                {/* Header */}
                <section className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-yellow to-primary mb-4">
                        Facebrasil Legends
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        Compete with other readers, complete missions, and earn exclusive rewards.
                    </p>
                </section>

                {/* Tab Logic */}
                <div className="flex justify-center mb-10">
                    <div className="bg-slate-900/50 p-1 rounded-full border border-white/10 flex">
                        <button
                            onClick={() => setActiveTab('leaderboard')}
                            className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'leaderboard' ? 'bg-primary text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Leaderboard
                        </button>
                        <button
                            onClick={() => setActiveTab('store')}
                            className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'store' ? 'bg-accent-yellow text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Reward Store
                        </button>
                    </div>
                </div>

                {activeTab === 'leaderboard' && (
                    <div className="max-w-[800px] mx-auto animate-in fade-in slide-in-from-bottom-4">

                        {/* Top 3 Podium */}
                        <div className="flex items-end justify-center gap-4 mb-12">
                            {/* 2nd Place */}
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 rounded-full border-4 border-slate-400 bg-slate-800 mb-2 relative">
                                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-400 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">#2</span>
                                </div>
                                <p className="font-bold">Maria S.</p>
                                <p className="text-xs text-primary font-bold">8,400 XP</p>
                                <div className="h-32 w-24 bg-gradient-to-t from-slate-800 to-slate-800/20 rounded-t-lg mt-2"></div>
                            </div>

                            {/* 1st Place */}
                            <div className="flex flex-col items-center">
                                <Crown className="text-accent-yellow w-8 h-8 mb-2 animate-bounce" />
                                <div className="w-24 h-24 rounded-full border-4 border-accent-yellow bg-slate-800 mb-2 relative shadow-[0_0_30px_rgba(255,215,0,0.3)]">
                                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-accent-yellow text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">#1</span>
                                </div>
                                <p className="font-bold text-xl">Carlos B.</p>
                                <p className="text-sm text-primary font-bold">12,500 XP</p>
                                <div className="h-40 w-28 bg-gradient-to-t from-accent-yellow/20 to-accent-yellow/5 rounded-t-lg mt-2 border-t border-accent-yellow/50"></div>
                            </div>

                            {/* 3rd Place */}
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 rounded-full border-4 border-amber-700 bg-slate-800 mb-2 relative">
                                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-700 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">#3</span>
                                </div>
                                <p className="font-bold">João P.</p>
                                <p className="text-xs text-primary font-bold">7,200 XP</p>
                                <div className="h-24 w-24 bg-gradient-to-t from-slate-800 to-slate-800/20 rounded-t-lg mt-2"></div>
                            </div>
                        </div>

                        {/* List */}
                        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                            {[4, 5, 6, 7, 8, 9, 10].map((rank) => (
                                <div key={rank} className="flex items-center p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <span className="w-8 text-center font-bold text-slate-500">#{rank}</span>
                                    <div className="w-10 h-10 rounded-full bg-slate-800 mx-4"></div>
                                    <div className="flex-1">
                                        <p className="font-bold">User {rank}</p>
                                        <p className="text-xs text-slate-500">Level {12 - rank}</p>
                                    </div>
                                    <div className="font-mono font-bold text-primary">
                                        {(8000 - rank * 500).toLocaleString()} XP
                                    </div>
                                </div>
                            ))}
                            {/* Your Rank */}
                            <div className="bg-primary/10 border-t border-primary/20 p-4 flex items-center">
                                <span className="w-8 text-center font-bold text-primary">#42</span>
                                <div className="w-10 h-10 rounded-full bg-slate-800 mx-4 border border-primary"></div>
                                <div className="flex-1">
                                    <p className="font-bold text-white">You</p>
                                </div>
                                <div className="font-mono font-bold text-primary">
                                    {userXP.toLocaleString()} XP
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {activeTab === 'store' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 group hover:border-accent-yellow/50 transition-colors relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-accent-yellow text-slate-900 text-[10px] font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
                            <div className="h-40 bg-slate-950 rounded-xl mb-6 flex items-center justify-center">
                                <ShoppingBag className="w-16 h-16 text-slate-700 group-hover:text-accent-yellow transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Waitrose Voucher</h3>
                            <p className="text-slate-400 text-sm mb-4">$50 OFF for your next groceries. Valid in Florida stores.</p>
                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-primary font-black text-lg">5,000 XP</span>
                                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors">Redeem</button>
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 group hover:border-primary/50 transition-colors relative overflow-hidden grayscale opacity-70">
                            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center backdrop-blur-[2px]">
                                <Lock className="w-12 h-12 text-white/50" />
                            </div>
                            <div className="h-40 bg-slate-950 rounded-xl mb-6 flex items-center justify-center">
                                <Gift className="w-16 h-16 text-slate-700" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">VIP Event Ticket</h3>
                            <p className="text-slate-400 text-sm mb-4">Access to the Brazilian Day VIP Lounge.</p>
                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-primary font-black text-lg">15,000 XP</span>
                                <button className="px-4 py-2 bg-white/5 rounded-lg text-sm font-bold cursor-not-allowed">Locked</button>
                            </div>
                        </div>

                        {/* Add more items */}
                    </div>
                )}

            </main>
        </div>
    );
}
