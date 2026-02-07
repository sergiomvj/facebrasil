-- Add multi-language support to posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS language text DEFAULT 'pt';
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS translation_group_id uuid DEFAULT gen_random_uuid();

-- Create an index for faster translation lookup
CREATE INDEX IF NOT EXISTS idx_posts_translation_group_id ON public.posts(translation_group_id);
CREATE INDEX IF NOT EXISTS idx_posts_language ON public.posts(language);

-- Add multi-language support to static_pages table (CMS pages)
ALTER TABLE public.static_pages ADD COLUMN IF NOT EXISTS language text DEFAULT 'pt';
ALTER TABLE public.static_pages ADD COLUMN IF NOT EXISTS translation_group_id uuid DEFAULT gen_random_uuid();

CREATE INDEX IF NOT EXISTS idx_static_pages_translation_group_id ON public.static_pages(translation_group_id);
CREATE INDEX IF NOT EXISTS idx_static_pages_language ON public.static_pages(language);

-- Comments on columns for clarification
COMMENT ON COLUMN public.posts.language IS 'The language of the post (e.g., pt, en, es)';
COMMENT ON COLUMN public.posts.translation_group_id IS 'UUID shared by all translations of the same article';
