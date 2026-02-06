import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/leaderboard
 * 
 * Returns leaderboard rankings
 * 
 * Query Params:
 * - period: 'weekly' | 'monthly' | 'all-time' (default: 'weekly')
 * - limit: number (default: 100, max: 100)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const period = searchParams.get('period') || 'weekly';
        const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100);

        // Get authenticated user (optional)
        const { userId } = await auth();

        let leaderboardData;
        let currentUserRank = null;

        if (period === 'weekly') {
            // Use materialized view for weekly
            const { data, error } = await supabase
                .from('leaderboard_weekly')
                .select('*')
                .limit(limit);

            if (error) {
                console.error('Error fetching weekly leaderboard:', error);
                return NextResponse.json(
                    { error: 'Failed to fetch leaderboard' },
                    { status: 500 }
                );
            }

            leaderboardData = data;

            // Find current user rank
            if (userId) {
                const userEntry = data?.find((entry: any) => entry.user_id === userId);
                currentUserRank = userEntry?.rank || null;
            }

        } else {
            // Build query for monthly or all-time
            const pointsField = period === 'monthly' ? 'monthly_points' : 'total_points';

            const { data, error } = await supabase
                .from('user_reputation')
                .select('user_id, total_points, weekly_points, monthly_points, level, level_name, badges, articles_read, comments_made, shares_made')
                .gt(pointsField, 0)
                .order(pointsField, { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error fetching leaderboard:', error);
                return NextResponse.json(
                    { error: 'Failed to fetch leaderboard' },
                    { status: 500 }
                );
            }

            // Add rank
            leaderboardData = data?.map((entry, index) => ({
                ...entry,
                rank: index + 1,
                points: entry[pointsField as keyof typeof entry]
            }));

            // Find current user rank
            if (userId) {
                const userIndex = data?.findIndex((entry: any) => entry.user_id === userId);
                currentUserRank = userIndex !== -1 ? userIndex + 1 : null;
            }
        }

        // Get user profiles (names and avatars) from Clerk
        // Note: In production, you'd batch fetch from Clerk API or cache in profiles table
        const enrichedLeaderboard = leaderboardData?.map((entry: any) => ({
            rank: entry.rank,
            user_id: entry.user_id,
            points: entry.points || entry.weekly_points || entry.total_points,
            level: entry.level,
            level_name: entry.level_name,
            badges: entry.badges || [],
            stats: {
                articles_read: entry.articles_read || 0,
                comments_made: entry.comments_made || 0,
                shares_made: entry.shares_made || 0
            }
        }));

        return NextResponse.json({
            period,
            leaderboard: enrichedLeaderboard || [],
            current_user_rank: currentUserRank,
            total_users: enrichedLeaderboard?.length || 0,
            updated_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
