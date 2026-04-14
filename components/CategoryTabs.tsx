"use client";

import React, { useState } from 'react';
import ArticleCard from './ArticleCard';
import { BlogPost } from '@/lib/fbr-types';
import { ChevronRight, LayoutGrid } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface CategoryTabsProps {
    initialData: {
        category: string;
        label: string;
        posts: BlogPost[];
        href: string;
    }[];
}

export default function CategoryTabs({ initialData }: CategoryTabsProps) {
    const [activeTab, setActiveTab] = useState(initialData[0]?.category);

    const activeContent = initialData.find(d => d.category === activeTab);

    return (
        <div className="space-y-8">
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
                {initialData.map((tab) => (
                    <button
                        key={tab.category}
                        onClick={() => setActiveTab(tab.category)}
                        className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 border ${
                            activeTab === tab.category
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105'
                            : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-white/5 text-slate-500 dark:hover:bg-slate-800 hover:border-primary/30'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-500">
                {activeContent?.posts.slice(0, 3).map((article) => (
                    <div key={article.id} className="flex flex-col gap-4">
                        <ArticleCard article={article} />
                    </div>
                ))}
            </div>

            <div className="flex justify-center mt-12">
                <Link href={activeContent?.href || '#'}>
                    <button className="flex items-center gap-2 px-8 py-3 rounded-full border dark:border-white/10 border-gray-300 dark:hover:bg-white/5 hover:bg-gray-100 dark:text-white text-gray-900 font-bold transition-all hover:scale-105 active:scale-95 text-xs uppercase tracking-widest group">
                        <LayoutGrid className="w-4 h-4 text-primary" />
                        Ver mais em {activeContent?.label}
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </Link>
            </div>
        </div>
    );
}
