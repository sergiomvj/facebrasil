-- Create virtual_agents table
CREATE TABLE IF NOT EXISTS public.virtual_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    profile_description TEXT,
    location TEXT,
    writing_style TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create captured_news table
CREATE TABLE IF NOT EXISTS public.captured_news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_title TEXT NOT NULL,
    translated_title TEXT,
    url TEXT UNIQUE NOT NULL,
    image_url TEXT,
    source_vehicle TEXT,
    source_tier INTEGER,
    category TEXT,
    sentiment TEXT, -- positive, negative, neutral
    is_trending BOOLEAN DEFAULT false,
    cross_reference_data JSONB,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create news_usage table
CREATE TABLE IF NOT EXISTS public.news_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    news_id UUID NOT NULL REFERENCES public.captured_news(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.virtual_agents(id) ON DELETE SET NULL,
    used_by_user_id UUID, -- For future compatibility if real users use it
    used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(news_id, agent_id)
);

-- Enable RLS
ALTER TABLE public.virtual_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.captured_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_usage ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (adjust as needed for your auth system)
-- Assuming authenticated users can read and write these tables for the admin panel

-- virtual_agents policies
CREATE POLICY "Enable read access for all authenticated users" ON public.virtual_agents
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.virtual_agents
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.virtual_agents
    FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users" ON public.virtual_agents
    FOR DELETE TO authenticated USING (true);

-- captured_news policies
CREATE POLICY "Enable read access for all authenticated users" ON public.captured_news
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.captured_news
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.captured_news
    FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users" ON public.captured_news
    FOR DELETE TO authenticated USING (true);

-- news_usage policies
CREATE POLICY "Enable read access for all authenticated users" ON public.news_usage
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.news_usage
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.news_usage
    FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users" ON public.news_usage
    FOR DELETE TO authenticated USING (true);
