import React from 'react';
import StaticPageLayout from '@/components/StaticPageLayout';
import AdvertiseLeadForm from '@/components/AdvertiseLeadForm';
import { fetchStaticPageBySlug } from '@/lib/static-pages-service';
import { getTranslations } from 'next-intl/server';

interface AdvertisePageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ package?: string }>;
}

export default async function AdvertisePage({ params, searchParams }: AdvertisePageProps) {
    const { locale } = await params;
    const resolvedSearchParams = await searchParams;
    const t = await getTranslations('Advertise');
    const cmsContent = await fetchStaticPageBySlug('advertise', locale);
    const selectedPackage = (resolvedSearchParams.package || 'B').toUpperCase();

    return (
        <StaticPageLayout
            title={cmsContent?.title || t('title')}
            category={t('category')}
            featuredImage={cmsContent?.featured_image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2000'}
            updatedAt={cmsContent?.updated_at ? new Date(cmsContent.updated_at).toLocaleDateString() : undefined}
            content={
                <>
                    {cmsContent ? (
                        <div dangerouslySetInnerHTML={{ __html: cmsContent.content }} />
                    ) : (
                        <>
                            <p>
                                {t('description')}
                            </p>
                            <h2>{t('channels.title')}</h2>
                            <div className="space-y-4 not-prose my-10">
                                <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5 shadow-sm">
                                    <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black shadow-inner">P</div>
                                    <div>
                                        <h4 className="font-bold">{t('channels.print.title')}</h4>
                                        <p className="text-xs text-slate-500 text-pretty">{t('channels.print.description')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5 shadow-sm">
                                    <div className="size-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-black shadow-inner">D</div>
                                    <div>
                                        <h4 className="font-bold">{t('channels.digital.title')}</h4>
                                        <p className="text-xs text-slate-500 text-pretty">{t('channels.digital.description')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5 shadow-sm">
                                    <div className="size-12 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500 font-black shadow-inner">S</div>
                                    <div>
                                        <h4 className="font-bold">{t('channels.social.title')}</h4>
                                        <p className="text-xs text-slate-500 text-pretty">{t('channels.social.description')}</p>
                                    </div>
                                </div>
                            </div>
                            <p className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border-white/5 border text-sm font-medium leading-relaxed italic text-slate-500">
                                {t('mediakit')}
                            </p>
                        </>
                    )}

                    <AdvertiseLeadForm initialPackage={selectedPackage} />
                </>
            }
        />
    );
}
