-- ============================================================
-- FACEBRASIL - RLS Security Policies
-- Gerado com base no Schema Real (Production) recuperado via MCP.
-- 
-- Tpos Mapeados na Base de Dados (ID do Usuário Autenticado):
-- -> profiles.id                      : text
-- -> articles.author_id               : text
-- -> blogs.owner_id                   : text
-- -> user_activities.user_id          : text
-- -> user_badges.user_id              : text
-- -> user_reputation.user_id          : text
-- -> xp_logs.user_id                  : text
-- -> user_video_reports.user_id       : uuid
--
-- Nota: auth.uid() retorna 'uuid'. 
-- Para comparações com colunas 'text', usaremos auth.uid()::text.
-- Para comparações com colunas 'uuid', usaremos auth.uid().
-- ============================================================

-- ─── 1. HABILITAR RLS (apenas nas tabelas que existem) ────────────────────────

ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_queue          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_sources        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.static_pages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reputation     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_video_reports  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_logs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges              ENABLE ROW LEVEL SECURITY;

-- ─── 2. PROFILES (id: text) ───────────────────────────────────────────────────

DO $$ BEGIN
    CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- auth.uid() convertido para text para match com profiles.id
DO $$ BEGIN
    CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid()::text = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid()::text = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 3. ARTICLES (author_id: text) ────────────────────────────────────────────

-- Qualquer um pode ler artigos PUBLICADOS
DO $$ BEGIN
    CREATE POLICY "articles_select_published" ON public.articles FOR SELECT USING (status IN ('PUBLISHED', 'published'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Admins e Editors podem ver todos os artigos (inclusive rascunhos)
DO $$ BEGIN
    CREATE POLICY "articles_select_staff" ON public.articles FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()::text AND role IN ('ADMIN', 'EDITOR')
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Admins e Editors podem criar/editar/deletar artigos
DO $$ BEGIN
    CREATE POLICY "articles_write_staff" ON public.articles FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()::text AND role IN ('ADMIN', 'EDITOR')
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 4. CATEGORIES ────────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE POLICY "categories_select_public" ON public.categories FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "categories_write_admin" ON public.categories FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()::text AND role = 'ADMIN'
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 5. ADS ───────────────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE POLICY "ads_select_public" ON public.ads FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "ads_write_admin" ON public.ads FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()::text AND role = 'ADMIN'
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 6. BLOGS (owner_id: text) ────────────────────────────────────────────────

DO $$ BEGIN
    CREATE POLICY "blogs_select_public" ON public.blogs FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "blogs_write_owner_or_admin" ON public.blogs FOR ALL USING (
        owner_id = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()::text AND role = 'ADMIN'
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 7. EVENTS ────────────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE POLICY "events_select_approved" ON public.events FOR SELECT USING (status = 'approved');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "events_all_admin" ON public.events FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()::text AND role = 'ADMIN'
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "events_insert_public" ON public.events FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 8. NEWS_QUEUE ────────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE POLICY "news_queue_staff_only" ON public.news_queue FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()::text AND role IN ('ADMIN', 'EDITOR')
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 9. NEWS_SOURCES ──────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE POLICY "news_sources_admin_only" ON public.news_sources FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()::text AND role = 'ADMIN'
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 10. STATIC_PAGES ─────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE POLICY "static_pages_select_public" ON public.static_pages FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "static_pages_write_admin" ON public.static_pages FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()::text AND role = 'ADMIN'
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 11. USER_ACTIVITIES (user_id: text) ──────────────────────────────────────

DO $$ BEGIN
    CREATE POLICY "user_activities_own" ON public.user_activities FOR SELECT USING (user_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "user_activities_insert_auth" ON public.user_activities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "user_activities_admin" ON public.user_activities FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()::text AND role = 'ADMIN'
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 12. USER_BADGES (user_id: text) ──────────────────────────────────────────

DO $$ BEGIN
    CREATE POLICY "user_badges_select_public" ON public.user_badges FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "user_badges_admin" ON public.user_badges FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()::text AND role = 'ADMIN'
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 13. USER_REPUTATION (user_id: text) ──────────────────────────────────────

DO $$ BEGIN
    CREATE POLICY "user_reputation_select_public" ON public.user_reputation FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "user_reputation_own_update" ON public.user_reputation FOR UPDATE USING (user_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 14. USER_VIDEO_REPORTS (user_id: uuid) ───────────────────────────────────

DO $$ BEGIN
    CREATE POLICY "uvr_select_approved" ON public.user_video_reports FOR SELECT USING (status = 'APPROVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "uvr_insert_auth" ON public.user_video_reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "uvr_admin" ON public.user_video_reports FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()::text AND role = 'ADMIN'
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 15. XP_LOGS (user_id: text) ──────────────────────────────────────────────

DO $$ BEGIN
    CREATE POLICY "xp_logs_own" ON public.xp_logs FOR SELECT USING (user_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "xp_logs_admin" ON public.xp_logs FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()::text AND role = 'ADMIN'
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 16. BADGES ───────────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE POLICY "badges_select_public" ON public.badges FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "badges_write_admin" ON public.badges FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()::text AND role = 'ADMIN'
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
