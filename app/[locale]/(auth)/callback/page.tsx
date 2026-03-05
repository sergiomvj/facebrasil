'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const locale = (params?.locale as string) || 'pt';
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const hasExecuted = useRef(false);

    useEffect(() => {
        if (hasExecuted.current) return;
        hasExecuted.current = true;

        const handleCallback = async () => {
            try {
                const code = searchParams.get('code');
                const next = searchParams.get('next') || `/${locale}/dashboard`;
                const errorDesc = searchParams.get('error_description');

                if (errorDesc) {
                    throw new Error(decodeURIComponent(errorDesc));
                }

                if (code) {
                    const supabase = createClient();
                    const { error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) throw error;
                }

                setStatus('success');
                // Usar window.location para forçar recarga completa e ativar o middleware
                setTimeout(() => {
                    window.location.href = next;
                }, 1500);

            } catch (error: any) {
                console.error('Auth Callback Error:', error);
                setStatus('error');
                setErrorMessage(error.message || 'Ocorreu um erro ao validar sua autenticação.');
            }
        };

        handleCallback();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 shadow-xl rounded-2xl p-8 text-center border border-white/10">
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Validando Acesso</h1>
                        <p className="text-slate-400">Por favor aguarde...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Acesso Confirmado!</h1>
                        <p className="text-slate-400">Redirecionando para o painel...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                            <AlertCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Falha na Validação</h1>
                        <p className="text-red-400 text-sm bg-red-500/10 p-4 rounded-lg mb-6 w-full">
                            {errorMessage}
                        </p>
                        <button
                            onClick={() => window.location.href = `/${locale}/login`}
                            className="bg-primary hover:bg-primary/90 text-slate-950 font-bold py-2 px-6 rounded-lg transition-colors w-full"
                        >
                            Ir para o Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
