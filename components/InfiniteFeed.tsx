'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArticleCard from './ArticleCard';
import { supabase } from '@/lib/supabase';
import { Loader2, RefreshCw } from 'lucide-react';
import { BlogPost } from '@/lib/fbr-types';
import { mapRowToBlogPost } from '@/lib/blog-service';



interface InfiniteFeedProps {
  initialArticles: BlogPost[];
  category?: string;
  excludeIds?: string[];
  postsPerPage?: number;
}

export default function InfiniteFeed({
  initialArticles,
  category,
  excludeIds = [],
  postsPerPage = 6
}: InfiniteFeedProps) {
  const [articles, setArticles] = useState<BlogPost[]>(initialArticles);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadMoreArticles = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const excludeIdList = [...excludeIds, ...articles.map(a => a.id)];

      let query = supabase
        .from('articles')
        .select(`
          *,
          category:categories(name, slug),
          author:profiles(name, avatar_url)
        `)
        .eq('status', 'PUBLISHED')
        .not('id', 'in', `(${excludeIdList.join(',')})`)
        .order('created_at', { ascending: false })
        .range(page * postsPerPage, (page + 1) * postsPerPage - 1);

      if (category) {
        query = query.eq('category.slug', category);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        throw supabaseError;
      }

      const newArticles = (data || []).map(row => mapRowToBlogPost(row));

      if (newArticles.length === 0) {
        setHasMore(false);
      } else {
        setArticles(prev => [...prev, ...newArticles]);
        setPage(prev => prev + 1);
      }
    } catch (err) {
      console.error('[InfiniteFeed] Error loading articles:', err);
      setError('Erro ao carregar mais artigos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [articles, category, excludeIds, loading, hasMore, page, postsPerPage]);

  // Intersection Observer setup
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreArticles();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreArticles, hasMore, loading]);

  const handleRetry = () => {
    setError(null);
    loadMoreArticles();
  };

  return (
    <div className="space-y-8">
      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.4,
                delay: index < initialArticles.length ? 0 : (index % postsPerPage) * 0.1
              }}
              layout
            >
              <ArticleCard article={article} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Load More Trigger */}
      <div
        ref={loadMoreRef}
        className="flex flex-col items-center justify-center py-12"
      >
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-slate-400 text-sm">Carregando mais artigos...</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar novamente
            </button>
          </motion.div>
        )}

        {!hasMore && articles.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-500 text-sm"
          >
            Você chegou ao fim! 🎉
          </motion.p>
        )}
      </div>
    </div>
  );
}
