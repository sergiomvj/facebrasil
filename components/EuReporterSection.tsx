"use client";

import React from 'react';
import { Play, Send } from 'lucide-react';
import { getEmbedUrl } from '@/lib/utils';

interface VideoReport {
    id: string;
    title: string;
    video_url: string;
    created_at: string;
}

interface EuReporterSectionProps {
    videos: VideoReport[];
}

const EuReporterSection: React.FC<EuReporterSectionProps> = ({ videos = [] }) => {
    const [playingVideoId, setPlayingVideoId] = React.useState<string | null>(null);

    return (
        <section className="py-20 bg-slate-950 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <span className="text-accent-yellow font-bold text-sm tracking-widest uppercase mb-2 block">Comunidade</span>
                        <h2 className="text-3xl md:text-5xl font-black dark:text-white text-gray-900 italic tracking-tighter">
                            EU REPÓRTER
                        </h2>
                        <p className="text-slate-400 mt-4 max-w-lg text-lg">
                            Vídeos enviados diretamente pela nossa comunidade. Flagrantes, eventos e o dia a dia do brasileiro na América.
                        </p>
                    </div>

                    <a href="/eu-reporter" className="bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-full flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                        <Send className="w-5 h-5" />
                        ENVIAR MEU VÍDEO
                    </a>
                </div>

                {/* Video Grid - Shorts Style (Vertical) */}
                {videos.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-white/5">
                        <p className="text-slate-500 text-xl">Ainda não há vídeos em destaque. Seja o primeiro a enviar!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {videos.map((video) => {
                            const isPlaying = playingVideoId === video.id;

                            return (
                                <div
                                    key={video.id}
                                    className="group relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer bg-slate-900"
                                    onClick={() => !isPlaying && setPlayingVideoId(video.id)}
                                >
                                    {/* Fallback/Thumbnail - Hidden if playing */}
                                    {!isPlaying && (
                                        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-slate-600">
                                            <Play className="w-12 h-12 opacity-50" />
                                        </div>
                                    )}

                                    {/* Embed */}
                                    {/* If playing, show with controls and autoplay. If not, show preview style. */}
                                    <iframe
                                        src={`${getEmbedUrl(video.video_url)}?controls=${isPlaying ? '1' : '0'}&modestbranding=1${isPlaying ? '&autoplay=1&mute=0' : '&mute=1'}`}
                                        className={`absolute inset-0 w-full h-full object-cover transition-opacity ${isPlaying ? 'opacity-100 z-20' : 'opacity-80 group-hover:opacity-100'}`}
                                        title={video.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        style={{ pointerEvents: isPlaying ? 'auto' : 'none' }} // Allow interaction only when playing
                                    />

                                    {/* Overlays - Hidden when playing */}
                                    {!isPlaying && (
                                        <>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 flex flex-col justify-end pointer-events-none">
                                                <h3 className="dark:text-white text-gray-900 font-bold text-lg leading-tight line-clamp-2">{video.title}</h3>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Ao Vivo</span>
                                                </div>
                                            </div>

                                            {/* Hover Play Button Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                                    <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Veja Mais Button */}
                {videos.length > 0 && (
                    <div className="flex justify-center mt-12">
                        <a
                            href="/eu-reporter/videos"
                            className="bg-white/10 hover:bg-white/20 dark:text-white text-gray-900 font-bold py-4 px-12 rounded-full border border-white/20 hover:border-white/40 transition-all hover:scale-105 active:scale-95 shadow-lg"
                        >
                            VEJA MAIS
                        </a>
                    </div>
                )}
            </div>
        </section>
    );
};

export default EuReporterSection;
