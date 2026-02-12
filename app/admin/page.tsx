'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Users, 
  Eye, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  Clock,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminLayout } from './components/AdminLayout';
import { useAdminStats, useRecentArticles, useCategoryStats } from '@/hooks/useAdmin';

const StatCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  color,
  loading 
}: { 
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange';
  loading?: boolean;
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
        <div className="h-8 bg-gray-200 rounded w-32" />
      </div>
    );
  }

  const isPositive = change && change > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  
  const colorVariants = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
  };

  return (
    <div className={cn(
      "rounded-lg border p-6 transition-shadow hover:shadow-md",
      colorVariants[color]
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-70">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
        </div>
        <div className="p-2 bg-white/50 rounded-lg">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-2 mt-4">
          <TrendIcon className={cn(
            "w-4 h-4",
            isPositive ? "text-green-600" : "text-red-600"
          )} />
          <span className={cn(
            "text-sm font-medium",
            isPositive ? "text-green-600" : "text-red-600"
          )}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-sm opacity-60">vs mês anterior</span>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    published: 'bg-green-100 text-green-700 border-green-200',
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
    review: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  const labels = {
    published: 'Publicado',
    draft: 'Rascunho',
    review: 'Em Revisão',
  };

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-medium border",
      variants[status as keyof typeof variants] || variants.draft
    )}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
};

export default function AdminDashboard() {
  const { stats, loading: statsLoading } = useAdminStats();
  const { articles: recentArticles, loading: articlesLoading } = useRecentArticles(5);
  const { categories, loading: categoriesLoading } = useCategoryStats();

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral do desempenho da plataforma</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total de Artigos"
          value={stats?.totalArticles || 0}
          change={12}
          trend="up"
          icon={FileText}
          color="blue"
          loading={statsLoading}
        />
        <StatCard
          title="Usuários Ativos"
          value={stats?.activeUsers?.toLocaleString() || 0}
          change={8.5}
          trend="up"
          icon={Users}
          color="green"
          loading={statsLoading}
        />
        <StatCard
          title="Visualizações (30d)"
          value={stats?.totalViews?.toLocaleString() || 0}
          change={23.4}
          trend="up"
          icon={Eye}
          color="purple"
          loading={statsLoading}
        />
        <StatCard
          title="Taxa de Engajamento"
          value={`${stats?.engagementRate || 0}%`}
          change={stats?.engagementChange}
          trend={stats?.engagementChange && stats.engagementChange > 0 ? 'up' : 'down'}
          icon={TrendingUp}
          color="orange"
          loading={statsLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Articles */}
        <div className="lg:col-span-2 bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Artigos Recentes</h2>
              <Link 
                href="/admin/articles" 
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                Ver todos
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          {articlesLoading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentArticles.map((article) => (
                <div key={article.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{article.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Por {article.author?.name || 'Unknown'} • {new Date(article.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <StatusBadge status={article.status} />
                      {article.views > 0 && (
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {article.views.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Top Categories */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Categorias Populares</h2>
            {categoriesLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-4">
                {categories.slice(0, 5).map((category, index) => (
                  <div key={category.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'][index]
                        )} />
                        <span className="font-medium text-sm">{category.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {category.total_views.toLocaleString()} views
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full",
                          ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'][index]
                        )}
                        style={{ 
                          width: `${Math.min(100, (category.total_views / (categories[0]?.total_views || 1)) * 100)}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {category.article_count} artigos
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-sm p-6 text-white">
            <h2 className="text-lg font-semibold mb-2">Ações Rápidas</h2>
            <p className="text-red-100 text-sm mb-4">
              Gerencie seu conteúdo e acompanhe métricas
            </p>
            <div className="space-y-2">
              <Link 
                href="/admin/articles/new"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Novo Artigo</span>
              </Link>
              <Link 
                href="/admin/analytics"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Ver Analytics</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
