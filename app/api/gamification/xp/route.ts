import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { type, distinctId } = await req.json();

        // Basic validation
        if (!type) {
            return NextResponse.json({ error: 'Missing XP type' }, { status: 400 });
        }

        // Define XP points based on type
        let points = 0;
        switch (type) {
            case 'READ_ARTICLE':
                points = 50;
                break;
            case 'DAILY_LOGIN':
                points = 20;
                break;
            case 'SHARE':
                points = 30;
                break;
            case 'VIEW_AD':
                points = 1; // 1 point per ad view (limit via distinctId suggested)
                break;
            case 'CLICK_AD':
                points = 30; // 30 points per click
                break;
            default:
                points = 10;
        }

        // Check for duplicates
        if (distinctId) {
            const { data: existing } = await supabase
                .from('xp_logs')
                .select('id')
                .eq('user_id', userId)
                .eq('type', type + ':' + distinctId)
                .single();

            if (existing) {
                return NextResponse.json({ skipped: true, message: 'Already processed' });
            }
        }

        // Insert Log
        // We use Clerk userId which MUST match Supabase auth.users ID for RLS to work properly usually.
        // Assuming the sync is handled or we just insert using the service role.

        const { error } = await supabase
            .from('xp_logs')
            .insert({
                user_id: userId,
                type: distinctId ? `${type}:${distinctId}` : type,
                points: points
            });

        if (error) {
            console.error('Supabase XP Insert Error:', error);
            // If error is related to foreign key (user not found), it means Clerk user is not in Supabase auth.users
            // For now we log and return error.
            return NextResponse.json({ error: 'Failed to record XP', details: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, points });

    } catch (error) {
        console.error('XP API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
