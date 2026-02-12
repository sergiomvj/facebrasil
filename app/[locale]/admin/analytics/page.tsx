'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Users,
  Eye,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MousePointer
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AnalyticsData {
  viewsOverTime: { date: string; views: number }[];
  articlesByCategory: { name: string; count: number }[];
  topArticles: { title: string; views: number; slug: string }[];
  stats: {
    totalViews: number;
    totalArticles: number;
    avgTimeOnPage: number;
    bounceRate: number;
    viewsChange: number;
    articlesChange: number;
  };
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      // Calcular data de início baseada no período
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Buscar artigos com views
      const { data: articles } = await supabase
        .from('articles')
        .select('id, title, slug, views, created_at, category:categories(name)')
        .gte('created_at', startDate.toISOString())
        .order('views', { ascending: false });

      // Dados mockados para visualização (em produção viriam de tabela analytics)
      const mockViewsOverTime = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        return {
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          views: Math.floor(Math.random() * 1000) + 500
        };
      });

      // Agrupar por categoria
      const categoryMap = new Map<string, number>();
      articles?.forEach((article: any) => {
        const catName = article.category?.name || 'Sem categoria';
        categoryMap.set(catName, (categoryMap.get(catName) || 0) + 1);
      });

      const articlesByCategory = Array.from(categoryMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      // Top artigos
      const topArticles = articles?.slice(0, 5).map((a: any) => ({
        title: a.title,
        views: a.views || 0,
        slug: a.slug
      })) || [];

      // Estatísticas
      const totalViews = articles?.reduce((sum, a: any) => sum + (a.views || 0), 0) || 0;
      const totalArticles = articles?.length || 0;

      setData({
        viewsOverTime: mockViewsOverTime,
        articlesByCategory,
        topArticles,
        stats: {
          totalViews,
          totalArticles,
          avgTimeOnPage: 3.5,
          bounceRate: 45,
          viewsChange: 23,
          articlesChange: 12
        }
      });
    } catch (error) {
      console.error('[Analytics] Error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Analytics</h1>
          <p className="text-slate-400">Métricas e estatísticas do portal</p>
        </div>

        {/* Period Selector */}
        <div className="flex bg-slate-900 rounded-lg p-1">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${period === p
                ? 'bg-primary text-white'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Visualizações Totais"
          value={data.stats.totalViews.toLocaleString()}
          change={data.stats.viewsChange}
          icon={Eye}
          color="blue"
        />
        <StatCard
          title="Artigos Publicados"
          value={data.stats.totalArticles.toString()}
          change={data.stats.articlesChange}
          icon={FileText}
          color="green"
        />
        <StatCard
          title="Tempo Médio"
          value={`${data.stats.avgTimeOnPage}min`}
          change={-5}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Taxa de Rejeição"
          value={`${data.stats.bounceRate}%`}
          change={-8}
          icon={MousePointer}
          color="red"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 rounded-2xl p-6 border border-white/5"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Visualizações ao Longo do Tempo
            </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.viewsOverTime}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorViews)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Articles by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 rounded-2xl p-6 border border-white/5"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-400" />
              Artigos por Categoria
            </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.articlesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {data.articlesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: any, name: any) => [`${value} artigos`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {data.articlesByCategory.map((cat, index) => (
              <div key={cat.name} className="flex items-center gap-1 text-xs">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-slate-400">{cat.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Articles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900 rounded-2xl p-6 border border-white/5"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-400" />
            Artigos Mais Lidos
          </h3>
        </div>

        <div className="space-y-4">
          {data.topArticles.map((article, index) => (
            <div
              key={article.slug}
              className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                  index === 1 ? 'bg-slate-400/20 text-slate-300' :
                    index === 2 ? 'bg-orange-600/20 text-orange-400' :
                      'bg-slate-700 text-slate-400'
                  }`}>
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium text-white">{article.title}</h4>
                  <p className="text-sm text-slate-400">/{article.slug}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">{article.views.toLocaleString()}</p>
                <p className="text-xs text-slate-400">visualizações</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color
}: {
  title: string;
  value: string;
  change: number;
  icon: any;
  color: 'blue' | 'green' | 'yellow' | 'red';
}) {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    red: 'bg-red-500/10 text-red-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900 rounded-2xl p-6 border border-white/5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-black text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className={`flex items-center gap-1 mt-4 text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
        {change >= 0 ? (
          <ArrowUpRight className="w-4 h-4" />
        ) : (
          <ArrowDownRight className="w-4 h-4" />
        )}
        <span className="font-medium">{Math.abs(change)}%</span>
        <span className="text-slate-500 ml-1">vs período anterior</span>
      </div>
    </motion.div>
  );
}
