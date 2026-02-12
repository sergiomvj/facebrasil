import { supabaseAdmin } from '@/lib/supabase-admin';
import { supabase } from '@/lib/supabase';

// Types for admin data
export interface AdminArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: 'published' | 'draft' | 'review' | 'archived';
  author: {
    id: string;
    name: string;
    email: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  views: number;
  likes: number;
  comments_count: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface AdminStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalUsers: number;
  activeUsers: number;
  totalViews: number;
  totalComments: number;
  viewsChange: number;
  usersChange: number;
  engagementRate: number;
  engagementChange: number;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  article: {
    id: string;
    title: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  created_at: string;
  report_reason?: string;
  reported_by?: string;
}

export interface CategoryStats {
  id: string;
  name: string;
  slug: string;
  article_count: number;
  total_views: number;
}

export interface AnalyticsData {
  date: string;
  views: number;
  unique_visitors: number;
  avg_session_duration: number;
  bounce_rate: number;
}

// Fetch all articles for admin (includes drafts)
export async function fetchAdminArticles(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ articles: AdminArticle[]; total: number }> {
  try {
    let query = supabaseAdmin
      .from('articles')
      .select(`
        *,
        author:profiles(id, name, email),
        category:categories(id, name, slug)
      `, { count: 'exact' });

    // Filter by status
    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }

    // Search by title
    if (params?.search) {
      query = query.ilike('title', `%${params.search}%`);
    }

    // Sort by created date
    query = query.order('created_at', { ascending: false });

    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching admin articles:', error);
      return { articles: [], total: 0 };
    }

    const articles: AdminArticle[] = (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      status: row.status?.toLowerCase() || 'draft',
      author: row.author || { id: '', name: 'Unknown', email: '' },
      category: row.category || { id: '', name: 'Uncategorized', slug: '' },
      views: row.views || 0,
      likes: row.likes || 0,
      comments_count: row.comments_count || 0,
      featured: row.featured || false,
      created_at: row.created_at,
      updated_at: row.updated_at,
      published_at: row.published_at,
    }));

    return { articles, total: count || 0 };
  } catch (error) {
    console.error('Error in fetchAdminArticles:', error);
    return { articles: [], total: 0 };
  }
}

// Fetch admin dashboard stats
export async function fetchAdminStats(): Promise<AdminStats> {
  try {
    // Get article counts
    const { data: articleStats, error: articleError } = await supabaseAdmin
      .from('articles')
      .select('status, views');

    if (articleError) throw articleError;

    const totalArticles = articleStats?.length || 0;
    const publishedArticles = articleStats?.filter(a => 
      a.status?.toLowerCase() === 'published'
    ).length || 0;
    const draftArticles = articleStats?.filter(a => 
      a.status?.toLowerCase() === 'draft'
    ).length || 0;
    const totalViews = articleStats?.reduce((acc, a) => acc + (a.views || 0), 0) || 0;

    // Get user counts
    const { count: totalUsers, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (userError) throw userError;

    // Get active users (logged in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: activeUsers, error: activeError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', thirtyDaysAgo.toISOString());

    if (activeError) throw activeError;

    // Get comments count
    const { count: totalComments, error: commentError } = await supabaseAdmin
      .from('comments')
      .select('*', { count: 'exact', head: true });

    if (commentError) throw commentError;

    // Calculate changes (mock for now, would need historical data)
    const viewsChange = 23.4;
    const usersChange = 8.5;
    const engagementRate = 68.4;
    const engagementChange = -2.1;

    return {
      totalArticles,
      publishedArticles,
      draftArticles,
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalViews,
      totalComments: totalComments || 0,
      viewsChange,
      usersChange,
      engagementRate,
      engagementChange,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      totalArticles: 0,
      publishedArticles: 0,
      draftArticles: 0,
      totalUsers: 0,
      activeUsers: 0,
      totalViews: 0,
      totalComments: 0,
      viewsChange: 0,
      usersChange: 0,
      engagementRate: 0,
      engagementChange: 0,
    };
  }
}

// Fetch category stats
export async function fetchCategoryStats(): Promise<CategoryStats[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select(`
        id,
        name,
        slug,
        articles:articles(count)
      `);

    if (error) throw error;

    // Get views per category
    const { data: articleData, error: articleError } = await supabaseAdmin
      .from('articles')
      .select('category_id, views');

    if (articleError) throw articleError;

    // Calculate views per category
    const viewsByCategory: Record<string, number> = {};
    articleData?.forEach((article: any) => {
      if (article.category_id) {
        viewsByCategory[article.category_id] = (viewsByCategory[article.category_id] || 0) + (article.views || 0);
      }
    });

    return (data || []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      article_count: cat.articles?.[0]?.count || 0,
      total_views: viewsByCategory[cat.id] || 0,
    })).sort((a, b) => b.total_views - a.total_views);
  } catch (error) {
    console.error('Error fetching category stats:', error);
    return [];
  }
}

