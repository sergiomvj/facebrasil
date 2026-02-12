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
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminLayout } from './components/AdminLayout';

// Mock Data
const stats = [
  {
    title: 'Total de Artigos',
    value: 156,
    change: 12,
    trend: 'up',
    icon: FileText,
    color: 'blue',
  },
  {
    title: 'Usuários Ativos',
    value: 2453,
    change: 8.5,
    trend: 'up',
    icon: Users,
    color: 'green',
  },
  {
    title: 'Visualizações (30d)',
    value: 45231,
    change: 23.4,
    trend: 'up',
    icon: Eye,
    color: 'purple',
  },
  {
    title: 'Taxa de Engajamento',
    value: '68.4%',
    change: -2.1,
    trend: 'down',
    icon: TrendingUp,
    color: 'orange',
  },
];

const recentArticles = [
  { id: 1, title: 'Como Imigrar Legalmente para os EUA em 2026', author: 'Maria Silva', status: 'published', views: 1234, date: '2026-02-10' },
  { id: 2, title: 'Guia Completo de Documentação de Imigração', author: 'João Santos', status: 'published', views: 892, date: '2026-02-09' },
  { id: 3, title: 'Dicas de Entrevista no Consulado Americano', author: 'Ana Costa', status: 'draft', views: 0, date: '2026-02-08' },
  { id: 4, title: 'Vida nos EUA: Expectativa vs Realidade', author: 'Pedro Oliveira', status: 'published', views: 2156, date: '2026-02-07' },
  { id: 5, title: 'Como Encontrar Trabalho nos EUA', author: 'Maria Silva', status: 'review', views: 0, date: '2026-02-06' },
];

const topCategories = [
  { name: 'Imigração', articles: 45, views: 15234, color: 'bg-blue-500' },
  { name: 'Vida nos EUA', articles: 38, views: 12890, color: 'bg-green-500' },
  { name: 'Trabalho', articles: 32, views: 9876, color: 'bg-purple-500' },
  { name: 'Documentação', articles: 28, views: 7654, color: 'bg-orange-500' },
  { name: 'Cidadania', articles: 13, views: 4567, color: 'bg-red-500' },
];

const recentActivity = [
  { user: 'Maria Silva', action: 'publicou', target: 'Como Imigrar Legalmente...', time: '2 horas atrás' },
  { user: 'João Santos', action: 'editou', target: 'Guia de Documentação', time: '4 horas atrás' },
  { user: 'Ana Costa', action: 'criou rascunho', target: 'Dicas de Entrevista', time: '6 horas atrás' },
  { user: 'Pedro Oliveira', action: 'comentou', target: 'Vida nos EUA', time: '8 horas atrás' },
];

const StatCard = ({ stat }: { stat: typeof stats[0] }) => {
  const Icon = stat.icon;
  const isPositive = stat.trend === 'up';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  
  const colorVariants = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
  };

  return (
    <div className={cn(
      "rounded-lg border p-6 transition-shadow hover:shadow-md",
      colorVariants[stat.color as keyof typeof colorVariants]
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-70">{stat.title}</p>
          <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
        </div>
        <div className="p-2 bg-white/50 rounded-lg">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-4">
        <TrendIcon className={cn(
          "w-4 h-4",
          isPositive ? "text-green-600" : "text-red-600"
        )} />
        <span className={cn(
          "text-sm font-medium",
          isPositive ? "text-green-600" : "text-red-600"
        )}>
          {isPositive ? '+' : ''}{stat.change}%
        </span>
        <span className="text-sm opacity-60">vs mês anterior</span>
      </div>
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
      variants[status as keyof typeof variants]
    )}>
      {labels[status as keyof typeof labels]}
    </span>
  );
};

export default function AdminDashboard() {
  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral do desempenho da plataforma</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
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
          
          <div className="divide-y divide-gray-200">
            {recentArticles.map((article) => (
              <div key={article.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{article.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Por {article.author} • {article.date}
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
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Top Categories */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Categorias Populares</h2>
            <div className="space-y-4">
              {topCategories.map((category, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", category.color)} />
                      <span className="font-medium text-sm">{category.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {category.views.toLocaleString()} views
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={cn("h-2 rounded-full", category.color)}
                      style={{ width: `${(category.views / 15234) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {category.articles} artigos
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Atividade Recente</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>
                      {' '}{activity.action}{' '}
                      <span className="font-medium text-gray-900">{activity.target}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
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
