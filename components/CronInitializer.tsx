'use client';

import { useEffect } from 'react';
import { runPublishCron } from '@/app/actions/cron-actions';

export function CronInitializer() {
    useEffect(() => {
        // Run passive cron exactly once on initial client mount
        runPublishCron().catch(console.error);
    }, []);

    return null;
}
