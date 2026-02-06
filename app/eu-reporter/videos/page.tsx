'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, MapPin, Calendar, Play, Filter } from 'lucide-react';
import Link from 'next/link';
import { getEmbedUrl } from '@/lib/utils';

interface VideoReport {
    id: string;
    title: string;
    video_url: string;
    reporter_name: string;
    reporter_city: string;
    state: string | null;
    status: string;
    created_at: string;
}

const US_STATES = [
    'All States',
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
];

export default function EuReporterVideosPage() {
    const [videos, setVideos] = useState<VideoReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedState, setSelectedState] = useState('All States');

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        setLoading(true);

        const { data } = await supabase
            .from('user_video_reports')
            .select('*')
            .eq('status', 'APPROVED')
            .order('created_at', { ascending: false });

        setVideos(data || []);
        setLoading(false);
    };

    const filteredVideos = videos.filter(video => {
        const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            video.reporter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            video.reporter_city.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesState = selectedState === 'All States' || video.state === selectedState;

        return matchesSearch && matchesState;
    });

    return (
        <div className="min-h-screen dark:bg-slate-950 bg-gray-50 pt-24 pb-20">
            <div className="max-w-[1400px] mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-black dark:text-white text-gray-900 mb-4">
                        EU REPÓRTER
                    </h1>
                    <p className="text-xl dark:text-slate-400 text-gray-600 mb-8">
                        Vídeos da comunidade brasileira nos Estados Unidos
                    </p>
                    <Link
                        href="/eu-reporter"
                        className="inline-block bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                    >
                        ENVIAR SEU VÍDEO
                    </Link>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-slate-400 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar por título, repórter ou cidade..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl dark:bg-slate-900 bg-white border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* State Filter */}
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-slate-400 text-gray-500" />
                        <select
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl dark:bg-slate-900 bg-white border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                        >
                            {US_STATES.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="dark:text-slate-400 text-gray-600">
                        {filteredVideos.length} {filteredVideos.length === 1 ? 'vídeo encontrado' : 'vídeos encontrados'}
                    </p>
                </div>

                {/* Videos Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredVideos.length === 0 ? (
                    <div className="dark:bg-slate-900 bg-white rounded-xl p-12 text-center border dark:border-white/10 border-gray-200">
                        <Play className="w-16 h-16 dark:text-slate-600 text-gray-400 mx-auto mb-4" />
                        <p className="dark:text-slate-400 text-gray-600">Nenhum vídeo encontrado</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVideos.map((video) => (
                            <div
                                key={video.id}
                                className="dark:bg-slate-900 bg-white rounded-xl overflow-hidden border dark:border-white/10 border-gray-200 shadow-sm hover:shadow-lg transition-all group"
                            >
                                {/* Video Preview */}
                                <div className="aspect-video bg-slate-800 relative overflow-hidden">
                                    <iframe
                                        src={`${getEmbedUrl(video.video_url)}?controls=0&modestbranding=1`}
                                        className="absolute inset-0 w-full h-full"
                                        title={video.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    />

                                    {/* Hover Play Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                            <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 space-y-3">
                                    <h3 className="font-bold dark:text-white text-gray-900 text-lg line-clamp-2 group-hover:text-primary transition-colors">
                                        {video.title}
                                    </h3>

                                    <div className="space-y-2 text-sm dark:text-slate-400 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-primary font-bold text-xs">
                                                    {video.reporter_name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="font-medium">{video.reporter_name}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 flex-shrink-0" />
                                            <span>{video.reporter_city}{video.state ? `, ${video.state}` : ''}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 flex-shrink-0" />
                                            <span>{new Date(video.created_at).toLocaleDateString('pt-BR', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric'
                                            })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
