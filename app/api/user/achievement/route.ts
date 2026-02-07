// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/user/achievement
 * 
 * Checks and awards eligible badges to user
 * 
 * Body: {} (uses authenticated user)
 */
export async function POST(request: NextRequest) {
    try {
        // Get authenticated user
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get current reputation
        const { data: oldReputation } = await supabase
            .from('user_reputation')
            .select('level, level_name, total_points')
            .eq('user_id', userId)
            .single();

        // Check and award badges
        const { data: badgeResults, error: badgeError } = await supabase
            .rpc('check_and_award_badges', { p_user_id: userId });

        if (badgeError) {
            console.error('Error checking badges:', badgeError);
            return NextResponse.json(
                { error: 'Failed to check achievements' },
                { status: 500 }
            );
        }

        // Get updated reputation
        const { data: newReputation } = await supabase
            .from('user_reputation')
            .select('level, level_name, total_points')
            .eq('user_id', userId)
            .single();

        // Check for level up
        const levelUp = oldReputation && newReputation &&
            oldReputation.level < newReputation.level ? {
            old_level: oldReputation.level,
            new_level: newReputation.level,
            new_level_name: newReputation.level_name
        } : null;

        interface BadgeAward {
            badge_id: string;
            newly_earned: boolean;
        }

        // Filter only newly earned badges
        const newBadges = (badgeResults as BadgeAward[])?.filter((b) => b.newly_earned) || [];

        // Get full badge details for new badges
        const newBadgeDetails = await Promise.all(
            newBadges.map(async (b) => {
                const { data: badge } = await supabase
                    .from('badges')
                    .select('name, description, icon, rarity')
                    .eq('id', b.badge_id)
                    .single();
                return badge;
            })
        );

        return NextResponse.json({
            new_badges: newBadgeDetails.filter(Boolean),
            level_up: levelUp,
            current_points: newReputation?.total_points || 0,
            current_level: newReputation?.level || 1,
            current_level_name: newReputation?.level_name || 'Leitor Casual'
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

