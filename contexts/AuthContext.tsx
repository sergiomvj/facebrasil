'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    profile: any | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    signOut: async () => { },
    refreshProfile: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const fetchingProfileRef = useRef(false);

    const fetchProfile = async (uid: string) => {
        if (fetchingProfileRef.current) return;
        fetchingProfileRef.current = true;
        try {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
            if (!error && data) {
                setProfile(data);
            }
        } catch (err) {
            console.error('[AuthContext] Error fetching profile:', err);
        } finally {
            fetchingProfileRef.current = false;
        }
    };

    const refreshProfile = async () => {
        if (user) await fetchProfile(user.id);
    };

    // Effect #1: Busca a sessão inicial UMA ÚNICA VEZ via getUser() (seguro, valida no servidor)
    // e configura o listener de auth state. O callback do listener é SÍNCRONO para
    // evitar o loop documentado pela Supabase:
    // https://supabase.com/docs/reference/javascript/auth-onauthstatechange
    useEffect(() => {
        let mounted = true;

        // Inicialização: usar getUser() em vez de getSession()
        // getSession() retorna dados do storage local sem validação e pode disparar refreshes.
        const initialize = async () => {
            try {
                const { data: { user: currentUser }, error } = await supabase.auth.getUser();
                if (error) {
                    // Usuário não autenticado ou token inválido — estado normal
                    if (mounted) setLoading(false);
                    return;
                }
                if (mounted) {
                    setUser(currentUser);
                    // A sessão será atualizada pelo onAuthStateChange abaixo
                }
            } catch (err) {
                console.error('[AuthContext] Error during initialization:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        // CRÍTICO: O callback deve ser SÍNCRONO.
        // Colocar async/await aqui cria um loop porque operações de DB (fetchProfile)
        // podem disparar novamente o onAuthStateChange.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, currentSession: Session | null) => {
            if (!mounted) return;

            const currentUser = currentSession?.user ?? null;
            setSession(currentSession);
            setUser(currentUser);

            if (event === 'SIGNED_OUT') {
                setProfile(null);
            }

            setLoading(false);
        });

        initialize();

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Effect #2: Busca o perfil SEPARADAMENTE quando o user muda.
    // Isso garante que a busca de perfil NÃO acontece dentro do listener de auth,
    // quebrando o ciclo de feedback.
    useEffect(() => {
        if (user?.id) {
            fetchProfile(user.id);
        } else if (!user) {
            setProfile(null);
        }
    }, [user?.id]);

    const signOut = async () => {
        await supabase.auth.signOut();
        setProfile(null);
        setSession(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, profile, session, loading, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
