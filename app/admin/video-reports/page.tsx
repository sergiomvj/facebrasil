'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Video, Check, X, Eye, Calendar, MapPin } from 'lucide-react';
import { getEmbedUrl } from '@/lib/utils';
import { updateVideoStatus, deleteVideoReport } from '@/app/actions/video-actions';

interface VideoReport {
    id: string;
    title: string;
    video_url: string;
    reporter_name: string;
    reporter_city: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    created_at: string;
}

export default function VideoReportsPage() {
    const [videos, setVideos] = useState<VideoReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

    useEffect(() => {
        fetchVideos();
    }, [filter]);

    const fetchVideos = async () => {
        setLoading(true);

        let query = supabase
            .from('user_video_reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (filter !== 'ALL') {
            query = query.eq('status', filter);
        }

        const { data } = await query;
        setVideos(data || []);
        setLoading(false);
    };

    const updateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        const result = await updateVideoStatus(id, status);

        if (!result.success) {
            console.error('Error updating status:', result.error);
            alert(`Erro ao atualizar status: ${result.error}`);
        } else {
            // refresh data
            await fetchVideos();
            if (status === 'APPROVED') alert('Vídeo aprovado com sucesso!');
        }
    };

    const deleteVideo = async (id: string) => {
        if (!confirm('Tem certeza que deseja deletar este vídeo?')) return;

        const result = await deleteVideoReport(id);

        if (!result.success) {
            console.error('Error deleting video:', result.error);
            alert('Erro ao excluir vídeo');
        } else {
            await fetchVideos();
        }
    };

    const filteredVideos = videos;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black dark:text-white text-gray-900 mb-2">Vídeos Reportados</h1>
                    <p className="dark:text-slate-400 text-gray-600">Modere vídeos enviados pela comunidade</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === status
                            ? 'bg-primary text-white'
                            : 'dark:bg-slate-800 bg-gray-200 dark:text-slate-300 text-gray-700 dark:hover:bg-slate-700 hover:bg-gray-300'
                            }`}
                    >
                        {status === 'ALL' ? 'Todos' : status === 'PENDING' ? 'Pendentes' : status === 'APPROVED' ? 'Aprovados' : 'Rejeitados'}
                    </button>
                ))}
            </div>

            {/* Videos Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredVideos.length === 0 ? (
                <div className="dark:bg-slate-900 bg-white rounded-xl p-12 text-center border dark:border-white/10 border-gray-200">
                    <Video className="w-16 h-16 dark:text-slate-600 text-gray-400 mx-auto mb-4" />
                    <p className="dark:text-slate-400 text-gray-600">Nenhum vídeo encontrado</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVideos.map((video) => (
                        <div
                            key={video.id}
                            className="dark:bg-slate-900 bg-white rounded-xl overflow-hidden border dark:border-white/10 border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Video Preview */}
                            <div className="aspect-video bg-slate-800 relative">
                                <iframe
                                    src={`${getEmbedUrl(video.video_url)}?controls=0&modestbranding=1`}
                                    className="absolute inset-0 w-full h-full"
                                    title={video.title}
                                />
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-3">
                                <h3 className="font-bold dark:text-white text-gray-900 line-clamp-2">{video.title}</h3>

                                <div className="space-y-1 text-sm dark:text-slate-400 text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        <span>{video.reporter_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        <span>{video.reporter_city}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(video.created_at).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div>
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${video.status === 'APPROVED'
                                            ? 'bg-green-500/10 text-green-500'
                                            : video.status === 'REJECTED'
                                                ? 'bg-red-500/10 text-red-500'
                                                : 'bg-amber-500/10 text-amber-500'
                                            }`}
                                    >
                                        {video.status === 'APPROVED' ? 'Aprovado' : video.status === 'REJECTED' ? 'Rejeitado' : 'Pendente'}
                                    </span>
                                </div>

                                {/* Actions */}
                                {video.status === 'PENDING' && (
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => updateStatus(video.id, 'APPROVED')}
                                            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <Check className="w-4 h-4" />
                                            Aprovar
                                        </button>
                                        <button
                                            onClick={() => updateStatus(video.id, 'REJECTED')}
                                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                            Rejeitar
                                        </button>
                                    </div>
                                )}

                                {video.status !== 'PENDING' && (
                                    <button
                                        onClick={() => deleteVideo(video.id)}
                                        className="w-full dark:bg-slate-800 bg-gray-200 dark:hover:bg-slate-700 hover:bg-gray-300 dark:text-slate-300 text-gray-700 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Deletar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
