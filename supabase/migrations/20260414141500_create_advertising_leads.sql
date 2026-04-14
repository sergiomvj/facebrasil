CREATE TABLE IF NOT EXISTS public.advertising_leads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    package_code text NOT NULL,
    company_name text NOT NULL,
    contact_name text NOT NULL,
    email text NOT NULL,
    phone text,
    whatsapp text,
    website_url text,
    industry text,
    monthly_budget text,
    notes text,
    locale text NOT NULL DEFAULT 'pt',
    source_page text NOT NULL DEFAULT '/advertise',
    status text NOT NULL DEFAULT 'new',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT advertising_leads_package_code_check CHECK (package_code = ANY (ARRAY['A'::text, 'B'::text, 'C'::text])),
    CONSTRAINT advertising_leads_status_check CHECK (status = ANY (ARRAY['new'::text, 'contacted'::text, 'qualified'::text, 'won'::text, 'lost'::text]))
);

CREATE INDEX IF NOT EXISTS advertising_leads_status_idx
    ON public.advertising_leads (status, created_at DESC);

ALTER TABLE public.advertising_leads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "advertising_leads_insert_public" ON public.advertising_leads
        FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "advertising_leads_select_admin" ON public.advertising_leads
        FOR SELECT USING (
            EXISTS (
                SELECT 1
                FROM public.profiles
                WHERE id = auth.uid()::text AND role = 'ADMIN'
            )
        );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "advertising_leads_update_admin" ON public.advertising_leads
        FOR UPDATE USING (
            EXISTS (
                SELECT 1
                FROM public.profiles
                WHERE id = auth.uid()::text AND role = 'ADMIN'
            )
        );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
