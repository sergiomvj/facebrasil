'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Flag,
  CheckCircle,
  XCircle,
  User,
  Clock,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminLayout } from './components/AdminLayout';
import { useComments } from '@/hooks/useAdmin';

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'reported' | 'all'>('pending');
  
  const { 
    comments, 
    total, 
    loading, 
    updateStatus 
  } = useComments({
    status: activeTab === 'all' ? undefined : activeTab,
  });

  const handleApprove = async (commentId: string) => {
    await updateStatus(commentId, 'approved');
  };

  const handleReject = async (commentId: string) => {
    await updateStatus(commentId, 'rejected');
  };

  const pendingCount = activeTab === 'pending' ? total : 0;
  const reportedCount = activeTab === 'reported' ? total : 0;

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
              <h3 className="text-3xl font-bold text-yellow-800 mt-1">
                {loading ? '-' : (activeTab === 'pending' ? total : 0)}
              </h3>
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
              <h3 className="text-3xl font-bold text-red-800 mt-1">
                {loading ? '-' : (activeTab === 'reported' ? total : 0)}
              </h3>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Flag className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Total em Análise</p>
              <h3 className="text-3xl font-bold text-green-800 mt-1">{loading ? '-' : total}</h3>
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
              Pendentes
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
              Denunciados
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                "px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'all'
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Todos
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum comentário {activeTab === 'pending' ? 'pendente' : activeTab === 'reported' ? 'denunciado' : ''} encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div 
                  key={comment.id} 
                  className={cn(
                    "border rounded-lg p-4",
                    comment.status === 'reported' ? "bg-red-50 border-red-200" : "hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      comment.status === 'reported' ? "bg-red-200" : "bg-gray-200"
                    )}>
                      <span className={cn(
                        "font-medium",
                        comment.status === 'reported' ? "text-red-700" : "text-gray-600"
                      )}>
                        {comment.author?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{comment.author?.name || 'Unknown'}</span>
                        <span className="text-sm text-gray-500">em</span>
                        <span className="text-sm text-red-600">{comment.article?.title || 'Unknown Article'}</span>
                        {comment.status === 'reported' && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                            Denunciado
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                      {comment.report_reason && (
                        <div className="mt-2 p-2 bg-white rounded border border-red-100">
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            <strong>Motivo:</strong> {comment.report_reason}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(comment.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleApprove(comment.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Aprovar"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleReject(comment.id)}
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
        </div>
      </div>
    </AdminLayout>
  );
}
