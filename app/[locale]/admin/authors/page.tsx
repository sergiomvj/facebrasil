'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Plus, Edit2, Trash2, Search, UserCircle, UserPlus, Shield } from 'lucide-react';
import { upsertAuthor, deleteAuthor } from '@/app/actions/author-actions';

interface Author {
    id: string;
    name: string | null;
    avatar_url: string | null;
    role: string | null;
    created_at: string;
    article_count?: number;
}

export default function AuthorsPage() {
    const [authors, setAuthors] = useState<Author[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        avatar_url: '',
        role: 'EDITOR',
        isVirtual: false
    });


    async function fetchAuthors() {
        setLoading(true);
        try {
            // Fetch authors with article count
            const { data: authorsData, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Get article counts for each author
            const authorsWithCounts = await Promise.all(
                ((authorsData as Author[]) || []).map(async (author) => {
                    const { count } = await supabase
                        .from('articles')
                        .select('*', { count: 'exact', head: true })
                        .eq('author_id', author.id);

                    return {
                        ...author,
                        article_count: count || 0
                    };
                })
            );

            setAuthors(authorsWithCounts);
        } catch (error) {
            console.error('Error fetching authors:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void fetchAuthors();
    }, []);

    async function handleCreateAuthor() {
        if (!formData.name) return alert('Nome é obrigatório');
        if (!formData.isVirtual && !formData.id) return alert('Clerk User ID é obrigatório para autores vinculados');

        setLoading(true);
        try {
            const result = await upsertAuthor({
                name: formData.name,
                avatar_url: formData.avatar_url || null,
                role: formData.role
            }, formData.isVirtual ? undefined : formData.id);

            if (!result.success) throw new Error(result.error);

            setShowCreateModal(false);
            setFormData({ id: '', name: '', avatar_url: '', role: 'EDITOR', isVirtual: false });
            fetchAuthors();
        } catch (error: any) {
            alert('Erro ao criar autor: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdateAuthor() {
        if (!editingAuthor) return;

        setLoading(true);
        try {
            const result = await upsertAuthor({
                name: formData.name,
                avatar_url: formData.avatar_url || null,
                role: formData.role
            }, editingAuthor.id);

            if (!result.success) throw new Error(result.error);

            setEditingAuthor(null);
            setFormData({ id: '', name: '', avatar_url: '', role: 'EDITOR', isVirtual: false });
            fetchAuthors();
        } catch (error: any) {
            alert('Erro ao atualizar autor: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteAuthor(author: Author) {
        if (author.article_count && author.article_count > 0) {
            if (!confirm(`Este autor tem ${author.article_count} artigo(s). Tem certeza que deseja deletar?`)) {
                return;
            }
        } else {
            if (!confirm(`Tem certeza que deseja deletar ${author.name}?`)) {
                return;
            }
        }

        setLoading(true);
        try {
            const result = await deleteAuthor(author.id);
            if (!result.success) throw new Error(result.error);
            fetchAuthors();
        } catch (error: any) {
            alert('Erro ao deletar autor: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    function openEditModal(author: Author) {
        setEditingAuthor(author);
        setFormData({
            id: author.id,
            name: author.name || '',
            avatar_url: author.avatar_url || '',
            role: author.role || 'EDITOR',
            isVirtual: !author.id.startsWith('user_')
        });
    }

    const filteredAuthors = authors.filter(author =>
        author.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-black dark:text-white text-gray-900 mb-1">Autores</h1>
                <p className="text-slate-400 text-sm">Gerencie os autores da plataforma</p>
            </div>

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar autores..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 dark:bg-slate-800 bg-white border dark:border-white/10 border-gray-200 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Novo Autor
                </button>
            </div>

            {/* Authors Grid */}
            {loading ? (
                <div className="text-center py-12 text-slate-400">Carregando...</div>
            ) : filteredAuthors.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    {searchTerm ? 'Nenhum autor encontrado' : 'Nenhum autor cadastrado'}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAuthors.map((author) => (
                        <div
                            key={author.id}
                            className="dark:bg-slate-800 bg-white border dark:border-white/10 border-gray-200 rounded-lg p-6"
                        >
                            <div className="flex items-start gap-4">
                                {author.avatar_url ? (
                                    <img
                                        src={author.avatar_url}
                                        alt={author.name || 'Author'}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">
                                        <UserCircle className="w-10 h-10 text-slate-400" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold dark:text-white text-gray-900 truncate">
                                        {author.name || 'Sem nome'}
                                    </h3>
                                    <p className="text-sm text-slate-400 mb-1 flex items-center gap-1">
                                        {author.role || 'EDITOR'}
                                        {author.id.startsWith('user_') ? (
                                            <div title="Usuário Clerk">
                                                <Shield className="w-3 h-3 text-blue-400" />
                                            </div>
                                        ) : (
                                            <div className="w-2 h-2 rounded-full bg-amber-500" title="Autor Virtual" />
                                        )}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {author.article_count || 0} artigo(s)
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => openEditModal(author)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 dark:bg-slate-700 bg-gray-100 dark:text-white text-gray-900 rounded-lg hover:bg-slate-600 transition-colors text-sm"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDeleteAuthor(author)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Deletar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {(showCreateModal || editingAuthor) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="dark:bg-slate-800 bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-4">
                            {editingAuthor ? 'Editar Autor' : 'Novo Autor'}
                        </h2>

                        <div className="space-y-4">
                            {!editingAuthor && (
                                <div className="flex items-center gap-3 p-3 dark:bg-slate-900/50 bg-gray-50 rounded-lg border dark:border-white/5 border-gray-100 mb-4">
                                    <input
                                        type="checkbox"
                                        id="isVirtual"
                                        checked={formData.isVirtual}
                                        onChange={(e) => setFormData({ ...formData, isVirtual: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="isVirtual" className="text-sm font-medium dark:text-white text-gray-900 cursor-pointer">
                                        Autor Virtual (Sem conta no Clerk)
                                    </label>
                                </div>
                            )}

                            {!editingAuthor && !formData.isVirtual && (
                                <div>
                                    <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">
                                        Clerk User ID *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.id}
                                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                        placeholder="user_xxxxxxxxxxxxx"
                                        className="w-full px-4 py-2 dark:bg-slate-700 bg-gray-100 border dark:border-white/10 border-gray-200 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">
                                        ID do usuário no Clerk (obrigatório)
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">
                                    Nome *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Nome do autor"
                                    className="w-full px-4 py-2 dark:bg-slate-700 bg-gray-100 border dark:border-white/10 border-gray-200 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">
                                    Avatar URL
                                </label>
                                <input
                                    type="text"
                                    value={formData.avatar_url}
                                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2 dark:bg-slate-700 bg-gray-100 border dark:border-white/10 border-gray-200 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">
                                    Função
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2 dark:bg-slate-700 bg-gray-100 border dark:border-white/10 border-gray-200 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="EDITOR">Editor</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="CONTRIBUTOR">Contribuidor</option>
                                    <option value="WRITER">Escritor</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setEditingAuthor(null);
                                    setFormData({ id: '', name: '', avatar_url: '', role: 'EDITOR', isVirtual: false });
                                }}
                                className="flex-1 px-4 py-2 dark:bg-slate-700 bg-gray-100 dark:text-white text-gray-900 rounded-lg hover:bg-slate-600 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={editingAuthor ? handleUpdateAuthor : handleCreateAuthor}
                                disabled={!formData.name || (!editingAuthor && !formData.isVirtual && !formData.id) || loading}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    editingAuthor ? 'Atualizar' : 'Criar'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
