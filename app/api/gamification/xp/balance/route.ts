// @ts-nocheck
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-server';

import { supabase } from '@/lib/supabase';

// GET /api/gamification/xp/balance
// Retorna o XP total, nível atual e progresso do usuário

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Buscar todos os logs de XP do usuário
        const { data: xpLogs, error: logsError } = await supabase
            .from('xp_logs')
            .select('points')
            .eq('user_id', userId);

        if (logsError) {
            console.error('[XP Balance] Error fetching logs:', logsError);
            return NextResponse.json({ error: 'Failed to fetch XP' }, { status: 500 });
        }

        // Calcular XP total
        const totalXP = xpLogs?.reduce((sum, log) => sum + (log.points || 0), 0) || 0;

        // Calcular nível (cada nível requer 100 XP a mais que o anterior)
        // Nível 1: 0-99 XP
        // Nível 2: 100-299 XP (100 + 200)
        // Nível 3: 300-599 XP (100 + 200 + 300)
        // Fórmula: Nível = floor((sqrt(8 * XP / 100 + 1) - 1) / 2) + 1

        let level = 1;
        let xpForCurrentLevel = 0;
        let xpForNextLevel = 100;

        if (totalXP >= 100) {
            // Sistema progressivo: cada nível precisa de (nível * 100) XP
            let remainingXP = totalXP;
            let levelXP = 100; // XP necessário para nível 2

            while (remainingXP >= levelXP) {
                remainingXP -= levelXP;
                level++;
                levelXP = level * 100;
            }

            xpForCurrentLevel = remainingXP;
            xpForNextLevel = levelXP;
        } else {
            xpForCurrentLevel = totalXP;
            xpForNextLevel = 100;
        }

        const progress = Math.min(100, Math.round((xpForCurrentLevel / xpForNextLevel) * 100));

        // Buscar medalhas/badges
        const { data: userBadges, error: badgesError } = await supabase
            .from('user_badges')
            .select('badge_id, earned_at')
            .eq('user_id', userId)
            .order('earned_at', { ascending: false })
            .limit(5);

        if (badgesError) {
            console.error('[XP Balance] Error fetching badges:', badgesError);
        }

        return NextResponse.json({
            success: true,
            xp: totalXP,
            level,
            xpForCurrentLevel,
            xpForNextLevel,
            progress,
            badges: userBadges || [],
            recentActivity: xpLogs?.slice(-5).reverse() || []
        });


    } catch (error) {
        console.error('[XP Balance] API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
