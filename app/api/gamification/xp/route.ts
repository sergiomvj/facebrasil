// @ts-nocheck
import { NextResponse } from 'next/server';
import { auth, currentUser } from '@/lib/auth-server';

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
        let activityColumn = null;

        switch (type) {
            case 'READ_ARTICLE':
                points = 50;
                activityColumn = 'articles_read';
                break;
            case 'DAILY_LOGIN':
                points = 20;
                break;
            case 'SHARE':
                points = 30;
                activityColumn = 'shares_made';
                break;
            case 'VIEW_AD':
                points = 1;
                break;
            case 'CLICK_AD':
                points = 10;
                break;
            case 'COMMENT':
                points = 15;
                activityColumn = 'comments_made';
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
                .eq('type', distinctId ? `${type}:${distinctId}` : type)
                .single();

            if (existing) {
                return NextResponse.json({ skipped: true, message: 'Already processed' });
            }
        }

        // Insert Log
        const { error: logError } = await supabase
            .from('xp_logs')
            .insert({
                user_id: userId,
                type: distinctId ? `${type}:${distinctId}` : type,
                points: points
            });

        if (logError) {
            console.error('Supabase XP Insert Error:', logError);
            return NextResponse.json({ error: 'Failed to record XP', details: logError.message }, { status: 500 });
        }

        // Upsert User Reputation
        const reputationData = {
            user_id: userId,
            total_points: points, // Will be incremented if using RPC or handled manually
            last_activity_at: new Date().toISOString()
        };

        if (activityColumn) {
            reputationData[activityColumn] = 1;
        }

        // Usando RPC para incrementar valores de forma atômica se possível,
        // ou fazendo um select/update se não houver RPC disponível.
        // Por agora, vamos tentar um upsert básico ou apenas confiar nos logs para o balance.
        // Mas para performance, o ideal é o user_reputation.

        const { error: repError } = await supabase.rpc('increment_user_xp', {
            uid: userId,
            xp_points: points,
            activity_col: activityColumn
        });

        if (repError) {
            console.warn('Reputation update failed, checking if function exists:', repError);
            // Fallback: Tentamos criar o registro se não existir
            await supabase.from('user_reputation').upsert({
                user_id: userId,
                last_activity_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
        }

        return NextResponse.json({ success: true, points });

    } catch (error) {
        console.error('XP API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


