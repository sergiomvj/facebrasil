'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    // Guard para garantir que o callback só executa UMA vez
    const hasExecuted = useRef(false);

    useEffect(() => {
        // Evita dupla execução (Strict Mode, re-renders, etc.)
        if (hasExecuted.current) return;
        hasExecuted.current = true;

        const handleCallback = async () => {
            try {
                const code = searchParams.get('code');
                const next = searchParams.get('next') || '/pt/dashboard';
                const errorDesc = searchParams.get('error_description');

                if (errorDesc) {
                    throw new Error(errorDesc);
                }

                if (code) {
                    // Exchange the code for a session (PKCE flow)
                    const { error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) throw error;
                }

                // Verificar sessão resultante
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) throw sessionError;

                if (session) {
                    setStatus('success');
                    setTimeout(() => {
                        window.location.href = next;
                    }, 2000);
                } else {
                    throw new Error('Não foi possível estabelecer a sessão. O link pode ter expirado.');
                }

            } catch (error: any) {
                console.error('Auth Callback Error:', error);
                setStatus('error');
                setErrorMessage(error.message || 'Ocorreu um erro ao validar sua autenticação.');
            }
        };

        handleCallback();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Executa apenas 1x — searchParams é lido de forma estável via closure

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-8 text-center border border-gray-100 dark:border-slate-800">
                {status === 'loading' && (
                    <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                            <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Validando Acesso
                        </h1>
                        <p className="text-gray-500 dark:text-slate-400">
                            Por favor aguarde enquanto preparamos seu ambiente seguro...
                        </p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Acesso Confirmado!
                        </h1>
                        <p className="text-gray-500 dark:text-slate-400">
                            Sua conta foi verificada. Redirecionando para o painel...
                        </p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Falha na Validação
                        </h1>
                        <p className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/10 p-4 rounded-lg mb-6 w-full">
                            {errorMessage}
                        </p>
                        <button
                            onClick={() => window.location.href = '/pt/login'}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors w-full"
                        >
                            Ir para o Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
