-- Create partners table
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    category TEXT DEFAULT 'Varejo',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create partner_offers table
CREATE TABLE IF NOT EXISTS public.partner_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    offer_type TEXT CHECK (offer_type IN ('product', 'service', 'discount')),
    facet_cost INTEGER NOT NULL DEFAULT 1000,
    currency_value DECIMAL(10,2),
    discount_percent DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_offers ENABLE ROW LEVEL SECURITY;

-- Policies for partners
DROP POLICY IF EXISTS "Allow public read access to partners" ON public.partners;
CREATE POLICY "Allow public read access to partners" ON public.partners FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow authenticated full access to partners" ON public.partners;
CREATE POLICY "Allow authenticated full access to partners" ON public.partners FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow service_role full access to partners" ON public.partners;
CREATE POLICY "Allow service_role full access to partners" ON public.partners FOR ALL TO service_role USING (true);

-- Policies for partner_offers
DROP POLICY IF EXISTS "Allow public read access to partner_offers" ON public.partner_offers;
CREATE POLICY "Allow public read access to partner_offers" ON public.partner_offers FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow authenticated full access to partner_offers" ON public.partner_offers;
CREATE POLICY "Allow authenticated full access to partner_offers" ON public.partner_offers FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow service_role full access to partner_offers" ON public.partner_offers;
CREATE POLICY "Allow service_role full access to partner_offers" ON public.partner_offers FOR ALL TO service_role USING (true);

-- Add to real-time (optional but helpful)
-- Note: ALTER PUBLICATION doesn't have IF NOT EXISTS for tables, so we use a safe block if needed or just handle manually
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'partners'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.partners;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'partner_offers'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_offers;
    END IF;
END $$;
