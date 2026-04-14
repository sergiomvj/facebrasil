import React from 'react';
import Hero from '@/components/Hero';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import ArticleCard from '@/components/ArticleCard';
import InfiniteFeed from '@/components/InfiniteFeed';
import MailNewsletter from '@/components/MailNewsletter';
import EventsAgenda from '@/components/EventsAgenda';
import EuReporterSection from '@/components/EuReporterSection';
import EditionsSection from '@/components/EditionsSection';
import FBRNewsSection from '@/components/FBRNewsSection';
import { fetchPosts, fetchFeaturedPosts, fetchVideoReports, fetchMainHero } from '@/lib/blog-service';
import { createClient } from '@/lib/supabase/server';
import { Link } from '@/i18n/routing';
import { TrendingUp, Clock, BookOpen } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import AdSpace from '@/components/AdSpace';
import CategoryTabs from '@/components/CategoryTabs';
import PricingSection from '@/components/PricingSection';

import { Metadata } from 'next';
import { FALLBACK_ARTICLE_IMAGE } from '@/lib/constants';
import { formatDateAmerican } from '@/lib/utils';

// Force dynamic revalidation
export const revalidate = 60;

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const supabase = await createClient();

  // Fetch Hero and Site Settings
  const [mainHero, settings] = await Promise.all([
    fetchMainHero(undefined, supabase),
    (async () => {
      const { data } = await supabase.from('site_settings').select('*').eq('id', 1).single();
      return data;
    })()
  ]);

  // Priority logic for metadata:
  // Title/Desc: Site Settings > Translation File
  // Image: Hero Article Image > Site Settings Image > Fallback Image

  const siteName = settings?.site_name || t('title');
  const siteDesc = settings?.site_description || t('description');

  // Hero article metadata (if exists)
  const heroTitle = mainHero?.title || siteName;
  const heroDesc = mainHero?.excerpt || siteDesc;

  // Image strategy: 1. Hero Image, 2. Global OG Image, 3. Hardcoded Fallback
  const imageUrl = mainHero?.featuredImage?.url || settings?.og_image_url || `https://fbr.news${FALLBACK_ARTICLE_IMAGE}`;

  return {
    title: siteName,
    description: siteDesc,
    openGraph: {
      title: heroTitle,
      description: heroDesc,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: heroTitle,
        }
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: heroTitle,
      description: heroDesc,
      images: [imageUrl],
    },
  };
}

