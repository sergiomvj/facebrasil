// @ts-nocheck
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// GET /api/gamification/badges
// Retorna todas as medalhas disponíveis e as do usuário

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Buscar todas as medalhas disponíveis
        const { data: allBadges, error: badgesError } = await supabase
            .from('badges')
            .select('*')
            .eq('active', true)
            .order('order_priority', { ascending: true });

        if (badgesError) {
            console.error('[Badges] Error:', badgesError);
            return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 });
        }

        // Buscar medalhas do usuário
        const { data: userBadges, error: userError } = await supabase
            .from('user_badges')
            .select('badge_id, earned_at')
            .eq('user_id', userId);

        if (userError) {
            console.error('[Badges] User error:', userError);
        }

        const earnedIds = new Set(userBadges?.map(ub => ub.badge_id) || []);

        // Marcar quais medalhas o usuário já tem
        const badgesWithStatus = allBadges?.map(badge => ({
            ...badge,
            earned: earnedIds.has(badge.id),
            earned_at: userBadges?.find(ub => ub.badge_id === badge.id)?.earned_at
        })) || [];

        // Calcular estatísticas
        const earnedCount = earnedIds.size;
        const totalCount = allBadges?.length || 0;
        const completionPercentage = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

        return NextResponse.json({
            success: true,
            badges: badgesWithStatus,
            stats: {
                earned: earnedCount,
                total: totalCount,
                percentage: completionPercentage
            }
        });

    } catch (error) {
        console.error('[Badges] API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
