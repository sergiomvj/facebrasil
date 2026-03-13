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
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [currentBucket, setCurrentBucket] = useState('blog-assets');
    const AVAILABLE_BUCKETS = ['blog-assets', 'avatars'];
    const PAGE_SIZE = 40;


    async function fetchMedia(loadMore = false) {
        if (!loadMore) {
            setLoading(true);
            setPage(0);
        }

        const currentOffset = loadMore ? (page + 1) * PAGE_SIZE : 0;

        // Função interna para listar arquivos recursivamente
        const listRecursive = async (path: string = ''): Promise<MediaFile[]> => {
            const { data, error } = await supabase.storage
                .from(currentBucket)
                .list(path, {
                    sortBy: { column: 'created_at', order: 'desc' }
                });

            if (error || !data) return [];

            let files: MediaFile[] = [];

            for (const item of data) {
                const fullPath = path ? `${path}/${item.name}` : item.name;

                // Se for um objeto com id, é um arquivo (ou pode ser categorizado pelo mimetype)
                // Pastas no Supabase list() geralmente não têm id ou mimetype
                if (item.id && item.metadata) {
                    files.push({
                        id: item.id,
                        filename: fullPath,
                        url: supabase.storage.from(currentBucket).getPublicUrl(fullPath).data.publicUrl,
                        type: item.metadata.mimetype || 'image/jpeg',
                        size: item.metadata.size || 0,
                        created_at: item.created_at || new Date().toISOString(),
                    });
                } else if (!item.id && item.name !== '.emptyFolderPlaceholder') {
                    // É uma "pasta"
                    const subFiles = await listRecursive(fullPath);
                    files = [...files, ...subFiles];
                }
            }

            return files;
        };

        try {
            // Note: Pagination with recursion is tricky here since list() pagination applies to the current level.
            // For now, we fetch everything (up to a reasonable limit) or we flatten the structure.
            // To maintain pagination, we would need a more complex solution or a flat index table.
            // Given the typical number of media files in a blog, fetching the top level recursive items is safer.

            const allFiles = await listRecursive('');

            // Sort by date locally since recursion loses the global sort
            const sortedFiles = allFiles.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            // Apply manual pagination on the flattened result
            const paginatedFiles = sortedFiles.slice(currentOffset, currentOffset + PAGE_SIZE);

            if (loadMore) {
                setMedia(prev => [...prev, ...paginatedFiles]);
                setPage(page + 1);
            } else {
                setMedia(paginatedFiles);
            }

            setHasMore(sortedFiles.length > currentOffset + PAGE_SIZE);
        } catch (err) {
            console.error('Error fetching media:', err);
        }

        setLoading(false);
    }


    useEffect(() => {
        void fetchMedia();
    }, [currentBucket]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);

        for (const file of Array.from(files)) {
            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await fetch('/api/upload-image', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Upload failed');
                }
            } catch (error: any) {
                console.error('Upload error:', error);
                alert(`Erro ao fazer upload do arquivo ${file.name}: ${error.message}`);
            }
        }

        setUploading(false);
        fetchMedia();
    };

    const deleteMedia = async (filename: string) => {
        if (!confirm('Tem certeza que deseja deletar esta mídia?')) return;

        // Ensure we're targeting the right bucket
        // We might want to migrate this to an API action as well, 
        // but trying client-side first if Delete RLS is open. If not, it will fail silently.
        // I will add a quick alert if it errors out just in case.
        const { error } = await supabase.storage
            .from(currentBucket)
            .remove([filename]);

        if (error) {
            alert('Erro ao excluir mídia: ' + error.message);
        } else {
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

            {/* Bucket Selection and Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border dark:border-white/10 border-gray-200">
                    {AVAILABLE_BUCKETS.map(bucket => (
                        <button
                            key={bucket}
                            onClick={() => setCurrentBucket(bucket)}
                            className={`px-4 py-2 rounded-lg font-bold transition-all ${currentBucket === bucket
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            {bucket === 'blog-assets' ? 'Blog/Assets' : 'Avatares'}
                        </button>
                    ))}
                </div>

                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-slate-400 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar arquivos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl dark:bg-slate-900 bg-white border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
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
                <div className="space-y-8">
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
                                            loading="lazy"
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

                    {hasMore && !searchTerm && (
                        <div className="flex justify-center pt-8">
                            <button
                                onClick={() => fetchMedia(true)}
                                disabled={loading}
                                className="px-8 py-3 bg-slate-900 border border-white/10 rounded-xl text-white font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Carregando...' : 'Carregar Mais Mídias'}
                            </button>
                        </div>
                    )}
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
