'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';

interface AdvertiseLeadPayload {
    packageCode: string;
    companyName: string;
    contactName: string;
    email: string;
    phone?: string;
    whatsapp?: string;
    websiteUrl?: string;
    industry?: string;
    monthlyBudget?: string;
    notes?: string;
    locale?: string;
}

export async function createAdvertiseLead(payload: AdvertiseLeadPayload) {
    const packageCode = payload.packageCode?.trim().toUpperCase();
    const companyName = payload.companyName?.trim();
    const contactName = payload.contactName?.trim();
    const email = payload.email?.trim().toLowerCase();

    if (!packageCode || !['A', 'B', 'C'].includes(packageCode)) {
        return { success: false, error: 'Pacote invalido.' };
    }

    if (!companyName || !contactName || !email) {
        return { success: false, error: 'Preencha empresa, contato e e-mail.' };
    }

    const { error } = await (supabaseAdmin as any).from('advertising_leads').insert({
        package_code: packageCode,
        company_name: companyName,
        contact_name: contactName,
        email,
        phone: payload.phone?.trim() || null,
        whatsapp: payload.whatsapp?.trim() || null,
        website_url: payload.websiteUrl?.trim() || null,
        industry: payload.industry?.trim() || null,
        monthly_budget: payload.monthlyBudget?.trim() || null,
        notes: payload.notes?.trim() || null,
        locale: payload.locale?.trim() || 'pt',
        source_page: '/advertise',
        status: 'new',
    });

    if (error) {
        console.error('[AdvertiseLead] insert error:', error);
        return { success: false, error: 'Nao foi possivel registrar sua solicitacao agora.' };
    }

    return { success: true };
}

const VALID_LEAD_STATUSES = ['new', 'contacted', 'qualified', 'won', 'lost'] as const;

export async function updateAdvertiseLeadStatus(id: string, status: string) {
    if (!id) {
        return { success: false, error: 'Lead invalido.' };
    }

    if (!VALID_LEAD_STATUSES.includes(status as (typeof VALID_LEAD_STATUSES)[number])) {
        return { success: false, error: 'Status invalido.' };
    }

    const { error } = await (supabaseAdmin as any)
        .from('advertising_leads')
        .update({
            status,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id);

    if (error) {
        console.error('[AdvertiseLead] update status error:', error);
        return { success: false, error: 'Nao foi possivel atualizar o status.' };
    }

    return { success: true };
}
