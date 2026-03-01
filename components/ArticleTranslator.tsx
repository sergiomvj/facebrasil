"use client";

import { useEffect, useRef, useState } from 'react';
import { Languages } from 'lucide-react';

interface ArticleTranslatorProps {
    articleId?: string;
}

// Language options to show in our custom selector
const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'it', label: 'Italiano' },
    { code: 'ja', label: '日本語' },
    { code: 'zh-CN', label: '中文 (简体)' },
    { code: 'ar', label: 'العربية' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'pt', label: 'Português (original)' },
];

declare global {
    interface Window {
        google?: {
            translate: {
                TranslateElement: new (opts: object, el: string) => void;
            };
        };
        googleTranslateElementInit?: () => void;
    }
}

export default function ArticleTranslator({ articleId }: ArticleTranslatorProps) {
    const [selected, setSelected] = useState('');
    const [open, setOpen] = useState(false);
    const initialized = useRef(false);

    // Inject Google Translate script once
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        window.googleTranslateElementInit = () => {
            if (!window.google) return;
            new window.google.translate.TranslateElement(
                { pageLanguage: 'pt', includedLanguages: 'en,es,fr,de,it,ja,zh-CN,ar,hi', autoDisplay: false },
                'google_translate_element'
            );
        };

        const script = document.createElement('script');
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const handleSelect = (code: string) => {
        setSelected(code);
        setOpen(false);

        if (code === 'pt') {
            // Restore original: click the "Show original" button or reset cookie
            const restore = document.querySelector('.goog-te-banner-frame');
            if (restore) (restore as HTMLElement).style.display = 'none';
            document.cookie = 'googtrans=; path=/; expires=' + new Date(0).toUTCString();
            window.location.reload();
            return;
        }

        // Set Google Translate cookie and trigger translation
        document.cookie = `googtrans=/pt/${code}; path=/`;
        document.cookie = `googtrans=/pt/${code}; path=/; domain=.${window.location.hostname}`;

        // Find and trigger the select element that Google Translate injects
        const selectEl = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (selectEl) {
            selectEl.value = code;
            selectEl.dispatchEvent(new Event('change'));
        }

        // Dispatch custom event for ArticleReaderTracker to capture
        window.dispatchEvent(new CustomEvent('article-translated', { detail: { lang: code, articleId } }));
    };

    const selectedLabel = LANGUAGES.find(l => l.code === selected)?.label || 'Traduzir';

    return (
        <div className="relative inline-block">
            {/* Hidden Google Translate element */}
            <div id="google_translate_element" className="hidden" />

            {/* Custom Trigger Button */}
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all duration-200 text-sm font-medium"
                title="Traduzir artigo"
            >
                <Languages className="w-4 h-4" />
                <span>{selectedLabel}</span>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute left-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    {LANGUAGES.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => handleSelect(lang.code)}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-white/5 transition-colors
                                ${selected === lang.code ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-white/5' : 'text-slate-700 dark:text-slate-300'}
                            `}
                        >
                            {lang.label}
                            {lang.code === 'pt' && <span className="ml-2 text-xs text-slate-400">(original)</span>}
                        </button>
                    ))}
                </div>
            )}

            {/* Click outside to close */}
            {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
        </div>
    );
}
