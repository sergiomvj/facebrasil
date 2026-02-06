-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Ad (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  position text,
  region text,
  CONSTRAINT Ad_pkey PRIMARY KEY (id)
);
CREATE TABLE public.AdImpression (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  adId uuid,
  event text,
  createdAt timestamp without time zone DEFAULT now(),
  CONSTRAINT AdImpression_pkey PRIMARY KEY (id),
  CONSTRAINT AdImpression_adId_fkey FOREIGN KEY (adId) REFERENCES public.Ad(id)
);
CREATE TABLE public.AnalyticsDaily (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  userId uuid,
  articleId uuid,
  views integer,
  date date,
  CONSTRAINT AnalyticsDaily_pkey PRIMARY KEY (id),
  CONSTRAINT AnalyticsDaily_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id),
  CONSTRAINT AnalyticsDaily_articleId_fkey FOREIGN KEY (articleId) REFERENCES public.Article(id)
);
CREATE TABLE public.Article (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  status text NOT NULL,
  categoryId uuid,
  authorId uuid,
  createdAt timestamp without time zone DEFAULT now(),
  updatedAt timestamp without time zone DEFAULT now(),
  CONSTRAINT Article_pkey PRIMARY KEY (id),
  CONSTRAINT Article_categoryId_fkey FOREIGN KEY (categoryId) REFERENCES public.Category(id),
  CONSTRAINT Article_authorId_fkey FOREIGN KEY (authorId) REFERENCES public.User(id)
);
CREATE TABLE public.ArticleBlock (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  type text NOT NULL,
  content jsonb NOT NULL,
  articleId uuid,
  CONSTRAINT ArticleBlock_pkey PRIMARY KEY (id),
  CONSTRAINT ArticleBlock_articleId_fkey FOREIGN KEY (articleId) REFERENCES public.Article(id)
);
CREATE TABLE public.Badge (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text,
  icon text,
  CONSTRAINT Badge_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Category (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  CONSTRAINT Category_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Collection (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  userId uuid,
  CONSTRAINT Collection_pkey PRIMARY KEY (id),
  CONSTRAINT Collection_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.CollectionItem (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  collectionId uuid,
  articleId uuid,
  CONSTRAINT CollectionItem_pkey PRIMARY KEY (id),
  CONSTRAINT CollectionItem_collectionId_fkey FOREIGN KEY (collectionId) REFERENCES public.Collection(id),
  CONSTRAINT CollectionItem_articleId_fkey FOREIGN KEY (articleId) REFERENCES public.Article(id)
);
CREATE TABLE public.CommunityComment (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  postId uuid,
  userId uuid,
  content text,
  createdAt timestamp without time zone DEFAULT now(),
  CONSTRAINT CommunityComment_pkey PRIMARY KEY (id),
  CONSTRAINT CommunityComment_postId_fkey FOREIGN KEY (postId) REFERENCES public.CommunityPost(id),
  CONSTRAINT CommunityComment_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.CommunityPost (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  userId uuid,
  title text,
  content text,
  createdAt timestamp without time zone DEFAULT now(),
  CONSTRAINT CommunityPost_pkey PRIMARY KEY (id),
  CONSTRAINT CommunityPost_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.Favorite (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  userId uuid,
  articleId uuid,
  CONSTRAINT Favorite_pkey PRIMARY KEY (id),
  CONSTRAINT Favorite_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id),
  CONSTRAINT Favorite_articleId_fkey FOREIGN KEY (articleId) REFERENCES public.Article(id)
);
CREATE TABLE public.Mission (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  description text,
  points integer,
  active boolean,
  CONSTRAINT Mission_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Notification (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  userId uuid,
  message text,
  createdAt timestamp without time zone DEFAULT now(),
  CONSTRAINT Notification_pkey PRIMARY KEY (id),
  CONSTRAINT Notification_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.Plan (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  CONSTRAINT Plan_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Poll (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  question text,
  options jsonb,
  createdBy text,
  CONSTRAINT Poll_pkey PRIMARY KEY (id)
);
CREATE TABLE public.PollVote (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  pollId uuid,
  userId uuid,
  option text,
  CONSTRAINT PollVote_pkey PRIMARY KEY (id),
  CONSTRAINT PollVote_pollId_fkey FOREIGN KEY (pollId) REFERENCES public.Poll(id),
  CONSTRAINT PollVote_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.Profile (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  userId uuid UNIQUE,
  name text,
  avatarUrl text,
  location text,
  CONSTRAINT Profile_pkey PRIMARY KEY (id),
  CONSTRAINT Profile_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.Quiz (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text,
  questions jsonb,
  createdBy text,
  CONSTRAINT Quiz_pkey PRIMARY KEY (id)
);
CREATE TABLE public.QuizResponse (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  quizId uuid,
  userId uuid,
  answers jsonb,
  CONSTRAINT QuizResponse_pkey PRIMARY KEY (id),
  CONSTRAINT QuizResponse_quizId_fkey FOREIGN KEY (quizId) REFERENCES public.Quiz(id),
  CONSTRAINT QuizResponse_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.Subscription (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  userId uuid,
  planId uuid,
  status text NOT NULL,
  startedAt timestamp without time zone,
  endsAt timestamp without time zone,
  CONSTRAINT Subscription_pkey PRIMARY KEY (id),
  CONSTRAINT Subscription_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id),
  CONSTRAINT Subscription_planId_fkey FOREIGN KEY (planId) REFERENCES public.Plan(id)
);
CREATE TABLE public.User (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  createdat timestamp without time zone DEFAULT now(),
  CONSTRAINT User_pkey PRIMARY KEY (id)
);
CREATE TABLE public.UserVideoReport (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  userId uuid,
  title text,
  description text,
  videoUrl text,
  status text,
  createdAt timestamp without time zone DEFAULT now(),
  CONSTRAINT UserVideoReport_pkey PRIMARY KEY (id),
  CONSTRAINT UserVideoReport_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);
CREATE TABLE public.XPLog (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  userId uuid,
  type text,
  points integer,
  createdAt timestamp without time zone DEFAULT now(),
  CONSTRAINT XPLog_pkey PRIMARY KEY (id),
  CONSTRAINT XPLog_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
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
  CONSTRAINT articles_pkey PRIMARY KEY (id),
  CONSTRAINT articles_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id),
  CONSTRAINT articles_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT articles_blog_id_fkey FOREIGN KEY (blog_id) REFERENCES public.blogs(id)
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
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  name text,
  avatar_url text,
  role text DEFAULT 'EDITOR'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_video_reports (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  status text DEFAULT 'APPROVED'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_video_reports_pkey PRIMARY KEY (id),
  CONSTRAINT user_video_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);