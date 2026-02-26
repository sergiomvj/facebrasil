'use client';

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Users, Search, Shield, UserCog, Loader2, Check, AlertTriangle } from 'lucide-react';
import { listUsers, updateUserRole } from '@/app/actions/user-actions';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'general' | 'users'>('general');
    const [settings, setSettings] = useState({
        siteName: 'Facebrasil',
        siteDescription: 'Notícias da comunidade brasileira',
        instagramUrl: 'https://instagram.com/facebrasil',
        facebookUrl: 'https://facebook.com/facebrasil',
        twitterUrl: 'https://twitter.com/facebrasil',
        googleAnalyticsId: '',
        metaPixelId: '',
        newsletterProvider: 'mailchimp',
        newsletterApiKey: '',
    });

    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (activeTab === 'users') {
            loadUsers();
        }
    }, [activeTab]);

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

    const handleSave = () => {
        // TODO: Save to database
        alert('Configurações salvas com sucesso!');
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
                                onClick={handleSave}
                                className="bg-primary hover:bg-primary/90 text-slate-950 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-primary/20"
                            >
                                <Save className="w-4 h-4" />
                                Salvar
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium dark:text-slate-300 text-gray-700 mb-2">
                                    Nome do Site
                                </label>
                                <input
                                    type="text"
                                    value={settings.siteName}
                                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium dark:text-slate-300 text-gray-700 mb-2">
                                    Descrição do Site
                                </label>
                                <input
                                    type="text"
                                    value={settings.siteDescription}
                                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="dark:bg-slate-900 bg-white rounded-xl p-6 border dark:border-white/10 border-gray-200 space-y-6">
                        <h2 className="text-xl font-black dark:text-white text-gray-900">Redes Sociais</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium dark:text-slate-300 text-gray-700 mb-2">Instagram</label>
                                <input type="url" value={settings.instagramUrl} className="w-full px-4 py-3 rounded-lg dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium dark:text-slate-300 text-gray-700 mb-2">Facebook</label>
                                <input type="url" value={settings.facebookUrl} className="w-full px-4 py-3 rounded-lg dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium dark:text-slate-300 text-gray-700 mb-2">Twitter</label>
                                <input type="url" value={settings.twitterUrl} className="w-full px-4 py-3 rounded-lg dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900" />
                            </div>
                        </div>
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

                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome ou email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg dark:bg-slate-800 bg-gray-100 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
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
                                                                <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
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
                                                <td className="py-4 text-sm text-slate-500">
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
                                                            className="bg-slate-800 border-none rounded-md text-xs py-1 px-2 focus:ring-1 focus:ring-primary h-8 disabled:opacity-50"
                                                        >
                                                            <option value="VIEWER">Leitor</option>
                                                            <option value="EDITOR">Editor</option>
                                                            <option value="ADMIN">Admin</option>
                                                        </select>
                                                        {updatingUserId === user.id && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
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
                            <div className="text-xs text-amber-500/80 leading-relaxed">
                                <strong>Atenção:</strong> Alterar o cargo de um usuário para <strong>ADMIN</strong> concede acesso total ao sistema, incluindo configurações críticas e gestão de outros usuários. Tenha cautela ao delegar permissões.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
