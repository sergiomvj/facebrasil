-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.ads (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  position text NOT NULL CHECK ("position" = ANY (ARRAY['banner_top'::text, 'sidebar'::text, 'inline'::text, 'sticky_footer'::text, 'home_hero'::text, 'article_sidebar'::text, 'feed_interstitial'::text])),
  image_url text,
  link_url text NOT NULL,
  is_active boolean DEFAULT true,
  start_date timestamp with time zone DEFAULT now(),
  end_date timestamp with time zone,
  views integer DEFAULT 0,
  clicks integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  category_id uuid,
  CONSTRAINT ads_pkey PRIMARY KEY (id),
  CONSTRAINT ads_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.articles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  content text,
  featured_image jsonb,
  status text DEFAULT 'DRAFT'::text,
  published_at timestamp with time zone DEFAULT now(),
  author_id uuid,
  category_id uuid,
  blog_id uuid,
  views integer DEFAULT 0,
  read_time integer DEFAULT 5,
  social_summary text,
  instagram_post_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  destaque_hero boolean DEFAULT false,
  colocar_hero boolean DEFAULT false,
  hero_set_at timestamp with time zone,
  source_type text DEFAULT 'manual'::text CHECK (source_type = ANY (ARRAY['manual'::text, 'automated'::text])),
  original_source text,
  ai_context jsonb,
  news_queue_id uuid,
  language text DEFAULT 'pt'::text,
  translation_group_id uuid DEFAULT gen_random_uuid(),
  CONSTRAINT articles_pkey PRIMARY KEY (id),
  CONSTRAINT articles_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id),
  CONSTRAINT articles_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT articles_blog_id_fkey FOREIGN KEY (blog_id) REFERENCES public.blogs(id),
  CONSTRAINT articles_news_queue_id_fkey FOREIGN KEY (news_queue_id) REFERENCES public.news_queue(id)
);
CREATE TABLE public.badges (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon text NOT NULL,
  criteria jsonb NOT NULL,
  rarity text DEFAULT 'common'::text CHECK (rarity = ANY (ARRAY['common'::text, 'rare'::text, 'epic'::text, 'legendary'::text])),
  color text DEFAULT '#6B7280'::text,
  order_priority integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT badges_pkey PRIMARY KEY (id)
);
CREATE TABLE public.blogs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  owner_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT blogs_pkey PRIMARY KEY (id),
  CONSTRAINT blogs_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  color text,
  parent_id uuid,
  blog_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id),
  CONSTRAINT categories_blog_id_fkey FOREIGN KEY (blog_id) REFERENCES public.blogs(id)
);
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text CHECK (char_length(description) <= 200),
  city text NOT NULL,
  state text,
  location text NOT NULL,
  event_date date NOT NULL,
  event_time time without time zone,
  organizer_name text,
  organizer_email text,
  organizer_phone text,
  submitted_by text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id)
);
CREATE TABLE public.news_queue (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  source_id uuid,
  original_url text NOT NULL UNIQUE,
  original_title text NOT NULL,
  original_content text,
  original_image text,
  original_author text,
  original_published_at timestamp with time zone,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'published'::text, 'failed'::text, 'duplicate'::text, 'rejected'::text])),
  ai_request_id text,
  ai_tokens_used integer,
  ai_processing_time_ms integer,
  processed_article_id uuid,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  processing_started_at timestamp with time zone,
  processed_at timestamp with time zone,
  CONSTRAINT news_queue_pkey PRIMARY KEY (id),
  CONSTRAINT news_queue_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.news_sources(id),
  CONSTRAINT news_queue_processed_article_id_fkey FOREIGN KEY (processed_article_id) REFERENCES public.articles(id)
);
CREATE TABLE public.news_sources (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['rss'::text, 'api'::text, 'scraper'::text])),
  url text NOT NULL UNIQUE,
  category_slug text,
  enabled boolean DEFAULT true,
  last_fetch timestamp with time zone,
  fetch_interval_minutes integer DEFAULT 15,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT news_sources_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  name text,
  avatar_url text,
  role text DEFAULT 'EDITOR'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.static_pages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  content text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT static_pages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_activities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id text NOT NULL,
  activity_type text NOT NULL CHECK (activity_type = ANY (ARRAY['read_complete'::text, 'comment'::text, 'share'::text, 'fact_check'::text, 'topic_suggest'::text, 'like'::text, 'bookmark'::text])),
  article_id uuid,
  points_earned integer DEFAULT 0,
  validated boolean DEFAULT false,
  validated_by text,
  validated_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_activities_pkey PRIMARY KEY (id),
  CONSTRAINT user_activities_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id)
);
CREATE TABLE public.user_badges (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id text NOT NULL,
  badge_id uuid,
  earned_at timestamp with time zone DEFAULT now(),
  progress jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT user_badges_pkey PRIMARY KEY (id),
  CONSTRAINT user_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.badges(id)
);
CREATE TABLE public.user_reputation (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id text NOT NULL UNIQUE,
  total_points integer DEFAULT 0,
  weekly_points integer DEFAULT 0,
  monthly_points integer DEFAULT 0,
  level integer DEFAULT 1,
  level_name text DEFAULT 'Leitor Casual'::text,
  badges jsonb DEFAULT '[]'::jsonb,
  achievements jsonb DEFAULT '{}'::jsonb,
  articles_read integer DEFAULT 0,
  comments_made integer DEFAULT 0,
  shares_made integer DEFAULT 0,
  fact_checks_submitted integer DEFAULT 0,
  topics_suggested integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_activity_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_reputation_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_video_reports (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  status text DEFAULT 'APPROVED'::text,
  created_at timestamp with time zone DEFAULT now(),
  city text,
  reporter_name text,
  CONSTRAINT user_video_reports_pkey PRIMARY KEY (id),
  CONSTRAINT user_video_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.xp_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id text,
  type text NOT NULL,
  points integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT xp_logs_pkey PRIMARY KEY (id)
);