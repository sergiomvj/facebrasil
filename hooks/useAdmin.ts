'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  fetchAdminArticles,
  fetchAdminStats,
  fetchCategoryStats,
  fetchRecentArticles,
  fetchComments,
  fetchAnalytics,
  fetchTopArticles,
  updateCommentStatus as updateCommentStatusService,
  AdminArticle,
  AdminStats,
  CategoryStats,
  Comment,
  AnalyticsData,
} from '@/lib/admin-service';

// Hook for admin stats
export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, loading, error, refresh };
}

// Hook for admin articles
export function useAdminArticles(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminArticles(params);
      setArticles(data.articles);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading articles');
    } finally {
      setLoading(false);
    }
  }, [params?.status, params?.search, params?.page, params?.limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { articles, total, loading, error, refresh };
}

// Hook for category stats
export function useCategoryStats() {
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategoryStats();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { categories, loading, error, refresh };
}

// Hook for recent articles
export function useRecentArticles(limit: number = 5) {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecentArticles(limit);
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading recent articles');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { articles, loading, error, refresh };
}

// Hook for comments
export function useComments(params?: {
  status?: 'pending' | 'approved' | 'rejected' | 'spam' | 'reported';
  page?: number;
  limit?: number;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchComments(params);
      setComments(data.comments);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading comments');
    } finally {
      setLoading(false);
    }
  }, [params?.status, params?.page, params?.limit]);

  const updateStatus = useCallback(async (commentId: string, status: 'approved' | 'rejected' | 'spam') => {
    const success = await updateCommentStatusService(commentId, status);
    if (success) {
      // Refresh the list after updating
      await refresh();
    }
    return success;
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { comments, total, loading, error, refresh, updateStatus };
}

// Hook for analytics
export function useAnalytics(days: number = 30) {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAnalytics(days);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading analytics');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

// Hook for top articles
export function useTopArticles(limit: number = 5) {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTopArticles(limit);
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading top articles');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { articles, loading, error, refresh };
}
