'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/app/actions/profile-actions';
import { User as UserIcon, Camera, Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { user, profile, refreshProfile } = useAuth();
    const router = useRouter();
    const [name, setName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            setAvatarUrl(profile.avatar_url || '');
        } else if (user) {
            setName(user.user_metadata?.full_name || '');
            setAvatarUrl(user.user_metadata?.avatar_url || '');
        }
    }, [profile, user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setMessage(null);

        try {
            const result = await updateProfile(user.id, {
                name,
                avatar_url: avatarUrl
            });

            if (result.success) {
                setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
                await refreshProfile();
            } else {
                setMessage({ type: 'error', text: 'Erro ao atualizar perfil. Tente novamente.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Ocorreu um erro inesperado.' });
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-slate-400 font-medium italic">Redirecionando...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-primary selection:text-white">
            <Navbar />

            <main className="pt-32 pb-20 px-6 max-w-[800px] mx-auto">

                <Link href="/pt/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-8 font-bold text-sm group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Voltar ao Dashboard
                </Link>

                <div className="bg-slate-900/50 rounded-3xl border border-white/5 p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>

                    <h1 className="text-4xl font-black mb-8 italic uppercase tracking-tighter">Configurações de Perfil</h1>

                    <form onSubmit={handleSave} className="space-y-8 relative">

                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-6 pb-8 border-b border-white/5">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full bg-slate-800 border-2 border-primary/30 overflow-hidden flex items-center justify-center ring-4 ring-primary/5">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-16 h-16 text-primary/20" />
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <div className="w-full max-w-sm">
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">URL da Imagem de Perfil</label>
                                <input
                                    type="text"
                                    value={avatarUrl}
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                    placeholder="https://exemplo.com/sua-foto.jpg"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Name Section */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Nome Completo</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-base focus:border-primary focus:outline-none transition-all font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">E-mail (Não editável)</label>
                                <input
                                    type="email"
                                    value={user.email || ''}
                                    disabled
                                    className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-primary hover:bg-primary/90 disabled:bg-slate-800 disabled:text-slate-500 py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/20 active:scale-[0.98]"
                        >
                            {saving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Salvar Alterações
                                </>
                            )}
                        </button>

                    </form>
                </div>

            </main>
        </div>
    );
}
