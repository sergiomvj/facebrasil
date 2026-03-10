'use client';

import React from 'react';
import AdSpace from '@/components/AdSpace';

export default function TestAdsPage() {
    return (
        <div className="p-10 space-y-10 bg-slate-200 min-h-screen pt-40">
            <h1 className="text-3xl font-bold">AdSpace Developer Test</h1>

            <section>
                <h2 className="text-xl font-bold mb-4">Sidebar Ad</h2>
                <div className="border border-red-500 inline-block">
                    <AdSpace position="sidebar" />
                </div>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-4">Column Ad</h2>
                <div className="border border-red-500 inline-block">
                    <AdSpace position="column" />
                </div>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-4">Super Hero Ad</h2>
                <div className="border border-red-500">
                    <AdSpace position="super_hero" />
                </div>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-4">Super Footer Ad</h2>
                <div className="border border-red-500">
                    <AdSpace position="super_footer" />
                </div>
            </section>
        </div>
    );
}
