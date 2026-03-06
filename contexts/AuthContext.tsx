'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
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

    // Use an AbortController-style token to cancel stale profile fetches
    const profileFetchIdRef = useRef(0);

    const fetchProfile = useCallback(async (uid: string) => {
        // Increment the fetch ID; if another fetch starts before this one finishes,
        // the stale result is discarded.
        const fetchId = ++profileFetchIdRef.current;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', uid)
                .single();

            // Discard result if a newer fetch has started
            if (fetchId !== profileFetchIdRef.current) return;

            if (error) {
                if (error.code !== 'PGRST116') {
                    // PGRST116 = row not found; anything else is unexpected
                    console.error('[AuthContext] Error fetching profile:', error.message);
                }
                return;
            }

            if (data) setProfile(data);
        } catch (err) {
            console.error('[AuthContext] Unexpected error fetching profile:', err);
        }
    }, []);

    const refreshProfile = useCallback(async () => {
        if (user?.id) await fetchProfile(user.id);
    }, [user?.id, fetchProfile]);

    useEffect(() => {
        let mounted = true;

        // Get the initial session once, server-validated
        const initialize = async () => {
            try {
                const { data: { user: currentUser }, error } = await supabase.auth.getUser();

                // Auth errors here are normal (no session, expired token, etc.)
                // onAuthStateChange already fired and set the correct state, so we only
                // update user if getUser() confirms a valid session.
                if (!error && currentUser && mounted) {
                    setUser(currentUser);
                }
            } catch (err) {
                // Network failure – onAuthStateChange INITIAL_SESSION already ran so
                // user state is already set from local storage. Don't overwrite it.
                console.error('[AuthContext] getUser() network error:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        // CRITICAL: callback must be synchronous.
        // Async operations (like fetchProfile) inside the callback create feedback loops
        // per the Supabase docs: https://supabase.com/docs/reference/javascript/auth-onauthstatechange
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event: string, currentSession: Session | null) => {
                if (!mounted) return;

                const currentUser = currentSession?.user ?? null;
                setSession(currentSession);
                setUser(currentUser);

                if (event === 'SIGNED_OUT') {
                    setProfile(null);
                    profileFetchIdRef.current++; // cancel any in-flight profile fetch
                }

                setLoading(false);
            }
        );

        initialize();

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Fetch profile whenever the authenticated user changes (separate effect to avoid
    // async calls inside onAuthStateChange which would cause feedback loops).
    useEffect(() => {
        if (user?.id) {
            fetchProfile(user.id);
        } else if (!user) {
            setProfile(null);
        }
    }, [user?.id, fetchProfile]);

    const signOut = async () => {
        profileFetchIdRef.current++; // cancel any in-flight profile fetch
        setProfile(null);
        setSession(null);
        setUser(null);
        await supabase.auth.signOut();
    };

    // Intercept Supabase Auth Hash (Invite/Recovery) that land on the wrong page
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hash = window.location.hash;
            if (hash && hash.includes('access_token=')) {
                const currentPath = window.location.pathname;
                const localeMatch = currentPath.match(/^\/(pt|en|es)/);
                const locale = localeMatch ? localeMatch[1] : 'pt';

                if (hash.includes('type=invite') && !currentPath.includes('accept-invite')) {
                    window.location.href = `/${locale}/accept-invite${hash}`;
                } else if (hash.includes('type=recovery') && !currentPath.includes('reset-password')) {
                    window.location.href = `/${locale}/reset-password${hash}`;
                }
            }
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, profile, session, loading, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
