'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, CheckCircle2, Facebook, Instagram, Twitter, Eye, EyeOff, ExternalLink, AlertTriangle, Shield } from 'lucide-react';
import Link from 'next/link';

interface CredentialField {
    key: string;
    label: string;
    placeholder: string;
    help?: string;
    sensitive?: boolean;
}

const PLATFORMS = [
    {
        id: 'facebook',
        label: 'Facebook',
        icon: Facebook,
        color: 'blue',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        iconColor: 'text-blue-400',
        docsUrl: 'https://developers.facebook.com/docs/pages/getting-started',
        how: 'Crie um App em developers.facebook.com → Adicione o produto "Pages API" → Gere um Page Access Token com permissões pages_manage_posts.',
        fields: [
            { key: 'page_id', label: 'Page ID', placeholder: '123456789012345', help: 'ID numérico da sua Page do Facebook', sensitive: false },
            { key: 'page_access_token', label: 'Page Access Token', placeholder: 'EAABsbCS...', help: 'Token de longa duração (60 dias) da sua Page', sensitive: true },
        ] as CredentialField[],
    },
    {
        id: 'instagram',
        label: 'Instagram',
        icon: Instagram,
        color: 'pink',
        bg: 'bg-pink-500/10',
        border: 'border-pink-500/20',
        iconColor: 'text-pink-400',
        docsUrl: 'https://developers.facebook.com/docs/instagram-api/getting-started',
        how: 'Conta Instagram Business ligada a uma Facebook Page → developers.facebook.com → App com permissão instagram_content_publish → copie o IG Account ID.',
        fields: [
            { key: 'ig_account_id', label: 'Instagram Business Account ID', placeholder: '17841401234567890', help: 'ID da conta business/creator', sensitive: false },
            { key: 'access_token', label: 'Access Token', placeholder: 'EAABsbCS...', help: 'Mesmo long-lived token da Facebook Page ligada', sensitive: true },
        ] as CredentialField[],
    },
    {
        id: 'twitter',
        label: 'X / Twitter',
        icon: Twitter,
        color: 'slate',
        bg: 'bg-slate-700/30',
        border: 'border-slate-600/30',
        iconColor: 'text-slate-300',
        docsUrl: 'https://developer.x.com/en/portal/dashboard',
        how: 'Acesse developer.x.com → Crie um Project e App → Active "Read and Write" permissions → Generate Access Token & Secret.',
        fields: [
            { key: 'api_key', label: 'API Key', placeholder: 'xvz1evFS...', sensitive: true },
            { key: 'api_secret', label: 'API Key Secret', placeholder: 'L8qq9PZy...', sensitive: true },
            { key: 'access_token', label: 'Access Token', placeholder: '777788880-eYeh...', sensitive: true },
            { key: 'access_token_secret', label: 'Access Token Secret', placeholder: 'ExtwKKst...', sensitive: true },
        ] as CredentialField[],
    },
];

