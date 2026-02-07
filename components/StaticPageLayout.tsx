import React from 'react';
import { LogoSVG } from '@/lib/constants';

interface StaticPageLayoutProps {
    title: string;
    category: string;
    content: React.ReactNode;
    featuredImage?: string;
    updatedAt?: string;
}

const StaticPageLayout: React.FC<StaticPageLayoutProps> = ({
    title,
    category,
    content,
    featuredImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=2000',
    updatedAt = new Date().toLocaleDateString()
}) => {
    return (
        <article className="min-h-screen pb-20 dark:bg-slate-950 bg-white">
            {/* Page Header / Hero - Article Style */}
            <div className="relative h-[50vh] w-full">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${featuredImage}')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-[1000px] mx-auto">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6 border border-primary/30 backdrop-blur-md">
                        {category}
                    </span>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                        {title}
                    </h1>

                    <div className="flex items-center gap-4 text-slate-300">
                        <div className="flex items-center gap-3">
                            <div className="size-8 text-primary">
                                <LogoSVG />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Equipe Facebrasil</p>
                                <p className="text-xs text-slate-400">Institucional</p>
                            </div>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                        <span className="text-sm">Última atualização: {updatedAt}</span>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-[800px] mx-auto px-6 -mt-10 relative z-10">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 dark:border-white/5 prose prose-lg dark:prose-invert max-w-none">
                    {content}
                </div>
            </div>
        </article>
    );
};

export default StaticPageLayout;
