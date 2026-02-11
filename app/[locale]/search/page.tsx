import React, { Suspense } from 'react';
import SearchResultsComponent from '@/components/SearchResults';

import { getTranslations } from 'next-intl/server';

export default async function SearchPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Search' });

    return (
        <div className="min-h-screen pt-32 pb-20 dark:bg-slate-950 bg-white">
            <div className="max-w-[1280px] mx-auto px-6">
                <h1 className="text-4xl font-black tracking-tighter dark:text-white text-gray-900 mb-12">
                    {t('title')}
                </h1>

                <Suspense fallback={<div className="animate-pulse text-slate-500">{t('loading')}</div>}>
                    <SearchResultsComponent />
                </Suspense>
            </div>
        </div>
    );
}
