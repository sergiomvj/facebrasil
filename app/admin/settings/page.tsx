'use client';

import React, { useState } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        siteName: 'Facebrasil',
        siteDescription: 'Notícias da comunidade brasileira',
        instagramUrl: 'https://instagram.com/facebrasil',
        facebookUrl: 'https://facebook.com/facebrasil',
        twitterUrl: 'https://twitter.com/facebrasil',
        googleAnalyticsId: '',
        metaPixelId: '',
        newsletterProvider: 'mailchimp',
        newsletterApiKey: '',
    });

    const handleSave = () => {
        // TODO: Save to database
        alert('Configurações salvas com sucesso!');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black dark:text-white text-gray-900 mb-2">Configurações</h1>
                    <p className="dark:text-slate-400 text-gray-600">Gerencie as configurações do site</p>
                </div>

                <button
                    onClick={handleSave}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-primary/20"
                >
                    <Save className="w-5 h-5" />
                    Salvar Alterações
                </button>
            </div>

            {/* General Settings */}
            <div className="dark:bg-slate-900 bg-white rounded-xl p-6 border dark:border-white/10 border-gray-200 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b dark:border-white/10 border-gray-200">
                    <SettingsIcon className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-black dark:text-white text-gray-900">Configurações Gerais</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium dark:text-slate-300 text-gray-700 mb-2">
                            Nome do Site
                        </label>
                        <input
                            type="text"
                            value={settings.siteName}
                            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium dark:text-slate-300 text-gray-700 mb-2">
                            Descrição do Site
                        </label>
                        <input
                            type="text"
                            value={settings.siteDescription}
                            onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
            </div>

            {/* Social Media */}
            <div className="dark:bg-slate-900 bg-white rounded-xl p-6 border dark:border-white/10 border-gray-200 space-y-6">
                <h2 className="text-xl font-black dark:text-white text-gray-900">Redes Sociais</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium dark:text-slate-300 text-gray-700 mb-2">
                            Instagram URL
                        </label>
                        <input
                            type="url"
                            value={settings.instagramUrl}
                            onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium dark:text-slate-300 text-gray-700 mb-2">
                            Facebook URL
                        </label>
                        <input
                            type="url"
                            value={settings.facebookUrl}
                            onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium dark:text-slate-300 text-gray-700 mb-2">
                            Twitter URL
                        </label>
                        <input
                            type="url"
                            value={settings.twitterUrl}
                            onChange={(e) => setSettings({ ...settings, twitterUrl: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
            </div>

            {/* Analytics */}
            <div className="dark:bg-slate-900 bg-white rounded-xl p-6 border dark:border-white/10 border-gray-200 space-y-6">
                <h2 className="text-xl font-black dark:text-white text-gray-900">Analytics</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium dark:text-slate-300 text-gray-700 mb-2">
                            Google Analytics ID
                        </label>
                        <input
                            type="text"
                            value={settings.googleAnalyticsId}
                            onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                            placeholder="G-XXXXXXXXXX"
                            className="w-full px-4 py-3 rounded-lg dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium dark:text-slate-300 text-gray-700 mb-2">
                            Meta Pixel ID
                        </label>
                        <input
                            type="text"
                            value={settings.metaPixelId}
                            onChange={(e) => setSettings({ ...settings, metaPixelId: e.target.value })}
                            placeholder="XXXXXXXXXXXXXXX"
                            className="w-full px-4 py-3 rounded-lg dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
            </div>

            {/* Newsletter */}
            <div className="dark:bg-slate-900 bg-white rounded-xl p-6 border dark:border-white/10 border-gray-200 space-y-6">
                <h2 className="text-xl font-black dark:text-white text-gray-900">Newsletter</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium dark:text-slate-300 text-gray-700 mb-2">
                            Provedor
                        </label>
                        <select
                            value={settings.newsletterProvider}
                            onChange={(e) => setSettings({ ...settings, newsletterProvider: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="mailchimp">Mailchimp</option>
                            <option value="sendgrid">SendGrid</option>
                            <option value="convertkit">ConvertKit</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium dark:text-slate-300 text-gray-700 mb-2">
                            API Key
                        </label>
                        <input
                            type="password"
                            value={settings.newsletterApiKey}
                            onChange={(e) => setSettings({ ...settings, newsletterApiKey: e.target.value })}
                            placeholder="••••••••••••••••"
                            className="w-full px-4 py-3 rounded-lg dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
