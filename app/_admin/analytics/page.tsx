'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar,
  TrendingUp,
  Users,
  Eye,
  Clock,
  Share2,
  ThumbsUp
} from 'lucide-react';
import { AdminLayout } from './components/AdminLayout';
import { PositionChart, TrendComparisonChart } from './components/dashboard/Charts';

// Mock Data for Charts
const positionData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2026, 1, i + 1).toISOString(),
  value: 5 + Math.random() * 10,
}));

const trendData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2026, 1, i + 1).toISOString(),
  gscClicks: 500 + Math.random() * 300,
  gaSessions: 450 + Math.random() * 250,
}));

const topArticles = [
  { title: 'Como Imigrar Legalmente', views: 4521, change: 23 },
  { title: 'Custo de Vida em Miami', views: 3892, change: 15 },
  { title: 'Vida nos EUA: Expectativa vs Realidade', views: 3241, change: -5 },
  { title: 'Guia de Documentação', views: 2876, change: 8 },
  { title: 'Como Encontrar Trabalho', views: 2134, change: 12 },
];

const trafficSources = [
  { name: 'Google Orgânico', value: 68, color: 'bg-green-500' },
  { name: 'Direto', value: 20, color: 'bg-blue-500' },
  { name: 'Redes Sociais', value: 8, color: 'bg-purple-500' },
  { name: 'Referral', value: 4, color: 'bg-orange-500' },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500 mt-1">Métricas e desempenho da plataforma</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total de Views</p>
              <h3 className="text-2xl font-bold mt-1">45,231</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">+23.4%</span>
            <span className="text-sm text-gray-500">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Usuários Únicos</p>
              <h3 className="text-2xl font-bold mt-1">12,453</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">+18.2%</span>
            <span className="text-sm text-gray-500">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Tempo Médio</p>
              <h3 className="text-2xl font-bold mt-1">4m 32s</h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">+5.1%</span>
            <span className="text-sm text-gray-500">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Taxa de Rejeição</p>
              <h3 className="text-2xl font-bold mt-1">32.4%</h3>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
            <span className="text-sm text-red-600 font-medium">-2.3%</span>
            <span className="text-sm text-gray-500">vs mês anterior</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Tráfego Orgânico (GSC)</h2>
          <TrendComparisonChart data={trendData} height={300} />
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Posições Médias</h2>
          <PositionChart data={positionData} height={300} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Articles */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Artigos Mais Lidos</h2>
          <div className="space-y-4">
            {topArticles.map((article, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900">{article.title}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{article.views.toLocaleString()} views</span>
                  <span className={`text-sm font-medium ${article.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {article.change > 0 ? '+' : ''}{article.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Fontes de Tráfego</h2>
          <div className="space-y-4">
            {trafficSources.map((source, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">{source.name}</span>
                  <span className="font-bold text-gray-900">{source.value}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${source.color}`}
                    style={{ width: `${source.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
