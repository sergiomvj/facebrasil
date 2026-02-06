import React from 'react';
import Hero from '@/components/Hero';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import ArticleCard from '@/components/ArticleCard';
import MailNewsletter from '@/components/MailNewsletter';
import EventsAgenda from '@/components/EventsAgenda';
import EuReporterSection from '@/components/EuReporterSection';
import EditionsSection from '@/components/EditionsSection';
import FBRNewsSection from '@/components/FBRNewsSection';
import { fetchPosts, fetchFeaturedPosts, fetchVideoReports, fetchMainHero } from '@/lib/blog-service';
import Link from 'next/link';
import { TrendingUp, Clock, BookOpen } from 'lucide-react';

import AdSpace from '@/components/AdSpace';

// Force dynamic revalidation
export const revalidate = 60;

export default async function Home() {
  // Fetch Latest, Popular, Editorial, Featured (Highlights), Video Reports, and Main Hero
  // Highlights Categories for "Destaques": Face do Brasil, Imigração, Eventos (Aconteceu)
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
    highlightEventosData
  ] = await Promise.all([
    fetchPosts({
      limit: 8,
      category: ['noticias', 'saude', 'bem-estar', 'estilo-de-vida', 'negocios', 'comunidade']
    }),
    fetchPosts({ limit: 3, sort: 'popular' }),
    fetchPosts({ category: ['editorial', 'opiniao', 'opinião'], limit: 3 }),
    fetchPosts({ category: 'fbr-news', limit: 6 }),
    fetchFeaturedPosts(),
    fetchVideoReports(),
    fetchMainHero(),
    fetchPosts({ category: ['face-brasileira', 'face-brasil-na-america', 'face-do-brasil'], limit: 1 }),
    fetchPosts({ category: ['imigracao', 'imigração'], limit: 1 }),
    fetchPosts({ category: ['aconteceu', 'eventos'], limit: 1 })
  ]);

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
    <div className="flex flex-col min-h-screen dark:bg-slate-950 bg-slate-50 pt-[100px]">
      <AdSpace position="banner_top" className="mb-[20px] max-w-[1024px] h-[150px] mx-auto w-full" />
      <Hero post={mainHero} />
      <AdSpace position="home_hero" className="max-w-[1400px] mx-auto -mt-8 mb-12 relative z-20" />
      <FeaturedCarousel posts={carouselPosts} />

      <div className="max-w-[1400px] mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 py-16">
        {/* Main Column: Últimas Notícias */}
        <div className="lg:col-span-8 space-y-12">
          <section>
            <div className="flex items-end justify-between mb-8 border-b dark:border-white/10 border-gray-200 pb-4">
              <div>
                <span className="text-accent-yellow font-bold text-sm tracking-widest uppercase mb-2 block">Atualizações</span>
                <h2 className="text-3xl font-black dark:text-white text-gray-900 flex items-center gap-3">
                  <Clock className="w-8 h-8 dark:text-white text-gray-900" />
                  Mais Recentes
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestNews.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Advertising Columns - Below Latest News */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 mb-8">
              <AdSpace position="column_middle" />
              <AdSpace position="column_middle" />
              <AdSpace position="column_middle" />
            </div>

            {/* Advertising Columns - Below Latest News */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 mb-8">
              <AdSpace position="column_middle" />
              <AdSpace position="column_middle" />
              <AdSpace position="column_middle" />
            </div>

            {/* Advertising Columns - Below Latest News */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 mb-8">
              <AdSpace position="column_middle" />
              <AdSpace position="column_middle" />
              <AdSpace position="column_middle" />
            </div>

            {/* Destaques Section */}
            <div className="mt-12 pt-12 border-t dark:border-white/10 border-gray-200">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black dark:text-white text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary" />
                  Destaques
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Face do Brasil */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Face do Brasil</span>
                    <Link href="/category/face-brasil-na-america" className="text-[10px] font-bold uppercase tracking-wider hover:underline text-slate-500">Ver Mais</Link>
                  </div>
                  {highlights.face ? <ArticleCard article={highlights.face} /> : <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-xs text-slate-500">Aguardando conteúdo...</div>}
                </div>

                {/* Imigração */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Imigração</span>
                    <Link href="/category/imigracao" className="text-[10px] font-bold uppercase tracking-wider hover:underline text-slate-500">Ver Mais</Link>
                  </div>
                  {highlights.imigracao ? <ArticleCard article={highlights.imigracao} /> : <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-xs text-slate-500">Aguardando conteúdo...</div>}
                </div>

                {/* Eventos (Aconteceu) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Aconteceu</span>
                    <Link href="/events" className="text-[10px] font-bold uppercase tracking-wider hover:underline text-slate-500">Agenda</Link>
                  </div>
                  {highlights.eventos ? <ArticleCard article={highlights.eventos} /> : <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-xs text-slate-500 border border-dashed dark:border-white/10 border-gray-200">Aguardando conteúdo...</div>}
                </div>
              </div>
            </div>

            {/* Advertising Columns - Below Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 mb-8">
              <AdSpace position="column_middle" />
              <AdSpace position="column_middle" />
              <AdSpace position="column_middle" />
            </div>

            <div className="mt-12 text-center">
              <Link href="/category/noticias">
                <button className="px-8 py-3 rounded-full border dark:border-white/10 border-gray-300 dark:hover:bg-white/5 hover:bg-gray-100 dark:text-white text-gray-900 font-bold transition-all hover:scale-105 active:scale-95 text-sm uppercase tracking-wider">
                  Ver Mais Notícias
                </button>
              </Link>
            </div>
          </section>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-12">
          {/* FBR-News Headlines */}
          <section className="dark:bg-slate-900/50 bg-white rounded-3xl p-8 border dark:border-white/5 border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-black dark:text-white text-gray-900">FBR-News</h2>
              </div>
              <Link href="/fbr-news" className="text-[10px] font-bold uppercase text-primary hover:underline tracking-wider">Ver Mais</Link>
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
                        <span className="capitalize">{new Date(post.publishedAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  {index < fbrNewsPosts.length - 1 && <div className="h-px dark:bg-white/5 bg-gray-100 w-full mt-6" />}
                </div>
              ))}
              {fbrNewsPosts.length === 0 && (
                <div className="text-center py-4 text-xs text-slate-500 italic">
                  Novas atualizações em breve...
                </div>
              )}
            </div>
          </section>

          {/* Sidebar: Mais Lidos */}
          <section className="dark:bg-slate-900/50 bg-white rounded-3xl p-8 border dark:border-white/5 border-gray-200 sticky top-24">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-6 h-6 text-accent-yellow" />
              <h2 className="text-xl font-black dark:text-white text-gray-900">Mais Lidos</h2>
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
                        <span>{post.readTime} min leitura</span>
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

      {/* Super Footer Ad */}
      <div className="py-12 bg-slate-100 dark:bg-slate-900/50">
        <AdSpace position="super_footer" />
      </div>

      {/* Super Footer Ad */}
      <div className="py-12 bg-slate-100 dark:bg-slate-900/50">
        <AdSpace position="super_footer" />
      </div>

      {/* Super Footer Ad */}
      <div className="py-12 bg-slate-100 dark:bg-slate-900/50">
        <AdSpace position="super_footer" />
      </div>
    </div>
  );
}
