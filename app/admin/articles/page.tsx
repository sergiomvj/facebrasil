'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminLayout } from './components/AdminLayout';

// Mock Data
const mockArticles = [
  { 
    id: 1, 
    title: 'Como Imigrar Legalmente para os EUA em 2026', 
    author: 'Maria Silva',
    category: 'Imigração',
    status: 'published',
    views: 1234,
    likes: 89,
    comments: 23,
    date: '2026-02-10',
    featured: true,
  },
  { 
    id: 2, 
    title: 'Guia Completo de Documentação de Imigração', 
    author: 'João Santos',
    category: 'Documentação',
    status: 'published',
    views: 892,
    likes: 67,
    comments: 15,
    date: '2026-02-09',
    featured: false,
  },
  { 
    id: 3, 
    title: 'Dicas de Entrevista no Consulado Americano', 
    author: 'Ana Costa',
    category: 'Imigração',
    status: 'draft',
    views: 0,
    likes: 0,
    comments: 0,
    date: '2026-02-08',
    featured: false,
  },
  { 
    id: 4, 
    title: 'Vida nos EUA: Expectativa vs Realidade', 
    author: 'Pedro Oliveira',
    category: 'Vida nos EUA',
    status: 'published',
    views: 2156,
    likes: 156,
    comments: 45,
    date: '2026-02-07',
    featured: true,
  },
  { 
    id: 5, 
    title: 'Como Encontrar Trabalho nos EUA', 
    author: 'Maria Silva',
    category: 'Trabalho',
    status: 'review',
    views: 0,
    likes: 0,
    comments: 0,
    date: '2026-02-06',
    featured: false,
  },
  { 
    id: 6, 
    title: 'Custo de Vida em Miami 2026', 
    author: 'Carlos Lima',
    category: 'Vida nos EUA',
    status: 'published',
    views: 3421,
    likes: 234,
    comments: 67,
    date: '2026-02-05',
    featured: true,
  },
];

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    published: 'bg-green-100 text-green-700 border-green-200',
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
    review: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  const icons = {
    published: CheckCircle,
    draft: Clock,
    review: Clock,
  };

  const labels = {
    published: 'Publicado',
    draft: 'Rascunho',
    review: 'Em Revisão',
  };

  const Icon = icons[status as keyof typeof icons];

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border",
      variants[status as keyof typeof variants]
    )}>
      <Icon className="w-3 h-3" />
      {labels[status as keyof typeof labels]}
    </span>
  );
};

export default function ArticlesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredArticles = mockArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Artigos</h1>
            <p className="text-gray-500 mt-1">Gerencie todo o conteúdo da plataforma</p>
          </div>
          <Link 
            href="/admin/articles/new"
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Novo Artigo
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar artigos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">Todos os status</option>
            <option value="published">Publicados</option>
            <option value="draft">Rascunhos</option>
            <option value="review">Em Revisão</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artigo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Autor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Métricas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {article.featured && (
                        <span className="mr-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                          Destaque
                        </span>
                      )}
                      <span className="font-medium text-gray-900">{article.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {article.author}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {article.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={article.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {article.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        👍 {article.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        💬 {article.comments}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {article.date}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg" title="Visualizar">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg" title="Editar">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg" title="Excluir">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Mostrando {filteredArticles.length} de {mockArticles.length} artigos
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" disabled>
              Anterior
            </button>
            <button className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" disabled>
              Próximo
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
