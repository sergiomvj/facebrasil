'use client';

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Users, Search, AlertTriangle, Loader2, UserPlus, Edit2, X, Image as ImageIcon, Upload } from 'lucide-react';
import { listUsers, updateUserRole, createUser, updateUser } from '@/app/actions/user-actions';
import { getSiteSettings, updateSiteSettings } from '@/app/actions/settings-actions';
import { uploadSiteImage } from '@/app/actions/image-actions';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'general' | 'users'>('general');
    const [loadingSettings, setLoadingSettings] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [siteSettings, setSiteSettings] = useState({
        site_name: '',
        site_description: '',
        og_image_url: '',
        meta_title_template: '',
        meta_description_template: '',
    });

    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [userFormData, setUserFormData] = useState({ id: '', name: '', email: '', password: '', role: 'EDITOR' });
    const [savingUser, setSavingUser] = useState(false);

    useEffect(() => {
        if (activeTab === 'users') {
            loadUsers();
        } else if (activeTab === 'general') {
            loadSettings();
        }
    }, [activeTab]);

    const loadSettings = async () => {
        setLoadingSettings(true);
        try {
            const data = await getSiteSettings();
            if (data) {
                setSiteSettings({
                    site_name: data.site_name || '',
                    site_description: data.site_description || '',
                    og_image_url: data.og_image_url || '',
                    meta_title_template: data.meta_title_template || '',
                    meta_description_template: data.meta_description_template || '',
                });
            }
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
        } finally {
            setLoadingSettings(false);
        }
    };

    const loadUsers = async () => {
        setLoadingUsers(true);
        try {
            const data = await listUsers();
            setUsers(data);
        } catch (error) {
            console.error('Falha ao carregar usuários:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleUpdateRole = async (userId: string, newRole: string) => {
        setUpdatingUserId(userId);
        try {
            await updateUserRole(userId, newRole);
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            alert('Erro ao atualizar cargo: ' + (error as Error).message);
        } finally {
            setUpdatingUserId(null);
        }
    };

    const handleSaveUser = async () => {
        if (!userFormData.name || !userFormData.email) return alert('Nome e email são obrigatórios');
        if (!editingUser && !userFormData.password) return alert('Senha é obrigatória para novos usuários');

        setSavingUser(true);
        try {
            if (editingUser) {
                const res = await updateUser(editingUser.id, {
                    name: userFormData.name,
                    email: userFormData.email,
                    role: userFormData.role,
                    password: userFormData.password || undefined
                });
                if (!res.success) throw new Error(res.error);
            } else {
                const res = await createUser({
                    name: userFormData.name,
                    email: userFormData.email,
                    role: userFormData.role,
                    password: userFormData.password
                });
                if (!res.success) throw new Error(res.error);
            }

            setShowUserModal(false);
            setEditingUser(null);
            setUserFormData({ id: '', name: '', email: '', password: '', role: 'EDITOR' });
            loadUsers();
        } catch (error: any) {
            alert('Erro: ' + error.message);
        } finally {
            setSavingUser(false);
        }
    };

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        try {
            const res = await updateSiteSettings(siteSettings);
            if (res.success) {
                alert('Configurações salvas com sucesso!');
            }
        } catch (error: any) {
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setSavingSettings(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await uploadSiteImage(formData);
            if (res.success && res.url) {
                setSiteSettings({ ...siteSettings, og_image_url: res.url });
            } else {
                alert('Erro no upload: ' + res.error);
            }
        } catch (error: any) {
            alert('Erro no upload: ' + error.message);
        }
    };

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black dark:text-white text-gray-900 mb-2">Configurações</h1>
                    <p className="dark:text-slate-400 text-gray-600">Gerencie o site e permissões de usuários</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${activeTab === 'general' ? 'bg-primary text-slate-950 px-6' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        <SettingsIcon className="w-5 h-5" />
                        Geral
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-primary text-slate-950 px-6' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        <Users className="w-5 h-5" />
                        Usuários
                    </button>
                </div>
            </div>

            {activeTab === 'general' ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* General Settings */}
                    <div className="dark:bg-slate-900 bg-white rounded-xl p-6 border dark:border-white/10 border-gray-200 space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b dark:border-white/10 border-gray-200">
                            <div className="flex items-center gap-3">
                                <SettingsIcon className="w-6 h-6 text-primary" />
                                <h2 className="text-xl font-black dark:text-white text-gray-900">Configurações Gerais</h2>
                            </div>
                            <button
                                onClick={handleSaveSettings}
                                disabled={savingSettings || loadingSettings}
                                className="bg-primary hover:bg-primary/90 text-slate-950 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Salvar
                            </button>
                        </div>

                        {loadingSettings ? (
                            <div className="py-20 flex flex-col items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <p className="mt-4 text-slate-400 font-medium">Carregando configurações...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold dark:text-slate-300 text-gray-700 mb-2 uppercase tracking-wider">
                                            Nome do Site
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Facebrasil"
                                            value={siteSettings.site_name}
                                            onChange={(e) => setSiteSettings({ ...siteSettings, site_name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold dark:text-slate-300 text-gray-700 mb-2 uppercase tracking-wider">
                                            Descrição Global (SEO)
                                        </label>
                                        <textarea
                                            rows={3}
                                            placeholder="Descrição padrão do site para buscadores"
                                            value={siteSettings.site_description}
                                            onChange={(e) => setSiteSettings({ ...siteSettings, site_description: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary font-medium resize-none"
                                        />
                                    </div>

                                    <div className="pt-4 border-t dark:border-white/5 border-gray-100 space-y-4">
                                        <h3 className="text-sm font-black text-primary uppercase tracking-widest">Templates de Metadados</h3>
                                        <div>
                                            <label className="block text-xs font-bold dark:text-slate-400 text-gray-500 mb-1 uppercase tracking-wider text-right">
                                                Título da Página
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Ex: %title% | Facebrasil"
                                                value={siteSettings.meta_title_template}
                                                onChange={(e) => setSiteSettings({ ...siteSettings, meta_title_template: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <label className="block text-sm font-bold dark:text-slate-300 text-gray-700 mb-2 uppercase tracking-wider">
                                        Imagem de Referência (Social Sharing)
                                    </label>

                                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-800 border-2 border-dashed border-white/10 group">
                                        {siteSettings.og_image_url ? (
                                            <>
                                                <img
                                                    src={siteSettings.og_image_url}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <label className="cursor-pointer bg-white text-slate-950 px-4 py-2 rounded-full font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                                        <Upload className="w-4 h-4" />
                                                        Alterar Imagem
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                                    </label>
                                                </div>
                                            </>
                                        ) : (
                                            <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                                                <ImageIcon className="w-12 h-12 text-slate-600 mb-2" />
                                                <span className="text-sm font-bold text-slate-500">Clique para upload</span>
                                                <span className="text-[10px] text-slate-600 mt-1 uppercase">Recomendado: 1200x630px</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                            </label>
                                        )}
                                    </div>

                                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                                        <p className="text-xs text-primary/80 leading-relaxed italic">
                                            Esta imagem será usada como fallback quando um artigo compartilhado não tiver imagem própria ou quando a HOME for compartilhada.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* User Management */}
                    <div className="dark:bg-slate-900 bg-white rounded-xl p-6 border dark:border-white/10 border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <Users className="w-6 h-6 text-primary" />
                                <h2 className="text-xl font-black dark:text-white text-gray-900">Gestão de Usuários</h2>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nome ou email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingUser(null);
                                        setUserFormData({ id: '', name: '', email: '', password: '', role: 'EDITOR' });
                                        setShowUserModal(true);
                                    }}
                                    className="bg-primary hover:bg-primary/90 text-slate-950 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors whitespace-nowrap"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Novo</span>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left border-b dark:border-white/10 border-gray-200">
                                        <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Usuário</th>
                                        <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Cadastro</th>
                                        <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Cargo Atual</th>
                                        <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-white/5 divide-gray-100">
                                    {loadingUsers ? (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center">
                                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                                <p className="mt-2 text-slate-500">Carregando usuários...</p>
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center">
                                                <p className="text-slate-500">Nenhum usuário encontrado.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:dark:bg-white/5 hover:bg-gray-50 transition-colors">
                                                <td className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-primary font-bold">
                                                            {user.avatar_url ? (
                                                                <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                            ) : (
                                                                (user.name || user.email || 'U')[0].toUpperCase()
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold dark:text-white text-gray-900">{user.name || 'Sem Nome'}</div>
                                                            <div className="text-xs text-slate-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-sm text-slate-500 font-medium">
                                                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${user.role === 'ADMIN' ? 'bg-red-500/10 text-red-500' :
                                                        user.role === 'EDITOR' ? 'bg-blue-500/10 text-blue-500' :
                                                            'bg-slate-500/10 text-slate-500'
                                                        }`}>
                                                        {user.role || 'READER'}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <select
                                                            disabled={updatingUserId === user.id}
                                                            value={user.role || 'VIEWER'}
                                                            onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                                            className="bg-slate-800 border-none rounded-md text-xs py-1 px-2 focus:ring-1 focus:ring-primary h-8 disabled:opacity-50 font-bold"
                                                        >
                                                            <option value="VIEWER">Leitor</option>
                                                            <option value="EDITOR">Editor</option>
                                                            <option value="ADMIN">Admin</option>
                                                        </select>
                                                        {updatingUserId === user.id && <Loader2 className="w-4 h-4 animate-spin text-primary" />}

                                                        <button
                                                            onClick={() => {
                                                                setEditingUser(user);
                                                                setUserFormData({
                                                                    id: user.id,
                                                                    name: user.name || '',
                                                                    email: user.email || '',
                                                                    role: user.role || 'EDITOR',
                                                                    password: ''
                                                                });
                                                                setShowUserModal(true);
                                                            }}
                                                            className="p-2 ml-2 hover:bg-white/10 dark:hover:bg-white/10 bg-gray-100 hover:bg-gray-200 dark:bg-transparent rounded-lg dark:text-slate-400 text-slate-600 dark:hover:text-white transition-colors"
                                                            title="Editar Usuário"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-8 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div className="text-xs text-amber-500/80 leading-relaxed font-medium">
                                <strong>Atenção:</strong> Alterar o cargo de um usuário para <strong>ADMIN</strong> concede acesso total ao sistema, incluindo configurações críticas e gestão de outros usuários. Tenha cautela ao delegar permissões.
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="dark:bg-slate-900 bg-white border dark:border-white/10 border-gray-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl scale-in-center">
                        <div className="p-6 border-b dark:border-white/10 border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-black dark:text-white text-gray-900 flex items-center gap-2">
                                {editingUser ? <Edit2 className="w-5 h-5 text-primary" /> : <UserPlus className="w-5 h-5 text-primary" />}
                                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                            </h2>
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="p-2 hover:bg-white/5 bg-gray-100 dark:bg-transparent rounded-lg text-slate-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold dark:text-slate-300 text-gray-700 mb-2 uppercase tracking-wider">Nome</label>
                                <input
                                    type="text"
                                    value={userFormData.name}
                                    onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                                    className="w-full px-4 py-3 dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold dark:text-slate-300 text-gray-700 mb-2 uppercase tracking-wider">Email</label>
                                <input
                                    type="email"
                                    value={userFormData.email}
                                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                                    className="w-full px-4 py-3 dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 font-medium"
                                    disabled={!!editingUser}
                                />
                                {editingUser && <p className="text-[10px] uppercase font-bold text-slate-500 mt-2">O email não pode ser alterado após a criação.</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold dark:text-slate-300 text-gray-700 mb-2 uppercase tracking-wider">
                                    Senha {editingUser ? '(deixe em branco)' : '*'}
                                </label>
                                <input
                                    type="password"
                                    value={userFormData.password}
                                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold dark:text-slate-300 text-gray-700 mb-2 uppercase tracking-wider">Cargo</label>
                                <select
                                    value={userFormData.role}
                                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                                    className="w-full px-4 py-3 dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary font-bold"
                                >
                                    <option value="VIEWER">Leitor</option>
                                    <option value="EDITOR">Editor</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t dark:border-white/10 border-gray-200 flex justify-end gap-3 dark:bg-white/5 bg-gray-50">
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="px-6 py-2 rounded-lg font-bold text-slate-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5 transition-colors uppercase tracking-widest text-xs"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveUser}
                                disabled={savingUser}
                                className="bg-primary hover:bg-primary/90 text-slate-950 px-8 py-2 rounded-lg font-black flex items-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-primary/20 uppercase tracking-widest text-xs"
                            >
                                {savingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