export default async function Home({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('Home');
  const tNav = await getTranslations('Navbar');

  const supabase = await createClient();

  // Fetch Latest, Popular, Editorial, Featured (Highlights), Video Reports, and Main Hero
  const [
    latestData,
    popularData,
    editorialData,
    fbrNewsData,
    featuredPosts,
    videoReports,
    mainHero,
    highlightFaceData,
    highlightImigracaoData,
    highlightEventosData,
    newsTab,
    healthTab,
    wellbeingTab,
    lifestyleTab,
    businessTab,
    communityTab
  ] = await Promise.all([
    fetchPosts({
      limit: 8,
      category: ['noticias', 'saude', 'bem-estar', 'estilo-de-vida', 'negocios', 'comunidade']
    }, supabase),
    fetchPosts({ limit: 3, sort: 'popular' }, supabase),
    fetchPosts({ category: ['editorial', 'opiniao', 'opinião'], limit: 3 }, supabase),
    fetchPosts({ category: 'fbr-news', limit: 6 }, supabase),
    fetchFeaturedPosts(5, undefined, supabase),
    fetchVideoReports(4, supabase),
    fetchMainHero(undefined, supabase),
    fetchPosts({ category: ['face-brasileira', 'face-brasil-na-america', 'face-do-brasil'], limit: 1 }, supabase),
    fetchPosts({ category: ['imigracao', 'imigração'], limit: 1 }, supabase),
    fetchPosts({ category: ['aconteceu', 'eventos'], limit: 1 }, supabase),
    // Data for Tabs
    fetchPosts({ category: 'noticias', limit: 3 }, supabase),
    fetchPosts({ category: 'saude', limit: 3 }, supabase),
    fetchPosts({ category: 'bem-estar', limit: 3 }, supabase),
    fetchPosts({ category: 'estilo-de-vida', limit: 3 }, supabase),
    fetchPosts({ category: 'negocios', limit: 3 }, supabase),
    fetchPosts({ category: 'comunidade', limit: 3 }, supabase)
  ]);

  const tabsData = [
    { category: 'noticias', label: tNav('news'), posts: newsTab.data, href: '/category/noticias' },
    { category: 'saude', label: tNav('categories.health'), posts: healthTab.data, href: '/category/saude' },
    { category: 'bem-estar', label: tNav('categories.wellbeing'), posts: wellbeingTab.data, href: '/category/bem-estar' },
    { category: 'estilo-de-vida', label: tNav('categories.lifestyle'), posts: lifestyleTab.data, href: '/category/estilo-de-vida' },
    { category: 'negocios', label: tNav('categories.business'), posts: businessTab.data, href: '/category/negocios' },
    { category: 'comunidade', label: tNav('community'), posts: communityTab.data, href: '/category/comunidade' },
  ];

  const allLatest = latestData.data || [];
  const carouselPosts = featuredPosts.length > 0 ? featuredPosts : allLatest.slice(0, 5);
  const latestNews = allLatest.slice(0, 3);

  const popularPosts = popularData.data || [];
  const editorialPosts = editorialData.data || [];
  const fbrNewsPosts = fbrNewsData.data || [];

  const highlights = {
    face: highlightFaceData.data?.[0] || null,
    imigracao: highlightImigracaoData.data?.[0] || null,
    eventos: highlightEventosData.data?.[0] || null
  };

  return (
    <div className="flex flex-col min-h-screen dark:bg-slate-950 bg-slate-50 pt-[60px] lg:pt-[100px]">
      <AdSpace position="super_hero" className="mb-[20px] mx-auto" />
      <Hero post={mainHero} />
      <FeaturedCarousel posts={carouselPosts} />

      <div className="max-w-[1400px] mx-auto w-full px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
          <AdSpace position="column_1" />
          <AdSpace position="column_2" />
          <AdSpace position="column_3" />
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 py-16">
        {/* Main Column: Últimas Notícias */}
        <div className="lg:col-span-8 space-y-12">
          <section>
            <div className="flex items-end justify-between mb-8 border-b dark:border-white/10 border-gray-200 pb-4">
              <div>
                <span className="text-accent-yellow font-bold text-sm tracking-widest uppercase mb-2 block">{t('updates')}</span>
                <h2 className="text-3xl font-black dark:text-white text-gray-900 flex items-center gap-3">
                  <Clock className="w-8 h-8 dark:text-white text-gray-900" />
                  {t('latestNews')}
                </h2>
              </div>
            </div>

            <CategoryTabs initialData={tabsData} />

            {/* Infinite Feed Section */}
            <section className="mt-12">
              <div className="flex items-end justify-between mb-8 border-b dark:border-white/10 border-gray-200 pb-4">
                <div>
                  <span className="text-accent-yellow font-bold text-sm tracking-widest uppercase mb-2 block">Explorar</span>
                  <h2 className="text-2xl font-black dark:text-white text-gray-900 flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 dark:text-white text-gray-900" />
                    Mais Artigos
                  </h2>
                </div>
              </div>
              <InfiniteFeed
                initialArticles={allLatest.slice(3)}
                postsPerPage={6}
              />
            </section>

            {/* Destaques Section */}
            <div className="mt-12 pt-12 border-t dark:border-white/10 border-gray-200">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black dark:text-white text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary" />
                  {t('highlights')}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Face do Brasil */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{tNav('categories.faceBrasilInAmerica')}</span>
                    <Link href="/category/face-brasil-na-america" className="text-[10px] font-bold uppercase tracking-wider hover:underline text-slate-500">{t('viewMore')}</Link>
                  </div>
                  {highlights.face ? <ArticleCard article={highlights.face} /> : <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-xs text-slate-500">{t('waitingContent')}</div>}
                </div>

                {/* Imigração */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{tNav('categories.immigration')}</span>
                    <Link href="/category/imigracao" className="text-[10px] font-bold uppercase tracking-wider hover:underline text-slate-500">{t('viewMore')}</Link>
                  </div>
                  {highlights.imigracao ? <ArticleCard article={highlights.imigracao} /> : <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-xs text-slate-500">{t('waitingContent')}</div>}
                </div>

                {/* Eventos (Aconteceu) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{t('happened')}</span>
                    <Link href="/events" className="text-[10px] font-bold uppercase tracking-wider hover:underline text-slate-500">{t('agenda')}</Link>
                  </div>
                  {highlights.eventos ? <ArticleCard article={highlights.eventos} /> : <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-xs text-slate-500 border border-dashed dark:border-white/10 border-gray-200">{t('waitingContent')}</div>}
                </div>
              </div>
            </div>

            {/* Seção 'Ver Mais Notícias' removida pois já existe no CategoryTabs */}
          </section>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-12">
          {/* Sidebar Ad */}
          <AdSpace position="sidebar" className="mx-auto" />

          {/* FBR-News Headlines */}
          <section className="dark:bg-slate-900/50 bg-white rounded-3xl p-8 border dark:border-white/5 border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-black dark:text-white text-gray-900">FBR-News</h2>
              </div>
              <Link href="/fbr-news" className="text-[10px] font-bold uppercase text-primary hover:underline tracking-wider">{t('viewMore')}</Link>
            </div>

            <div className="flex flex-col gap-6">
              {fbrNewsPosts.map((post, index) => (
                <div key={post.id} className="group cursor-pointer">
                  <div className="flex gap-4 items-start">
                    <div className="space-y-2">
                      <h3 className="dark:text-white text-gray-900 font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 text-sm">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span className="capitalize">{formatDateAmerican(post.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                  {index < fbrNewsPosts.length - 1 && <div className="h-px dark:bg-white/5 bg-gray-100 w-full mt-6" />}
                </div>
              ))}
              {fbrNewsPosts.length === 0 && (
                <div className="text-center py-4 text-xs text-slate-500 italic">
                  {t('soon')}
                </div>
              )}
            </div>
          </section>

          {/* Sidebar: Mais Lidos */}
          <section className="dark:bg-slate-900/50 bg-white rounded-3xl p-8 border dark:border-white/5 border-gray-200 sticky top-24">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-6 h-6 text-accent-yellow" />
              <h2 className="text-xl font-black dark:text-white text-gray-900">{t('mostRead')}</h2>
            </div>

            <div className="flex flex-col gap-6">
              {popularPosts.map((post, index) => (
                <div key={post.id} className="group cursor-pointer">
                  <div className="flex gap-4 items-start">
                    <span className="text-4xl font-black text-slate-800 group-hover:text-slate-700 transition-colors pointer-events-none select-none">
                      {index + 1}
                    </span>
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">
                        {post.categories[0]}
                      </span>
                      <h3 className="dark:text-white text-gray-900 font-bold leading-tight group-hover:text-primary transition-colors line-clamp-3">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <BookOpen className="w-3 h-3" />
                        <span>{t('readTime', { time: post.readTime })}</span>
                      </div>
                    </div>
                  </div>
                  {index < popularPosts.length - 1 && <div className="h-px dark:bg-white/5 bg-gray-100 w-full mt-6" />}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <FBRNewsSection posts={fbrNewsPosts} />
      <EuReporterSection videos={videoReports} />

      <div className="max-w-[1400px] mx-auto px-6 pt-20 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <MailNewsletter />
          <EventsAgenda />
        </div>
      </div>
      <EditionsSection posts={editorialPosts} />

      <PricingSection />

      <div className="py-12 bg-slate-100 dark:bg-slate-900/50 flex justify-center">
        <AdSpace position="super_footer" />
      </div>
    </div>
  );
}
