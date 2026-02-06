'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, Image as ImageIcon, Trash2, Copy, Search, X } from 'lucide-react';

interface MediaFile {
    id: string;
    filename: string;
    url: string;
    type: string;
    size: number;
    created_at: string;
}

export default function MediaLibraryPage() {
    const [media, setMedia] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        setLoading(true);

        // List files from Supabase Storage
        const { data, error } = await supabase.storage
            .from('media')
            .list();

        if (!error && data) {
            const mediaFiles: MediaFile[] = data.map(file => ({
                id: file.id,
                filename: file.name,
                url: supabase.storage.from('media').getPublicUrl(file.name).data.publicUrl,
                type: file.metadata?.mimetype || 'image/jpeg',
                size: file.metadata?.size || 0,
                created_at: file.created_at || new Date().toISOString(),
            }));

            setMedia(mediaFiles);
        }

        setLoading(false);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);

        for (const file of Array.from(files)) {
            const filename = `${Date.now()}-${file.name}`;

            const { error } = await supabase.storage
                .from('media')
                .upload(filename, file);

            if (error) {
                console.error('Upload error:', error);
            }
        }

        setUploading(false);
        fetchMedia();
    };

    const deleteMedia = async (filename: string) => {
        if (!confirm('Tem certeza que deseja deletar esta mídia?')) return;

        const { error } = await supabase.storage
            .from('media')
            .remove([filename]);

        if (!error) {
            fetchMedia();
        }
    };

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        alert('URL copiada para a área de transferência!');
    };

    const filteredMedia = media.filter(item =>
        item.filename.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black dark:text-white text-gray-900 mb-2">Biblioteca de Mídia</h1>
                    <p className="dark:text-slate-400 text-gray-600">Gerencie imagens e vídeos</p>
                </div>

                {/* Upload Button */}
                <label className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-primary/20">
                    <Upload className="w-5 h-5" />
                    Upload
                    <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleUpload}
                        className="hidden"
                        disabled={uploading}
                    />
                </label>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-slate-400 text-gray-500" />
                <input
                    type="text"
                    placeholder="Buscar arquivos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-lg dark:bg-slate-900 bg-white border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            {/* Upload Progress */}
            {uploading && (
                <div className="dark:bg-slate-900 bg-white rounded-xl p-6 border dark:border-white/10 border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="dark:text-white text-gray-900 font-medium">Fazendo upload...</span>
                    </div>
                </div>
            )}

            {/* Media Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredMedia.length === 0 ? (
                <div className="dark:bg-slate-900 bg-white rounded-xl p-12 text-center border dark:border-white/10 border-gray-200">
                    <ImageIcon className="w-16 h-16 dark:text-slate-600 text-gray-400 mx-auto mb-4" />
                    <p className="dark:text-slate-400 text-gray-600">Nenhuma mídia encontrada</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredMedia.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedMedia(item)}
                            className="dark:bg-slate-900 bg-white rounded-xl overflow-hidden border dark:border-white/10 border-gray-200 cursor-pointer hover:border-primary transition-colors group"
                        >
                            <div className="aspect-square bg-slate-800 relative">
                                {item.type.startsWith('image/') ? (
                                    <img
                                        src={item.url}
                                        alt={item.filename}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-12 h-12 text-slate-600" />
                                    </div>
                                )}

                                {/* Hover Actions */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyUrl(item.url);
                                        }}
                                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
                                    >
                                        <Copy className="w-5 h-5 text-white" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteMedia(item.filename);
                                        }}
                                        className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg backdrop-blur-sm transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-3">
                                <p className="text-sm font-medium dark:text-white text-gray-900 truncate">{item.filename}</p>
                                <p className="text-xs dark:text-slate-400 text-gray-600">{formatFileSize(item.size)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Media Detail Modal */}
            {selectedMedia && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
                    onClick={() => setSelectedMedia(null)}
                >
                    <div
                        className="dark:bg-slate-900 bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b dark:border-white/10 border-gray-200 flex items-center justify-between">
                            <h3 className="text-xl font-black dark:text-white text-gray-900">Detalhes da Mídia</h3>
                            <button
                                onClick={() => setSelectedMedia(null)}
                                className="p-2 dark:hover:bg-slate-800 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Preview */}
                            <div className="bg-slate-800 rounded-lg overflow-hidden">
                                <img
                                    src={selectedMedia.url}
                                    alt={selectedMedia.filename}
                                    className="w-full h-auto"
                                />
                            </div>

                            {/* Details */}
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium dark:text-slate-400 text-gray-600">Nome do Arquivo</label>
                                    <p className="dark:text-white text-gray-900 font-medium">{selectedMedia.filename}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium dark:text-slate-400 text-gray-600">URL</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={selectedMedia.url}
                                            readOnly
                                            className="flex-1 px-3 py-2 rounded-lg dark:bg-slate-800 bg-gray-100 dark:text-white text-gray-900 text-sm"
                                        />
                                        <button
                                            onClick={() => copyUrl(selectedMedia.url)}
                                            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                                        >
                                            Copiar
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium dark:text-slate-400 text-gray-600">Tamanho</label>
                                        <p className="dark:text-white text-gray-900 font-medium">{formatFileSize(selectedMedia.size)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium dark:text-slate-400 text-gray-600">Data de Upload</label>
                                        <p className="dark:text-white text-gray-900 font-medium">
                                            {new Date(selectedMedia.created_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
