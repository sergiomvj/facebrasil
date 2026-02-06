import React from 'react';
import { Newspaper, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import ArticleCard from './ArticleCard';
import { BlogPost } from '@/lib/fbr-types';

interface FBRNewsSectionProps {
    posts: BlogPost[];
}

export default function FBRNewsSection({ posts }: FBRNewsSectionProps) {
    if (posts.length === 0) return null;

    return (
        <section className="bg-slate-900 py-24 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-white/10 pb-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest">
                                <span className="size-1.5 bg-primary rounded-full animate-pulse"></span>
                                Live Now
                            </div>
                            <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Automated Insights</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter flex items-center gap-4">
                            <Zap className="w-10 h-10 text-primary fill-primary/20" />
                            FBR NEWS
                        </h2>
                    </div>

                    <Link
                        href="/fbr-news"
                        className="mt-6 md:mt-0 group flex items-center gap-2 text-primary font-bold hover:text-white transition-colors"
                    >
                        Ver Portal Completo
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {posts.slice(0, 4).map((post) => (
                        <div key={post.id} className="relative group">
                            <ArticleCard article={post} />
                            {post.source_type === 'automated' && (
                                <div className="absolute top-4 right-4 z-20">
                                    <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 px-2 py-1 rounded-md flex items-center gap-1.5 shadow-xl">
                                        <div className="size-1.5 bg-accent-yellow rounded-full shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>
                                        <span className="text-[9px] font-black text-white uppercase tracking-tighter">AI Analysis</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
