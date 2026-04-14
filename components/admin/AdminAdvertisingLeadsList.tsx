'use client';

import React, { useDeferredValue, useState, useTransition } from 'react';
import { Building2, Funnel, Globe, Mail, MessageSquare, Phone, Search } from 'lucide-react';
import { updateAdvertiseLeadStatus } from '@/app/actions/advertise-actions';

type AdvertisingLead = {
    id: string;
    package_code: string;
    company_name: string;
    contact_name: string;
    email: string;
    phone?: string | null;
    whatsapp?: string | null;
    website_url?: string | null;
    industry?: string | null;
    monthly_budget?: string | null;
    notes?: string | null;
    status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
    created_at: string;
};

const STATUS_OPTIONS: AdvertisingLead['status'][] = ['new', 'contacted', 'qualified', 'won', 'lost'];
const FILTER_OPTIONS = ['all', ...STATUS_OPTIONS] as const;

type LeadFilter = (typeof FILTER_OPTIONS)[number];

const statusClasses: Record<AdvertisingLead['status'], string> = {
    new: 'border-sky-500/20 bg-sky-500/10 text-sky-300',
    contacted: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    qualified: 'border-violet-500/20 bg-violet-500/10 text-violet-300',
    won: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    lost: 'border-rose-500/20 bg-rose-500/10 text-rose-300',
};

const statusLabels: Record<AdvertisingLead['status'], string> = {
    new: 'Novo',
    contacted: 'Contato',
    qualified: 'Qualificado',
    won: 'Fechado',
    lost: 'Perdido',
};

export default function AdminAdvertisingLeadsList({ initialLeads }: { initialLeads: AdvertisingLead[] }) {
    const [leads, setLeads] = useState(initialLeads);
    const [pendingId, setPendingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<LeadFilter>('all');
    const [isPending, startTransition] = useTransition();
    const deferredSearchTerm = useDeferredValue(searchTerm);

    const handleStatusChange = (leadId: string, status: AdvertisingLead['status']) => {
        const previous = leads;
        setPendingId(leadId);
        setLeads((current) => current.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)));

        startTransition(async () => {
            const result = await updateAdvertiseLeadStatus(leadId, status);
            if (!result.success) {
                setLeads(previous);
            }
            setPendingId(null);
        });
    };

    const normalizedSearch = deferredSearchTerm.trim().toLowerCase();
    const visibleLeads = leads.filter((lead) => {
        if (statusFilter !== 'all' && lead.status !== statusFilter) {
            return false;
        }

        if (!normalizedSearch) {
            return true;
        }

        const haystack = [
            lead.company_name,
            lead.contact_name,
            lead.email,
            lead.phone,
            lead.whatsapp,
            lead.website_url,
            lead.industry,
            lead.monthly_budget,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return haystack.includes(normalizedSearch);
    });

    const counts = leads.reduce<Record<LeadFilter, number>>(
        (acc, lead) => {
            acc.all += 1;
            acc[lead.status] += 1;
            return acc;
        },
        {
            all: 0,
            new: 0,
            contacted: 0,
            qualified: 0,
            won: 0,
            lost: 0,
        }
    );

    if (leads.length === 0) {
        return (
            <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/50 p-12 text-center">
                <p className="text-slate-400">Nenhum lead comercial recebido ainda.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                {FILTER_OPTIONS.map((filter) => {
                    const active = statusFilter === filter;
                    const label = filter === 'all' ? 'Total' : statusLabels[filter];

                    return (
                        <button
                            key={filter}
                            type="button"
                            onClick={() => setStatusFilter(filter)}
                            className={`rounded-3xl border px-4 py-4 text-left transition-all ${
                                active
                                    ? 'border-primary/40 bg-primary/10 shadow-lg shadow-primary/10'
                                    : 'border-white/5 bg-slate-900 hover:border-white/10'
                            }`}
                        >
                            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
                                {label}
                            </div>
                            <div className="mt-2 text-3xl font-black tracking-tight text-white">
                                {counts[filter]}
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                <label className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-900 px-4 py-3">
                    <Search className="h-4 w-4 text-slate-500" />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por empresa, contato, e-mail ou telefone"
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    />
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-900 px-4 py-3">
                    <Funnel className="h-4 w-4 text-slate-500" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as LeadFilter)}
                        className="w-full bg-transparent text-sm font-semibold text-white outline-none"
                    >
                        <option value="all">Todos os status</option>
                        {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                                {statusLabels[status]}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                <p>
                    Exibindo {visibleLeads.length} de {leads.length} lead{leads.length === 1 ? '' : 's'}.
                </p>
                {(statusFilter !== 'all' || searchTerm.trim()) && (
                    <button
                        type="button"
                        onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('all');
                        }}
                        className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white transition-colors hover:border-white/20"
                    >
                        Limpar filtros
                    </button>
                )}
            </div>

            {visibleLeads.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/50 p-12 text-center">
                    <p className="text-slate-400">Nenhum lead encontrado com os filtros atuais.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {visibleLeads.map((lead) => (
                        <div key={lead.id} className="rounded-3xl border border-white/5 bg-slate-900 p-6 shadow-xl">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                            Pacote {lead.package_code}
                                        </span>
                                        <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${statusClasses[lead.status]}`}>
                                            {statusLabels[lead.status]}
                                        </span>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-black uppercase tracking-tight text-white">
                                            {lead.company_name}
                                        </h2>
                                        <p className="text-sm text-slate-400">
                                            Contato: {lead.contact_name}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-start gap-3 lg:items-end">
                                    <div className="font-mono text-xs text-slate-500">
                                        {new Date(lead.created_at).toLocaleString()}
                                    </div>
                                    <select
                                        value={lead.status}
                                        disabled={isPending && pendingId === lead.id}
                                        onChange={(e) => handleStatusChange(lead.id, e.target.value as AdvertisingLead['status'])}
                                        className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-black uppercase tracking-[0.15em] text-white outline-none disabled:opacity-60"
                                    >
                                        {STATUS_OPTIONS.map((status) => (
                                            <option key={status} value={status}>
                                                {statusLabels[status]}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
                                <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-950 px-4 py-3 text-slate-300">
                                    <Mail className="h-4 w-4 text-primary" />
                                    <span>{lead.email}</span>
                                </div>
                                {lead.phone && (
                                    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-950 px-4 py-3 text-slate-300">
                                        <Phone className="h-4 w-4 text-primary" />
                                        <span>{lead.phone}</span>
                                    </div>
                                )}
                                {lead.website_url && (
                                    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-950 px-4 py-3 text-slate-300">
                                        <Globe className="h-4 w-4 text-primary" />
                                        <span className="truncate">{lead.website_url}</span>
                                    </div>
                                )}
                                {lead.industry && (
                                    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-950 px-4 py-3 text-slate-300">
                                        <Building2 className="h-4 w-4 text-primary" />
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
                                        <MessageSquare className="h-4 w-4" />
                                        Objetivo da campanha
                                    </div>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
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
