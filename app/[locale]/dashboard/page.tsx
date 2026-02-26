'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Heart, Trophy, Clock, Star, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const { user, loading } = useAuth();

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

    // Redirect or show alternative if not signed in (controlled by middleware usually, but good to have)
    if (!user) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Redirecionando...</div>;

    const initials = user.email?.substring(0, 2).toUpperCase() || 'U';
    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-primary selection:text-white">
            <Navbar />

            <main className="pt-24 pb-20 px-6 max-w-[1280px] mx-auto">

                {/* User Profile Header */}
                <section className="mb-12 flex flex-col md:flex-row items-center gap-8 bg-slate-900/50 p-8 rounded-2xl border border-white/5">
                    <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-primary overflow-hidden flex items-center justify-center">
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-12 h-12 text-primary/40" />
                        )}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-black mb-2">{displayName}</h1>
                        <p className="text-slate-400">Member since {user?.created_at ? new Date(user.created_at).getFullYear() : '2025'}</p>

                        <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-accent-yellow border border-accent-yellow/20">
                                <Trophy className="w-3 h-3" />
                                <span>Level 5 Explorer</span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-primary border border-primary/20">
                                <Star className="w-3 h-3" />
                                <span>1,250 Facetas</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content Area (History & Favorites) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Tabs (Mock) */}
                        <div className="border-b border-white/10 flex gap-6">
                            <button className="pb-4 border-b-2 border-primary text-white font-bold text-sm">Recently Read</button>
                            <button className="pb-4 border-b-2 border-transparent text-slate-400 hover:text-white font-medium text-sm transition-colors">Favorites</button>
                            <button className="pb-4 border-b-2 border-transparent text-slate-400 hover:text-white font-medium text-sm transition-colors">Collections</button>
                        </div>

                        {/* Content List */}
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-900/30 border border-white/5 hover:bg-slate-900/50 transition-colors group">
                                    <div className="w-24 h-24 rounded-lg bg-slate-800 shrink-0"></div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-[10px] text-primary uppercase font-bold mb-1">
                                            <Clock className="w-3 h-3" />
                                            <span>2 hours ago</span>
                                        </div>
                                        <h3 className="text-lg font-bold leading-tight mb-2 group-hover:text-primary transition-colors">How Brazilian Entrepreneurs are Changing Florida&apos;s Economy</h3>
                                        <p className="text-sm text-slate-400 line-clamp-1">A deep dive into the statistics of immigrant-led businesses...</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>

                    {/* Sidebar (Gamification & Stats) */}
                    <div className="space-y-6">

                        {/* Weekly Challenge */}
                        <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900 p-6 rounded-2xl border border-indigo-500/20">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-400" />
                                Weekly Challenge
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-300">Read 5 Business Articles</span>
                                        <span className="text-indigo-400 font-bold">3/5</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 w-[60%]"></div>
                                    </div>
                                </div>
                                <button className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors">
                                    View All Challenges
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                            <h3 className="font-bold text-white mb-4">Your Stats</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-950 p-3 rounded-lg text-center">
                                    <div className="text-2xl font-black text-white">42</div>
                                    <div className="text-xs text-slate-500">Articles Read</div>
                                </div>
                                <div className="bg-slate-950 p-3 rounded-lg text-center">
                                    <div className="text-2xl font-black text-white">12</div>
                                    <div className="text-xs text-slate-500">Hours Reading</div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

            </main>
        </div>
    );
}
