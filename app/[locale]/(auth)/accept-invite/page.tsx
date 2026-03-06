'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { Lock, Loader2, ArrowRight } from 'lucide-react';
import { LogoSVG } from '@/lib/constants';

export default function AcceptInvitePage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const router = useRouter();
    const params = useParams();
    const locale = (params?.locale as string) || 'pt';
    const supabase = createClient();

    // Verify session - Clicking the invite link logs the user in automatically via the URL hash
    useEffect(() => {
        let mounted = true;

        const checkSession = async () => {
            // First check if we already have a session
            const { data: { session }, error } = await supabase.auth.getSession();
            if (session && mounted) {
                setVerifying(false);
                return;
            }

            if (mounted) {
                // Wait a bit to see if the hash processes into a session, otherwise show error
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, newSession: any) => {
                    if (newSession && mounted) {
                        setVerifying(false);
                        subscription.unsubscribe();
                    }
                });

                // Timeout after 3 seconds if no session is established
                setTimeout(() => {
                    if (mounted) {
                        supabase.auth.getSession().then(({ data }: any) => {
                            if (!data.session) {
                                setError('O link do convite é inválido ou expirou. Por favor, peça um novo convite.');
                                setVerifying(false);
                            }
                        });
                    }
                }, 3000);
            }
        };

        checkSession();

        return () => { mounted = false; };
    }, [supabase.auth]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Update the user's password
            const { error } = await supabase.auth.updateUser({ password });

            if (error) throw error;

            setSuccess('Senha configurada com sucesso! Redirecionando...');

            // Give them a moment to see the success message
            setTimeout(() => {
                router.push(`/${locale}/dashboard`);
                router.refresh(); // Force refresh to update nav state
            }, 1500);

        } catch (err: any) {
            setError(err.message || 'Erro ao configurar a senha. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-white">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-white relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-6 border border-primary/20 animate-pulse">
                        <LogoSVG className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter mb-2">Bem-vindo(a) à equipe!</h1>
                    <p className="text-slate-400 text-lg">
                        Seu convite foi aceito. Por favor, defina uma senha para acessar sua conta.
                    </p>
                </div>

                <div className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-2xl shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Nova Senha</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    disabled={!!error && error.includes('expirou')}
                                    className="w-full bg-slate-800/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-slate-800/60 transition-all placeholder:text-slate-600 disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirmar Senha</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    disabled={!!error && error.includes('expirou')}
                                    className="w-full bg-slate-800/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-slate-800/60 transition-all placeholder:text-slate-600 disabled:opacity-50"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-start gap-3 animate-in fade-in duration-200">
                                <span className="mt-0.5">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm flex items-start gap-3 animate-in zoom-in-95 duration-300">
                                <div className="mt-0.5">✅</div>
                                <span>{success}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || (!!error && error.includes('expirou'))}
                            className="w-full bg-primary hover:bg-primary/90 text-slate-950 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    Salvar e Acessar
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
