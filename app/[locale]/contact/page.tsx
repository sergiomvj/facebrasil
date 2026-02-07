import React from 'react';
import StaticPageLayout from '@/components/StaticPageLayout';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import CMSStaticPage from '@/components/CMSStaticPage';
import { getTranslations } from 'next-intl/server';

export default async function ContactPage({ params }: { params: { locale: string } }) {
    const { locale } = await params;
    const t = await getTranslations('Contact');

    const cmsContent = await CMSStaticPage({ slug: 'contact', locale });
    if (cmsContent) return cmsContent;

    return (
        <StaticPageLayout
            title={t('title')}
            category={t('category')}
            featuredImage="https://images.unsplash.com/photo-1523966211575-51a9ed083b1c?auto=format&fit=crop&q=80&w=2000"
            content={
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 not-prose">
                    <div className="space-y-8">
                        <p className="text-slate-500 font-medium">
                            {t('description')}
                        </p>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Mail className="size-5" />
                                </div>
                                <span className="text-slate-600 dark:text-slate-300">contato@facebrasil.com</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Phone className="size-5" />
                                </div>
                                <span className="text-slate-600 dark:text-slate-300">+1 (407) 000-0000</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <MapPin className="size-5" />
                                </div>
                                <span className="text-slate-600 dark:text-slate-300">Orlando, FL - USA</span>
                            </div>
                        </div>
                    </div>

                    <form className="space-y-4 pt-4 border-t lg:border-t-0 lg:border-l lg:pl-12 border-gray-100 dark:border-white/5">
                        <input
                            type="text"
                            placeholder={t('form.name')}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                            type="email"
                            placeholder={t('form.email')}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <textarea
                            rows={4}
                            placeholder={t('form.message')}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button className="w-full py-4 bg-primary text-slate-900 font-black rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest text-sm hover:scale-[1.02] transition-transform">
                            {t('form.submit')} <Send className="size-4" />
                        </button>
                    </form>
                </div>
            }
        />
    );
}
