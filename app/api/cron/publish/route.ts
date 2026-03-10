import { NextResponse } from 'next/server';
import { runPublishCron } from '@/app/actions/cron-actions';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: Request) {
    try {
        const result = await runPublishCron();

        if (!result.success) {
            return NextResponse.json(result, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `Successfully published ${result.count} articles.`,
        });

    } catch (error: any) {
        console.error('Cron HTTP job error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
