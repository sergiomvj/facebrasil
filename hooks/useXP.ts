import { useCallback } from 'react';

export function useXP() {
    const grantXP = useCallback(async (type: 'READ_ARTICLE' | 'DAILY_LOGIN' | 'SHARE' | 'VIEW_AD' | 'CLICK_AD', distinctId?: string) => {
        try {
            // 1. Call API
            const res = await fetch('/api/gamification/xp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, distinctId }),
            });

            const data = await res.json();

            if (data.success && data.points) {
                // 2. Update Local State (Mock for HUD immediate feedback)
                const current = parseInt(localStorage.getItem('user_xp') || '0');
                localStorage.setItem('user_xp', (current + data.points).toString());

                // 3. Dispatch Event for HUD
                window.dispatchEvent(new Event('xp_gained'));

                return data.points;
            }
            return 0;
        } catch (error) {
            console.error('Failed to grant XP', error);
            return 0;
        }
    }, []);

    return { grantXP };
}
