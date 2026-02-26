'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useXP } from '@/hooks/useXP';

export function DailyActivityTriggers() {
    const { isSignedIn, isLoaded } = useUser();
    const { gainXP } = useXP();
    const triggeredRef = useRef(false);

    useEffect(() => {
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
    }, [isLoaded, isSignedIn, gainXP]);

    return null;
}
