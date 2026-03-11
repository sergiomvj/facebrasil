'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useXP } from '@/hooks/useXP';

export function DailyActivityTriggers() {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const isSignedIn = !!user;
    const isLoaded = !loading;
    const { gainXP } = useXP();
    const triggeredRef = useRef(false);

    useEffect(() => {
        // Não disparar em páginas de admin
        if (pathname.includes('/admin')) return;
        if (!isLoaded || !isSignedIn || triggeredRef.current) return;

        const triggerDailyLogin = async () => {
            const today = new Date().toISOString().split('T')[0];
            try {
                const result = await gainXP('DAILY_LOGIN', today);
                if (result.success || result.skipped) {
                    triggeredRef.current = true;
                }
            } catch (error) {
                console.error('[DailyActivityTriggers] Failed to trigger daily login:', error);
            }
        };

        triggerDailyLogin();
    }, [isLoaded, isSignedIn, gainXP, pathname]);

    return null;
}
