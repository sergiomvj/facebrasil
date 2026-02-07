'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname, routing } from '@/i18n/routing';
import { useState } from 'react';
import { Globe, Check } from 'lucide-react';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'pt', name: 'Português', flag: '🇧🇷' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Español', flag: '🇪🇸' }
    ];

    const handleLocaleChange = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
        setIsOpen(false);
    };

    return (
        <div className="relative group">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-xs font-bold border border-gray-200 dark:border-white/10"
            >
                <Globe className="w-4 h-4 text-primary" />
                <span className="uppercase">{locale}</span>
                <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLocaleChange(lang.code)}
                                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${locale === lang.code ? 'text-primary' : 'text-slate-600 dark:text-slate-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg leading-none">{lang.flag}</span>
                                    <span>{lang.name}</span>
                                </div>
                                {locale === lang.code && <Check className="w-3.5 h-3.5" />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
