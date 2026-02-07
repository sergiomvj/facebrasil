// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/user/reaction
 * 
 * Registers user gamification action
 * 
 * Body:
 * {
 *   article_id: string (UUID),
 *   action: 'read_complete' | 'comment' | 'share' | 'like' | 'bookmark',
 *   metadata: object (optional)
 * }
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

        const body = await request.json();
        const { article_id, action, metadata = {} } = body;

        // Validate required fields
        if (!article_id || !action) {
            return NextResponse.json(
                { error: 'Missing required fields: article_id, action' },
                { status: 400 }
            );
        }

        // Validate action type
        const validActions = ['read_complete', 'comment', 'share', 'like', 'bookmark', 'fact_check', 'topic_suggest'];
        if (!validActions.includes(action)) {
            return NextResponse.json(
                { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
                { status: 400 }
            );
        }

        // Calculate points based on action
        const pointsMap: Record<string, number> = {
            read_complete: 10,
            comment: 20,
            share: 15,
            fact_check: 50,
            topic_suggest: 30,
            like: 5,
            bookmark: 5
        };

        const pointsEarned = pointsMap[action] || 0;

        // Check if user already performed this action on this article (prevent duplicates)
        if (['read_complete', 'like', 'bookmark'].includes(action)) {
            const { data: existingActivity } = await supabase
                .from('user_activities')
                .select('id')
                .eq('user_id', userId)
                .eq('article_id', article_id)
                .eq('activity_type', action)
                .single();

            if (existingActivity) {
                return NextResponse.json({
                    success: true,
                    points_earned: 0,
                    message: 'Action already recorded'
                });
            }
        }

        // Insert activity (trigger will auto-update reputation)
        const { error: activityError } = await supabase
            .from('user_activities')
            .insert({
                user_id: userId,
                article_id,
                activity_type: action,
                points_earned: pointsEarned,
                validated: !['comment', 'fact_check'].includes(action), // Auto-validate non-moderated actions
                metadata
            });

        if (activityError) {
            console.error('Error inserting activity:', activityError);
            return NextResponse.json(
                { error: 'Failed to record activity' },
                { status: 500 }
            );
        }

        // Get updated reputation
        const { data: reputation } = await supabase
            .from('user_reputation')
            .select('total_points, level, level_name')
            .eq('user_id', userId)
            .single();

        // Check for new badges
        const { data: newBadges } = await supabase
            .rpc('check_and_award_badges', { p_user_id: userId });

        return NextResponse.json({
            success: true,
            points_earned: pointsEarned,
            new_total: reputation?.total_points || 0,
            level: reputation?.level || 1,
            level_name: reputation?.level_name || 'Leitor Casual',
            new_badges: newBadges || []
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

