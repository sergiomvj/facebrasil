
import React from 'react';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-5">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
          style={{ backgroundImage: `url('${article.image}')` }}
        ></div>
        <div className="absolute top-4 left-4">
          <span className="glass-card px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-accent-yellow border-accent-yellow/30">
            {article.category}
          </span>
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors leading-snug text-white">
        {article.title}
      </h3>
      <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
        {article.excerpt}
      </p>
      <div className="flex items-center gap-3">
        <div 
          className="w-8 h-8 rounded-full bg-cover border border-white/10" 
          style={{ backgroundImage: `url('${article.author.avatar}')` }}
        ></div>
        <span className="text-xs font-semibold text-slate-500">
          {article.author.name} • {article.readTime}
        </span>
      </div>
    </div>
  );
};

export default ArticleCard;
