// @ts-nocheck
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// GET /api/gamification/achievements
// Retorna todas as conquistas disponíveis e as do usuário

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Buscar todas as conquistas disponíveis
        const { data: allAchievements, error: achievementsError } = await supabase
            .from('achievements')
            .select('*')
            .order('points', { ascending: false });

        if (achievementsError) {
            console.error('[Achievements] Error:', achievementsError);
            return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
        }

        // Buscar conquistas do usuário
        const { data: userAchievements, error: userError } = await supabase
            .from('user_achievements')
            .select('achievement_id, earned_at')
            .eq('user_id', userId);

        if (userError) {
            console.error('[Achievements] User error:', userError);
        }

        const earnedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);

        // Marcar quais conquistas o usuário já tem
        const achievementsWithStatus = allAchievements?.map(achievement => ({
            ...achievement,
            earned: earnedIds.has(achievement.id),
            earned_at: userAchievements?.find(ua => ua.achievement_id === achievement.id)?.earned_at
        })) || [];

        // Calcular estatísticas
        const totalPoints = allAchievements?.reduce((sum, a) => sum + (earnedIds.has(a.id) ? a.points : 0), 0) || 0;
        const earnedCount = earnedIds.size;
        const totalCount = allAchievements?.length || 0;
        const completionPercentage = Math.round((earnedCount / totalCount) * 100);

        return NextResponse.json({
            success: true,
            achievements: achievementsWithStatus,
            stats: {
                earned: earnedCount,
                total: totalCount,
                percentage: completionPercentage,
                points: totalPoints
            }
        });

    } catch (error) {
        console.error('[Achievements] API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
