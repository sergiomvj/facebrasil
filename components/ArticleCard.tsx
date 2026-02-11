import React from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/fbr-types';
import { FALLBACK_ARTICLE_IMAGE } from '@/lib/constants';

interface ArticleCardProps {
  article: BlogPost;
  featured?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <Link href={`/article/${article.slug}`} className="group cursor-pointer block h-full">
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-5">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url('${article.featuredImage?.url || FALLBACK_ARTICLE_IMAGE}')` }}
        ></div>
        <div className="absolute top-4 left-4">
          <span className="glass-card px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-accent-yellow border-accent-yellow/30">
            {article.categories[0] || 'Uncategorized'}
          </span>
        </div>
        {article.source_type === 'automated' && (
          <div className="absolute bottom-2 right-2 bg-slate-950/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-black text-white/50 uppercase tracking-tighter border border-white/5 group-hover:text-primary group-hover:border-primary/30 transition-all">
            AI Enhanced
          </div>
        )}
      </div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors leading-snug dark:text-white text-gray-900">
        {article.title}
      </h3>
      <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
        {article.excerpt}
      </p>
      <div className="flex items-center gap-3">
        {article.author.avatar && (
          <div
            className="w-8 h-8 rounded-full bg-cover border border-white/10"
            style={{ backgroundImage: `url('${article.author.avatar}')` }}
          ></div>
        )}
        <span className="text-xs font-semibold text-slate-500">
          {article.author.name} • {article.readTime} min read
        </span>
      </div>
    </Link>
  );
};

export default ArticleCard;
