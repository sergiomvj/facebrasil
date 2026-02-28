'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
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

    const fetchProfile = async (uid: string) => {
        try {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
            if (!error && data) {
                setProfile(data);
            }
        } catch (err) {
            console.error('[AuthContext] Error fetching profile:', err);
        }
    };

    const refreshProfile = async () => {
        if (user) await fetchProfile(user.id);
    };

    useEffect(() => {
        let mounted = true;

        const setData = async () => {
            try {
                const { data: { session: currentSession }, error } = await supabase.auth.getSession();
                if (error) throw error;

                if (mounted) {
                    setSession(currentSession);
                    const currentUser = currentSession?.user ?? null;
                    setUser(currentUser);
                    if (currentUser) {
                        await fetchProfile(currentUser.id);
                    }
                    setLoading(false);
                }
            } catch (err) {
                console.error('[AuthContext] Error in setData:', err);
                if (mounted) setLoading(false);
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, currentSession: Session | null) => {
            if (!mounted) return;

            // Only update if the user ID changed or explicitly signed out
            if (currentSession?.user?.id !== user?.id || event === 'SIGNED_OUT') {
                setSession(currentSession);
                const currentUser = currentSession?.user ?? null;
                setUser(currentUser);
                if (currentUser) {
                    await fetchProfile(currentUser.id);
                } else {
                    setProfile(null);
                }
            }
            setLoading(false);
        });

        setData();

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []); // No dependencies to ensure single setup

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
