"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import { Check, ArrowRight, Info, Star, Zap, Shield, Mail } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

export default function PricingSection() {
    const t = useTranslations('Advertise.packages');
    const locale = useLocale();
    const [isPolicyOpen, setIsPolicyOpen] = useState(false);

    const packages = [
        {
            id: 'A',
            name: t('packageA'),
            icon: <Zap className="w-6 h-6 text-blue-400" />,
            ads: t('adsA'),
            features: [
                t('totalAds'),
                t('visibility'),
                t('reportsBasic'),
                t('supportEmail')
            ],
            color: 'from-blue-600 to-blue-400',
            popular: false
        },
        {
            id: 'B',
            name: t('packageB'),
            icon: <Star className="w-6 h-6 text-amber-500" />,
            ads: t('adsB'),
            features: [
                t('totalAds'),
                "Maior destaque visual",
                t('reportsDetailed'),
                t('supportPriority')
            ],
            color: 'from-amber-600 to-amber-400',
            popular: true
        },
        {
            id: 'C',
            name: t('packageC'),
            icon: <Shield className="w-6 h-6 text-emerald-500" />,
            ads: t('adsC'),
            features: [
                t('totalAds'),
                "Máxima visibilidade",
                t('reportsPremium'),
                t('accountManager')
            ],
            color: 'from-emerald-600 to-emerald-400',
            popular: false
        }
    ];

    return (
        <section id="pacotes-anuncios" className="py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-950/50">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2"></div>

            <div className="max-w-[1280px] mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-4">
                        {t('bonus')}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black dark:text-white text-gray-900 tracking-tighter mb-6">
                        {t('title')}
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {packages.map((pkg) => (
                        <div 
                            key={pkg.id} 
                            className={`relative group p-8 rounded-3xl border transition-all duration-500 hover:scale-[1.02] ${
                                pkg.popular 
                                ? 'bg-white dark:bg-slate-900 border-primary shadow-2xl shadow-primary/10' 
                                : 'bg-white/50 dark:bg-slate-900/30 border-gray-200 dark:border-white/5 hover:border-primary/30'
                            }`}
                        >
                            {pkg.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase px-4 py-1 rounded-full shadow-lg">
                                    Mais Popular
                                </div>
                            )}

                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${pkg.color} flex items-center justify-center mb-6 shadow-lg`}>
                                {pkg.icon}
                            </div>

                            <h3 className="text-2xl font-black dark:text-white text-gray-900 mb-2">{pkg.name}</h3>
                            <div className="flex items-center gap-2 mb-8">
                                <span className="text-primary font-bold">{pkg.ads}</span>
                                <span className="text-xs text-slate-400 capitalize">+ 60 BÔNUS</span>
                            </div>

                            <div className="space-y-4 mb-10">
                                {pkg.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className="mt-1 size-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <Check className="w-2.5 h-2.5 text-primary" />
                                        </div>
                                        <span className="text-sm dark:text-slate-400 text-gray-600">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Link
                                href={`/${locale}/advertise`}
                                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                                    pkg.popular
                                    ? 'bg-primary text-white hover:bg-primary-dark shadow-xl shadow-primary/20'
                                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
                                }`}
                            >
                                {t('choosePackage')}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="max-w-4xl mx-auto">
                    <button 
                        onClick={() => setIsPolicyOpen(!isPolicyOpen)}
                        className="w-full p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Info className="w-5 h-5" />
                            </div>
                            <span className="font-bold dark:text-white text-gray-900 group-hover:text-primary transition-colors">
                                {t('commercialPolicy')}
                            </span>
                        </div>
                        <ArrowRight className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isPolicyOpen ? 'rotate-90' : ''}`} />
                    </button>

                    {isPolicyOpen && (
                        <div className="mt-4 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 animate-in slide-in-from-top-4 duration-300">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <h4 className="flex items-center gap-2 text-primary">
                                    <Shield className="w-4 h-4" />
                                    Termos e Condições da Bonificação
                                </h4>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-slate-500 dark:text-slate-400">
                                    <li>• Período de validade: Primeiros 30 dias de lançamento</li>
                                    <li>• Bonificação: 100% de anúncios extras (compre 60, ganhe +60)</li>
                                    <li>• Validade dos anúncios: 90 dias a partir da ativação</li>
                                    <li>• Não cumulativo: Válido apenas na primeira compra</li>
                                    <li>• Uso fracionado ao longo do período contratado</li>
                                    <li>• Suporte prioritário via email e painel do anunciante</li>
                                </ul>

                                <div className="mt-8 p-6 rounded-xl bg-primary/5 border border-primary/10">
                                    <h4 className="flex items-center gap-2 text-primary mb-2">
                                        <Mail className="w-4 h-4" />
                                        Próximos Passos
                                    </h4>
                                    <p className="text-xs text-slate-500">
                                        Após a confirmação do pagamento, você receberá suas credenciais de acesso ao Painel do Anunciante onde poderá criar, editar e monitorar o desempenho de suas campanhas em tempo real.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
