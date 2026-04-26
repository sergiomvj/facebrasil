'use client';

import React, { useState, useTransition } from 'react';
import { Send, ShieldCheck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { createAdvertiseLead } from '@/app/actions/advertise-actions';

interface AdvertiseLeadFormProps {
    initialPackage?: string;
}

const PACKAGE_OPTIONS = ['A', 'B', 'C'] as const;

export default function AdvertiseLeadForm({ initialPackage = 'B' }: AdvertiseLeadFormProps) {
    const t = useTranslations('Advertise.form');
    const locale = useLocale();
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [formData, setFormData] = useState({
        packageCode: PACKAGE_OPTIONS.includes(initialPackage as any) ? initialPackage : 'B',
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        whatsapp: '',
        websiteUrl: '',
        industry: '',
        monthly_budget: '',
        notes: '',
    });

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData((current) => ({ ...current, [field]: value }));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setResult(null);

        startTransition(async () => {
            const response = await createAdvertiseLead({
                ...formData,
                locale,
            });

            if (!response.success || !response.id) {
                setResult({ type: 'error', message: response.error || t('submit') });
                return;
            }

            // Redirecionar para o Checkout do Stripe
            try {
                const checkoutResponse = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        packageCode: formData.packageCode,
                        leadId: response.id,
                        email: formData.email,
                    }),
                });

                const { url, error } = await checkoutResponse.json();

                if (error) {
                    setResult({ type: 'error', message: error });
                    return;
                }

                if (url) {
                    window.location.href = url;
                }
            } catch (err) {
                console.error('Checkout error:', err);
                setResult({ type: 'error', message: 'Erro ao iniciar pagamento. Tente novamente.' });
            }
        });
    };

    return (
        <section className="not-prose mt-12 rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/5 via-white to-blue-50 dark:from-primary/10 dark:via-slate-900 dark:to-slate-950 p-6 md:p-8 shadow-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
                <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {t('eyebrow')}
                    </span>
                    <h2 className="mt-4 text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                        {t('title')}
                    </h2>
                    <p className="mt-2 text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl">
                        {t('subtitle')}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="md:col-span-2">
                    <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{t('package')}</span>
                    <div className="grid grid-cols-3 gap-3">
                        {PACKAGE_OPTIONS.map((pkg) => {
                            const isSelected = formData.packageCode === pkg;
                            return (
                                <button
                                    key={pkg}
                                    type="button"
                                    onClick={() => handleChange('packageCode', pkg)}
                                    className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                                        isSelected
                                            ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                                            : 'border-gray-200 bg-white text-gray-900 hover:border-primary/30 dark:border-white/10 dark:bg-slate-950 dark:text-white'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="text-xs font-black uppercase tracking-[0.2em]">{t(`package${pkg}`)}</div>
                                        <div className={`text-[10px] font-bold ${isSelected ? 'text-white/90' : 'text-primary'}`}>
                                            {pkg === 'A' ? '$200' : pkg === 'B' ? '$500' : '$1000'}
                                        </div>
                                    </div>
                                    <div className={`mt-1 text-[11px] leading-tight ${isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {t(`package${pkg}Desc`)}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </label>

                <label>
                    <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{t('companyName')}</span>
                    <input
                        required
                        value={formData.companyName}
                        onChange={(e) => handleChange('companyName', e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary/40 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                    />
                </label>

                <label>
                    <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{t('contactName')}</span>
                    <input
                        required
                        value={formData.contactName}
                        onChange={(e) => handleChange('contactName', e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary/40 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                    />
                </label>

                <label>
                    <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{t('email')}</span>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary/40 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                    />
                </label>

                <label>
                    <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{t('phone')}</span>
                    <input
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary/40 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                    />
                </label>

                <label>
                    <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{t('whatsapp')}</span>
                    <input
                        value={formData.whatsapp}
                        onChange={(e) => handleChange('whatsapp', e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary/40 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                    />
                </label>

                <label>
                    <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{t('websiteUrl')}</span>
                    <input
                        type="url"
                        value={formData.websiteUrl}
                        onChange={(e) => handleChange('websiteUrl', e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary/40 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                    />
                </label>

                <label>
                    <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{t('industry')}</span>
                    <input
                        value={formData.industry}
                        onChange={(e) => handleChange('industry', e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary/40 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                    />
                </label>

                <label className="md:col-span-2">
                    <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{t('monthlyBudget')}</span>
                    <input
                        value={formData.monthly_budget}
                        onChange={(e) => handleChange('monthly_budget', e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary/40 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                    />
                </label>

                <label className="md:col-span-2">
                    <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{t('notes')}</span>
                    <textarea
                        rows={5}
                        value={formData.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary/40 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                    />
                </label>

                <div className="md:col-span-2 flex flex-col gap-4 pt-2">
                    {result && (
                        <div
                            className={`rounded-2xl border px-4 py-3 text-sm ${
                                result.type === 'success'
                                    ? 'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300'
                                    : 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300'
                            }`}
                        >
                            {result.message}
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {t('footnote')}
                        </p>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Send className="w-4 h-4" />
                            {isPending ? t('submitting') : t('submit')}
                        </button>
                    </div>
                </div>
            </form>
        </section>
    );
}
