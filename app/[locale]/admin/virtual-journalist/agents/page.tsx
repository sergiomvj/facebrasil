'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';

interface Agent {
    id: string;
    name: string;
    profile_description: string;
    location: string;
    writing_style: string;
}

export default function VirtualAgentsPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        profile_description: '',
        location: '',
        writing_style: ''
    });

    const fetchAgents = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('virtual_agents').select('*').order('created_at', { ascending: false });
        if (!error && data) {
            setAgents(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAgent) {
            const { error } = await supabase
                .from('virtual_agents')
                .update(formData)
                .eq('id', editingAgent.id);
            if (!error) {
                setIsModalOpen(false);
                fetchAgents();
            }
        } else {
            const { error } = await supabase
                .from('virtual_agents')
                .insert([formData]);
            if (!error) {
                setIsModalOpen(false);
                fetchAgents();
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja remover este jornalista virtual?')) {
            await supabase.from('virtual_agents').delete().eq('id', id);
            fetchAgents();
        }
    };

    const openModal = (agent?: Agent) => {
        if (agent) {
            setEditingAgent(agent);
            setFormData({
                name: agent.name,
                profile_description: agent.profile_description || '',
                location: agent.location || '',
                writing_style: agent.writing_style || ''
            });
        } else {
            setEditingAgent(null);
            setFormData({ name: '', profile_description: '', location: '', writing_style: '' });
        }
        setIsModalOpen(true);
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white text-gray-900">Jornalistas Virtuais</h1>
                    <p className="text-gray-600 dark:text-gray-400">Gerencie perfis e estilos de escrita da sua redação de IA.</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus className="w-5 h-5" /> Novo Agente
                </button>
            </div>
            
            {loading ? (
                <div className="text-center py-12">Carregando agentes...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {agents.map(agent => (
                        <div key={agent.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm flex flex-col h-full">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{agent.name}</h3>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-4">{agent.location || 'Localização não definida'}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                                    {agent.profile_description || 'Sem descrição.'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                <button 
                                    onClick={() => openModal(agent)}
                                    className="flex-1 flex justify-center items-center gap-2 py-2 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-sm font-medium transition"
                                >
                                    <Edit className="w-4 h-4" /> Editar
                                </button>
                                <button 
                                    onClick={() => handleDelete(agent.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {agents.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-300 dark:border-white/10">
                            Nenhum jornalista virtual cadastrado ainda.
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-white/10">
                            <h2 className="text-xl font-bold dark:text-white text-gray-900">{editingAgent ? 'Editar Agente' : 'Novo Agente'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Jornalista</label>
                                <input 
                                    type="text" required
                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 dark:text-white"
                                    placeholder="Ex: João da Silva (Correspondente FL)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Localização Principal (Especialidade)</label>
                                <input 
                                    type="text"
                                    value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 dark:text-white"
                                    placeholder="Ex: Flórida, Massachusetts, Nova York..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição do Perfil (Para controle interno)</label>
                                <textarea 
                                    rows={2}
                                    value={formData.profile_description} onChange={e => setFormData({...formData, profile_description: e.target.value})}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 dark:text-white"
                                    placeholder="Descreva quem é esse agente e para que tipo de matérias ele é usado."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estilo de Escrita (Prompt para o modelo)</label>
                                <textarea 
                                    rows={5} required
                                    value={formData.writing_style} onChange={e => setFormData({...formData, writing_style: e.target.value})}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 dark:text-white"
                                    placeholder="Ex: Escreva em um tom investigativo e empático. Foco nos imigrantes, usando linguagem clara e jornalística. Evite jargões políticos muito pesados."
                                />
                                <p className="text-xs text-gray-500 mt-2">Isso será injetado no prompt da OpenAI para gerar a matéria.</p>
                            </div>
                            
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800 rounded-lg font-medium transition">Cancelar</button>
                                <button type="submit" className="px-5 py-2 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
                                    <Save className="w-4 h-4" /> Salvar Agente
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
