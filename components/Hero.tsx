import React from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/fbr-types';
import { FALLBACK_ARTICLE_IMAGE } from '@/lib/constants';

interface HeroProps {
  post: BlogPost | null;
}

const Hero: React.FC<HeroProps> = ({ post }) => {
  if (!post) {
    // Optional: Render a fallback skeleton or empty state if strictly needed,
    // but returning null is fine if the parent handles layout shifting.
    // However, usually it's better to show a skeleton or nothing.
    return null;
  }

  // Fallback image source if featuredImage is missing or empty
  const imageUrl = post.featuredImage?.url || FALLBACK_ARTICLE_IMAGE;

  // Categories fallback
  const categoryName = post.categories?.[0] || 'Destaque';

  return (
    <section className="w-full pt-0 pb-6 px-4 md:pb-10 md:px-6">

      {/* Mobile Layout (Card 500px) */}
      <div className="md:hidden w-full h-[500px] relative rounded-3xl overflow-hidden shadow-2xl group">
        <img
          src={imageUrl}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col items-start gap-4">
          <span className="px-3 py-1 rounded-full bg-blue-600/80 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
            {categoryName}
          </span>
          <Link href={`/article/${post.slug}`}>
            <h1 className="text-3xl font-black leading-tight text-white tracking-tight line-clamp-3 hover:text-blue-400 transition-colors">
              {post.title}
            </h1>
          </Link>
          <div className="flex items-center gap-3 w-full text-slate-300 text-xs font-medium">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> {post.readTime} min leitura</span>
            <span>•</span>
            <span>Por {post.author.name}</span>
          </div>
          <Link href={`/article/${post.slug}`} className="w-full">
            <button className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold mt-2 shadow-lg active:scale-95 transition-transform">
              Ler Matéria
            </button>
          </Link>
        </div>
      </div>

      {/* Desktop Layout (Original) */}
      <div className="hidden md:flex max-w-[1280px] mx-auto bg-slate-800 rounded-3xl p-16 items-center gap-10 shadow-2xl border border-slate-700">
        <div className="flex-1 space-y-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-600/20 text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
            {categoryName} do Dia
          </span>
          <Link href={`/article/${post.slug}`}>
            <h1 className="text-4xl lg:text-6xl font-black leading-tight text-white tracking-tight hover:text-blue-400 transition-colors cursor-pointer">
              {post.title}
            </h1>
          </Link>
          <p className="text-slate-100/90 text-lg leading-relaxed max-w-xl line-clamp-3">
            {post.excerpt}
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-4 pt-4">
            <Link href={`/article/${post.slug}`}>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-600/20 active:scale-95">
                Ler Matéria
              </button>
            </Link>
            <div className="flex items-center gap-2 px-4 py-4">
              <div className="w-8 h-8 rounded-full bg-slate-600 overflow-hidden">
                {post.author.avatar ? (
                  <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <span className="text-slate-300 text-sm">Por <span className="text-white font-bold">{post.author.name}</span></span>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full relative h-[400px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700/50 group">
          <Link href={`/article/${post.slug}`}>
            <img
              src={imageUrl}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 transform group-hover:scale-105"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
