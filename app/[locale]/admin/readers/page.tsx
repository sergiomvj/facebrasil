'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Loader2, UserPlus, Edit2, X, Trash2 } from 'lucide-react';
import { listReaders, createReader, updateReader, deleteReader } from '@/app/actions/reader-actions';

export default function ReadersPage() {
    const [readers, setReaders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingReader, setEditingReader] = useState<any>(null);
    const [formData, setFormData] = useState({
        id: '', name: '', email: '', password: '',
        phone: '', whatsapp: '', tiktok: '', instagram: '', city: '', profession: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadReaders();
    }, []);

    const loadReaders = async () => {
        setLoading(true);
        try {
            const data = await listReaders();
            setReaders(data || []);
        } catch (error) {
            console.error('Falha ao carregar leitores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.email) return alert('Nome e email são obrigatórios');
        if (!editingReader && !formData.password) return alert('Senha é obrigatória para novos leitores');

        setSaving(true);
        try {
            if (editingReader) {
                const res = await updateReader(editingReader.id, {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password || undefined,
                    phone: formData.phone,
                    whatsapp: formData.whatsapp,
                    tiktok: formData.tiktok,
                    instagram: formData.instagram,
                    city: formData.city,
                    profession: formData.profession
                });
                if (!res.success) throw new Error(res.error);
            } else {
                const res = await createReader({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    whatsapp: formData.whatsapp,
                    tiktok: formData.tiktok,
                    instagram: formData.instagram,
                    city: formData.city,
                    profession: formData.profession
                });
                if (!res.success) throw new Error(res.error);
            }

            setShowModal(false);
            setEditingReader(null);
            setFormData({
                id: '', name: '', email: '', password: '',
                phone: '', whatsapp: '', tiktok: '', instagram: '', city: '', profession: ''
            });
            loadReaders();
        } catch (error: any) {
            alert('Erro: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir o leitor ${name}? Esta ação não pode ser desfeita.`)) return;

        try {
            const res = await deleteReader(id);
            if (!res.success) throw new Error(res.error);
            loadReaders();
        } catch (error: any) {
            alert('Erro ao excluir: ' + error.message);
        }
    };

    const filteredReaders = readers.filter(r =>
        r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black dark:text-white text-gray-900 mb-2">Leitores</h1>
                    <p className="dark:text-slate-400 text-gray-600">Gestão de usuários do portal (apenas leitura)</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar leitores..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg dark:bg-slate-800 bg-white border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setEditingReader(null);
                            setFormData({
                                id: '', name: '', email: '', password: '',
                                phone: '', whatsapp: '', tiktok: '', instagram: '', city: '', profession: ''
                            });
                            setShowModal(true);
                        }}
                        className="bg-primary hover:bg-primary/90 text-slate-950 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors whitespace-nowrap"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span>Novo Leitor</span>
                    </button>
                </div>
            </div>

            <div className="dark:bg-slate-900 bg-white rounded-xl p-6 border dark:border-white/10 border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b dark:border-white/10 border-gray-200">
                                <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Leitor</th>
                                <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Cadastro</th>
                                <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-white/5 divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="py-20 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                        <p className="mt-2 text-slate-500">Carregando leitores...</p>
                                    </td>
                                </tr>
                            ) : filteredReaders.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="py-20 text-center">
                                        <p className="text-slate-500">Nenhum leitor encontrado.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredReaders.map((reader) => (
                                    <tr key={reader.id} className="hover:dark:bg-white/5 hover:bg-gray-50 transition-colors">
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-primary font-bold">
                                                    {(reader.name || reader.email || 'U')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold dark:text-white text-gray-900">{reader.name || 'Sem Nome'}</div>
                                                    <div className="text-xs text-slate-500">{reader.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-sm text-slate-500">
                                            {new Date(reader.created_at).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingReader(reader);
                                                        setFormData({
                                                            id: reader.id,
                                                            name: reader.name || '',
                                                            email: reader.email || '',
                                                            password: '',
                                                            phone: reader.phone || '',
                                                            whatsapp: reader.whatsapp || '',
                                                            tiktok: reader.tiktok || '',
                                                            instagram: reader.instagram || '',
                                                            city: reader.city || '',
                                                            profession: reader.profession || ''
                                                        });
                                                        setShowModal(true);
                                                    }}
                                                    className="p-2 hover:bg-white/10 dark:hover:bg-white/10 bg-gray-100 hover:bg-gray-200 dark:bg-transparent rounded-lg dark:text-slate-400 text-slate-600 dark:hover:text-white transition-colors"
                                                    title="Editar Leitor"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(reader.id, reader.name || reader.email)}
                                                    className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg dark:text-slate-400 text-slate-600 transition-colors"
                                                    title="Excluir Leitor"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="dark:bg-slate-900 bg-white border dark:border-white/10 border-gray-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6 border-b dark:border-white/10 border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold dark:text-white text-gray-900 flex items-center gap-2">
                                {editingReader ? <Edit2 className="w-5 h-5 text-primary" /> : <UserPlus className="w-5 h-5 text-primary" />}
                                {editingReader ? 'Editar Leitor' : 'Novo Leitor'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-white/5 bg-gray-100 dark:bg-transparent rounded-lg text-slate-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">Nome</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                                    disabled={!!editingReader}
                                />
                                {editingReader && <p className="text-xs text-slate-500 mt-1">O email não pode ser alterado após a criação.</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">
                                    Senha {editingReader ? '(deixe em branco para não alterar)' : '*'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2 dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">Telefone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">WhatsApp</label>
                                    <input
                                        type="tel"
                                        value={formData.whatsapp}
                                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                        className="w-full px-4 py-2 dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">TikTok</label>
                                    <input
                                        type="text"
                                        value={formData.tiktok}
                                        onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                                        placeholder="@usuario"
                                        className="w-full px-4 py-2 dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">Instagram</label>
                                    <input
                                        type="text"
                                        value={formData.instagram}
                                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                        placeholder="@usuario"
                                        className="w-full px-4 py-2 dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">Cidade</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-2 dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium dark:text-white text-gray-900 mb-2">Profissão</label>
                                    <input
                                        type="text"
                                        value={formData.profession}
                                        onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                                        className="w-full px-4 py-2 dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t dark:border-white/10 border-gray-200 flex justify-end gap-3 dark:bg-white/5 bg-gray-50">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 rounded-lg font-medium text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-primary hover:bg-primary/90 text-slate-950 px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
