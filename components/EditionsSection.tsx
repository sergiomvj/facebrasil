import React from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/fbr-types';
import { ArrowRight } from 'lucide-react';
import ArticleCard from './ArticleCard';

interface EditionsSectionProps {
  posts: BlogPost[];
}

const EditionsSection: React.FC<EditionsSectionProps> = ({ posts }) => {
  return (
    <section className="max-w-[1400px] mx-auto px-6 pt-8 pb-16">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="text-3xl font-black dark:text-white text-gray-900 tracking-tight mb-2">Opinião</h2>
          <div className="h-1.5 w-20 bg-primary rounded-full"></div>
        </div>
        <Link href="/category/editorial" className="text-primary text-sm font-bold flex items-center gap-1 hover:underline group">
          Ver Todas <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.map((post) => (
          <ArticleCard key={post.id} article={post} />
        ))}
        {posts.length === 0 && (
          <div className="col-span-3 text-center py-10 dark:text-slate-500 text-gray-400 border border-dashed dark:border-white/10 border-gray-200 rounded-3xl bg-slate-100/50 dark:bg-white/5">
            Nenhuma mensagem encontrada.
          </div>
        )}
      </div>
    </section>
  );
};

export default EditionsSection;
