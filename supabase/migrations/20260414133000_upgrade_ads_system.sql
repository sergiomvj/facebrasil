ALTER TABLE public.ads
    ADD COLUMN IF NOT EXISTS mobile_image_url text,
    ADD COLUMN IF NOT EXISTS curiosity_count integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS target_countries text[] NOT NULL DEFAULT '{}'::text[],
    ADD COLUMN IF NOT EXISTS target_regions text[] NOT NULL DEFAULT '{}'::text[],
    ADD COLUMN IF NOT EXISTS target_zip_codes text[] NOT NULL DEFAULT '{}'::text[];

UPDATE public.ads
SET start_date = now()
WHERE start_date IS NULL;

UPDATE public.ads
SET position = CASE
    WHEN position IN ('home_hero', 'banner_top') THEN 'super_hero'
    WHEN position = 'article_sidebar' THEN 'sidebar'
    WHEN position = 'sticky_footer' THEN 'super_footer'
    ELSE position
END
WHERE position IN ('home_hero', 'banner_top', 'article_sidebar', 'sticky_footer');

ALTER TABLE public.ads
    DROP CONSTRAINT IF EXISTS ads_position_check;

ALTER TABLE public.ads
    ADD CONSTRAINT ads_position_check
    CHECK (
        position = ANY (
            ARRAY[
                'super_hero'::text,
                'sidebar'::text,
                'column'::text,
                'column_1'::text,
                'column_2'::text,
                'column_3'::text,
                'super_footer'::text,
                'inline'::text,
                'feed_interstitial'::text
            ]
        )
    );

CREATE TABLE IF NOT EXISTS public.publications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ad_publications (
    ad_id uuid NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
    publication_id uuid NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (ad_id, publication_id)
);

INSERT INTO public.publications (name, slug)
VALUES
    ('Facebrasil', 'facebrasil'),
    ('TVFacebrasil', 'tvfacebrasil')
ON CONFLICT (slug) DO NOTHING;

CREATE INDEX IF NOT EXISTS ads_position_is_active_idx
    ON public.ads (position, is_active);

CREATE INDEX IF NOT EXISTS ads_category_id_idx
    ON public.ads (category_id);

CREATE INDEX IF NOT EXISTS ad_publications_publication_id_idx
    ON public.ad_publications (publication_id);

ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_publications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "publications_select_public" ON public.publications
        FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "publications_write_admin" ON public.publications
        FOR ALL USING (
            EXISTS (
                SELECT 1
                FROM public.profiles
                WHERE id = auth.uid()::text AND role = 'ADMIN'
            )
        );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "ad_publications_select_public" ON public.ad_publications
        FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "ad_publications_write_admin" ON public.ad_publications
        FOR ALL USING (
            EXISTS (
                SELECT 1
                FROM public.profiles
                WHERE id = auth.uid()::text AND role = 'ADMIN'
            )
        );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('ads', 'ads', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
    CREATE POLICY "ads_bucket_public_read" ON storage.objects
        FOR SELECT USING (bucket_id = 'ads');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "ads_bucket_admin_write" ON storage.objects
        FOR ALL USING (
            bucket_id = 'ads' AND EXISTS (
                SELECT 1
                FROM public.profiles
                WHERE id = auth.uid()::text AND role = 'ADMIN'
            )
        )
        WITH CHECK (
            bucket_id = 'ads' AND EXISTS (
                SELECT 1
                FROM public.profiles
                WHERE id = auth.uid()::text AND role = 'ADMIN'
            )
        );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.increment_ad_views(ad_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE public.ads
    SET views = COALESCE(views, 0) + 1
    WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_ad_clicks(ad_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE public.ads
    SET clicks = COALESCE(clicks, 0) + 1
    WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_ad_curiosity(ad_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE public.ads
    SET curiosity_count = COALESCE(curiosity_count, 0) + 1
    WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_ad_views(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_ad_clicks(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_ad_curiosity(uuid) TO anon, authenticated, service_role;
