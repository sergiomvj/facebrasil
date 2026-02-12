'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Flag,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminLayout } from './components/AdminLayout';

// Mock Data
const pendingComments = [
  {
    id: 1,
    author: 'Carlos Mendes',
    avatar: 'CM',
    article: 'Como Imigrar Legalmente para os EUA',
    content: 'Muito obrigado pelo artigo! Gostaria de saber se o processo é o mesmo para quem já tem família lá.',
    date: '2026-02-12 14:30',
    status: 'pending',
  },
  {
    id: 2,
    author: 'Ana Paula',
    avatar: 'AP',
    article: 'Custo de Vida em Miami',
    content: 'Você esqueceu de mencionar o custo do seguro saúde, que é bem alto!',
    date: '2026-02-12 13:15',
    status: 'pending',
  },
];

const reportedComments = [
  {
    id: 3,
    author: 'João Silva',
    avatar: 'JS',
    article: 'Guia de Documentação',
    content: 'Esse processo é muito complicado, não vale a pena...',
    reportReason: 'Conteúdo negativo sem construtividade',
    reportedBy: 'Maria Oliveira',
    date: '2026-02-12 10:20',
    status: 'reported',
  },
];

const recentActivity = [
  { action: 'aprovou', target: 'comentário de Carlos Mendes', time: '2 horas atrás', user: 'Admin' },
  { action: 'rejeitou', target: 'comentário de usuário anônimo', time: '3 horas atrás', user: 'Admin' },
  { action: 'marcou como spam', target: 'comentário suspeito', time: '5 horas atrás', user: 'Sistema' },
];

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState('pending');

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Moderação</h1>
        <p className="text-gray-500 mt-1">Gerencie comentários e denúncias</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">Pendentes</p>
              <h3 className="text-3xl font-bold text-yellow-800 mt-1">{pendingComments.length}</h3>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Denunciados</p>
              <h3 className="text-3xl font-bold text-red-800 mt-1">{reportedComments.length}</h3>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Flag className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Aprovados Hoje</p>
              <h3 className="text-3xl font-bold text-green-800 mt-1">24</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('pending')}
              className={cn(
                "px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'pending'
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Pendentes ({pendingComments.length})
            </button>
            <button
              onClick={() => setActiveTab('reported')}
              className={cn(
                "px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'reported'
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Denunciados ({reportedComments.length})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={cn(
                "px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'activity'
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Atividade Recente
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {pendingComments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-medium text-gray-600">{comment.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{comment.author}</span>
                        <span className="text-sm text-gray-500">em</span>
                        <span className="text-sm text-red-600">{comment.article}</span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                      <p className="text-xs text-gray-400 mt-2">{comment.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Aprovar"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Rejeitar"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reported' && (
            <div className="space-y-4">
              {reportedComments.map((comment) => (
                <div key={comment.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-medium text-red-700">{comment.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{comment.author}</span>
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                          Denunciado
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                      <div className="mt-2 p-2 bg-white rounded border border-red-100">
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          <strong>Motivo:</strong> {comment.reportReason}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Denunciado por: {comment.reportedBy}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">{comment.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
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
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
