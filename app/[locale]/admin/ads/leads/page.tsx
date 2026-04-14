import React from 'react';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Mail, Phone, Globe, Building2, MessageSquare } from 'lucide-react';

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

            {!leads || leads.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/50 p-12 text-center">
                    <p className="text-slate-400">Nenhum lead comercial recebido ainda.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {leads.map((lead: any) => (
                        <div key={lead.id} className="rounded-3xl border border-white/5 bg-slate-900 p-6 shadow-xl">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                            Pacote {lead.package_code}
                                        </span>
                                        <span className="rounded-full border border-white/10 bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                            {lead.status}
                                        </span>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight">
                                            {lead.company_name}
                                        </h2>
                                        <p className="text-sm text-slate-400">
                                            Contato: {lead.contact_name}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-xs text-slate-500 font-mono">
                                    {new Date(lead.created_at).toLocaleString()}
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 text-sm">
                                <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-950 px-4 py-3 text-slate-300">
                                    <Mail className="w-4 h-4 text-primary" />
                                    <span>{lead.email}</span>
                                </div>
                                {lead.phone && (
                                    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-950 px-4 py-3 text-slate-300">
                                        <Phone className="w-4 h-4 text-primary" />
                                        <span>{lead.phone}</span>
                                    </div>
                                )}
                                {lead.website_url && (
                                    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-950 px-4 py-3 text-slate-300">
                                        <Globe className="w-4 h-4 text-primary" />
                                        <span className="truncate">{lead.website_url}</span>
                                    </div>
                                )}
                                {lead.industry && (
                                    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-950 px-4 py-3 text-slate-300">
                                        <Building2 className="w-4 h-4 text-primary" />
                                        <span>{lead.industry}</span>
                                    </div>
                                )}
                                {lead.whatsapp && (
                                    <div className="rounded-2xl border border-white/5 bg-slate-950 px-4 py-3 text-slate-300">
                                        WhatsApp: {lead.whatsapp}
                                    </div>
                                )}
                                {lead.monthly_budget && (
                                    <div className="rounded-2xl border border-white/5 bg-slate-950 px-4 py-3 text-slate-300">
                                        Orçamento: {lead.monthly_budget}
                                    </div>
                                )}
                            </div>

                            {lead.notes && (
                                <div className="mt-4 rounded-2xl border border-white/5 bg-slate-950 p-4">
                                    <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                                        <MessageSquare className="w-4 h-4" />
                                        Objetivo da campanha
                                    </div>
                                    <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                                        {lead.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
