import React from 'react';
import { supabaseAdmin } from '@/lib/supabase-admin';
import AdminAdvertisingLeadsList from '@/components/admin/AdminAdvertisingLeadsList';

export default async function AdminAdvertisingLeadsPage() {
    const { data: leads, error } = await (supabaseAdmin as any)
        .from('advertising_leads')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
                Erro ao carregar leads comerciais: {error.message}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tighter dark:text-white text-gray-900 uppercase italic">
                    Leads Comerciais
                </h1>
                <p className="text-slate-400 mt-2">
                    Solicitações captadas pela página de anúncios da Facebrasil.
                </p>
            </div>

            <AdminAdvertisingLeadsList initialLeads={leads || []} />
        </div>
    );
}
