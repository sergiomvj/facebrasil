import React, { Suspense } from 'react';
import SearchResults from '../../components/SearchResults';

export default function SearchPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 dark:bg-slate-950 bg-white">
            <div className="max-w-[1280px] mx-auto px-6">
                <h1 className="text-4xl font-black tracking-tighter dark:text-white text-gray-900 mb-12">
                    RESULTADOS DA BUSCA
                </h1>

                <Suspense fallback={<div className="animate-pulse text-slate-500">Buscando artigos...</div>}>
                    <SearchResults />
                </Suspense>
            </div>
        </div>
    );
}