export default function SocialCredentialsPage() {
    const params = useParams();
    const locale = params.locale as string;

    const [credentials, setCredentials] = useState<Record<string, Record<string, string>>>({});
    const [loading, setLoading] = useState(true);
    const [savingPlatform, setSavingPlatform] = useState<string | null>(null);
    const [savedPlatforms, setSavedPlatforms] = useState<Set<string>>(new Set());
    const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set());

    useEffect(() => {
        const load = async () => {
            const res = await fetch('/api/waterfall/social-credentials');
            const json = await res.json();
            if (json.success) {
                const map: Record<string, Record<string, string>> = {};
                for (const item of json.credentials) {
                    map[item.platform] = item.credentials;
                }
                setCredentials(map);
            }
            setLoading(false);
        };
        load();
    }, []);

    const handleChange = (platform: string, key: string, value: string) => {
        setCredentials(prev => ({
            ...prev,
            [platform]: { ...(prev[platform] || {}), [key]: value },
        }));
    };

    const handleSave = async (platform: string) => {
        setSavingPlatform(platform);
        try {
            const res = await fetch('/api/waterfall/social-credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ platform, credentials: credentials[platform] || {} }),
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.error);
            setSavedPlatforms(prev => new Set([...prev, platform]));
            setTimeout(() => setSavedPlatforms(prev => { const s = new Set(prev); s.delete(platform); return s; }), 3000);
        } catch (err: any) {
            alert('Erro ao salvar: ' + err.message);
        } finally {
            setSavingPlatform(null);
        }
    };

    const toggleVisible = (key: string) => {
        setVisibleFields(prev => {
            const s = new Set(prev);
            s.has(key) ? s.delete(key) : s.add(key);
            return s;
        });
    };

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto">
            <Link
                href={`/${locale}/admin/articles`}
                className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest mb-6 transition-colors"
            >
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar aos Artigos
            </Link>

            <div className="flex items-start gap-4 mb-8">
                <div className="p-3 bg-slate-800 rounded-2xl border border-white/10">
                    <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-1">
                        Contas das Redes Sociais
                    </h1>
                    <p className="text-slate-400 text-sm">Configure as credenciais para publicar diretamente do Waterfall</p>
                </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-8 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-amber-400 font-black text-sm mb-1">Tokens ficam criptografados no banco</p>
                    <p className="text-amber-400/70 text-xs">Nunca compartilhe seus tokens de acesso. Eles são armazenados criptografados e só acessíveis por usuários autenticados.</p>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-slate-900 border border-white/5 rounded-2xl p-6 animate-pulse h-48" />
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    {PLATFORMS.map(platform => {
                        const Icon = platform.icon;
                        const isSaving = savingPlatform === platform.id;
                        const isSaved = savedPlatforms.has(platform.id);
                        const creds = credentials[platform.id] || {};
                        const isConfigured = platform.fields.every(f => !f.sensitive || !!creds[f.key]);

                        return (
                            <div key={platform.id} className={`bg-slate-900 border ${platform.border} rounded-2xl overflow-hidden`}>
                                {/* Header */}
                                <div className={`p-5 border-b border-white/5 flex items-center justify-between ${platform.bg}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 ${platform.bg} rounded-xl border ${platform.border}`}>
                                            <Icon className={`w-5 h-5 ${platform.iconColor}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-white text-sm uppercase tracking-tighter">{platform.label}</h3>
                                            <p className={`text-[9px] font-mono ${isConfigured ? 'text-green-400' : 'text-slate-500'}`}>
                                                {isConfigured ? '✓ Credenciais configuradas' : '⚠ Não configurado'}
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href={platform.docsUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
                                    >
                                        Docs <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>

                                {/* How-to */}
                                <div className="px-5 pt-4 pb-2">
                                    <p className="text-[10px] text-slate-500 italic leading-relaxed">{platform.how}</p>
                                </div>

                                {/* Fields */}
                                <div className="p-5 space-y-4">
                                    {platform.fields.map(field => {
                                        const fieldKey = `${platform.id}.${field.key}`;
                                        const isVisible = visibleFields.has(fieldKey);
                                        return (
                                            <div key={field.key} className="space-y-1.5">
                                                <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">
                                                    {field.label}
                                                    {field.help && <span className="text-slate-600 font-normal normal-case ml-2">— {field.help}</span>}
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={field.sensitive && !isVisible ? 'password' : 'text'}
                                                        value={creds[field.key] || ''}
                                                        onChange={e => handleChange(platform.id, field.key, e.target.value)}
                                                        placeholder={field.placeholder}
                                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-700 focus:ring-1 focus:ring-white/20 outline-none transition-all font-mono pr-10"
                                                    />
                                                    {field.sensitive && (
                                                        <button
                                                            onClick={() => toggleVisible(fieldKey)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                                                        >
                                                            {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={() => handleSave(platform.id)}
                                            disabled={isSaving}
                                            className={`flex items-center gap-2 px-6 py-2.5 font-black uppercase tracking-widest text-xs rounded-xl transition-all ${isSaved
                                                ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                                                : 'bg-white text-slate-950 hover:bg-slate-100 shadow-lg'
                                                } disabled:opacity-60`}
                                        >
                                            {isSaving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando...</>
                                                : isSaved ? <><CheckCircle2 className="w-3.5 h-3.5" /> Salvo!</>
                                                    : <><Save className="w-3.5 h-3.5" /> Salvar</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