// Fetch recent articles
export async function fetchRecentArticles(limit: number = 5): Promise<AdminArticle[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select(`
        *,
        author:profiles(id, name, email),
        category:categories(id, name, slug)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      status: row.status?.toLowerCase() || 'draft',
      author: row.author || { id: '', name: 'Unknown', email: '' },
      category: row.category || { id: '', name: 'Uncategorized', slug: '' },
      views: row.views || 0,
      likes: row.likes || 0,
      comments_count: row.comments_count || 0,
      featured: row.featured || false,
      created_at: row.created_at,
      updated_at: row.updated_at,
      published_at: row.published_at,
    }));
  } catch (error) {
    console.error('Error fetching recent articles:', error);
    return [];
  }
}

// Fetch comments for moderation
export async function fetchComments(params?: {
  status?: 'pending' | 'approved' | 'rejected' | 'spam' | 'reported';
  page?: number;
  limit?: number;
}): Promise<{ comments: Comment[]; total: number }> {
  try {
    let query = supabaseAdmin
      .from('comments')
      .select(`
        *,
        author:profiles(id, name, email),
        article:articles(id, title)
      `, { count: 'exact' });

    // Filter by status
    if (params?.status && params.status !== 'all') {
      if (params.status === 'reported') {
        query = query.eq('is_reported', true);
      } else {
        query = query.eq('status', params.status);
      }
    }

    // Sort by created date
    query = query.order('created_at', { ascending: false });

    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching comments:', error);
      return { comments: [], total: 0 };
    }

    const comments: Comment[] = (data || []).map((row: any) => ({
      id: row.id,
      content: row.content,
      author: row.author || { id: '', name: 'Unknown', email: '' },
      article: row.article || { id: '', title: 'Unknown Article' },
      status: row.status || 'pending',
      created_at: row.created_at,
      report_reason: row.report_reason,
      reported_by: row.reported_by,
    }));

    return { comments, total: count || 0 };
  } catch (error) {
    console.error('Error in fetchComments:', error);
    return { comments: [], total: 0 };
  }
}

// Update comment status
export async function updateCommentStatus(
  commentId: string, 
  status: 'approved' | 'rejected' | 'spam'
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('comments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', commentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating comment status:', error);
    return false;
  }
}

// Fetch analytics data
export async function fetchAnalytics(days: number = 30): Promise<AnalyticsData[]> {
  try {
    // This would typically come from an analytics table or external service
    // For now, returning mock data structured for the chart
    const data: AnalyticsData[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 2000) + 500,
        unique_visitors: Math.floor(Math.random() * 1500) + 300,
        avg_session_duration: Math.floor(Math.random() * 300) + 120,
        bounce_rate: Math.random() * 40 + 30,
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return [];
  }
}

// Fetch top articles by views
export async function fetchTopArticles(limit: number = 5): Promise<AdminArticle[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select(`
        *,
        author:profiles(id, name, email),
        category:categories(id, name, slug)
      `)
      .order('views', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      status: row.status?.toLowerCase() || 'draft',
      author: row.author || { id: '', name: 'Unknown', email: '' },
      category: row.category || { id: '', name: 'Uncategorized', slug: '' },
      views: row.views || 0,
      likes: row.likes || 0,
      comments_count: row.comments_count || 0,
      featured: row.featured || false,
      created_at: row.created_at,
      updated_at: row.updated_at,
      published_at: row.published_at,
    }));
  } catch (error) {
    console.error('Error fetching top articles:', error);
    return [];
  }
}
