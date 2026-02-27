// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Plus, Trophy, Star, Target, Gift, Edit2, Trash2,
  Save, X, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  points_reward: number;
  facets_reward: number;
  icon: string;
  type: 'reading' | 'sharing' | 'engagement' | 'special';
  target_value: number;
  is_active: boolean;
}

export default function AdminGamificationPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<Partial<Challenge>>({});
  const [saving, setSaving] = useState(false);

  async function fetchChallenges() {
    setLoading(true);
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching challenges:', error);
    else setChallenges(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title: currentChallenge.title,
      description: currentChallenge.description,
      points_reward: currentChallenge.points_reward || 0,
      facets_reward: currentChallenge.facets_reward || 0,
      icon: currentChallenge.icon || 'Star',
      type: currentChallenge.type || 'reading',
      target_value: currentChallenge.target_value || 1,
      is_active: currentChallenge.is_active ?? true
    };

    if (currentChallenge.id) {
      const { error: err } = await supabase
        .from('challenges')
        .update(payload)
        .eq('id', currentChallenge.id);
      if (err) alert('Erro ao salvar desafio: ' + err.message);
    } else {
      const { error: err } = await supabase
        .from('challenges')
        .insert([payload]);
      if (err) alert('Erro ao salvar desafio: ' + err.message);
    }

    setIsEditing(false);
    setCurrentChallenge({});
    fetchChallenges();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este desafio?')) return;
    const { error } = await supabase.from('challenges').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchChallenges();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black dark:text-white text-gray-900 mb-1 uppercase italic tracking-tighter">Sistema de Gamificação</h1>
          <p className="text-slate-500 text-sm font-medium">Gerencie os desafios, recompensas e estímulos para os usuários.</p>
        </div>
        <button
          onClick={() => { setCurrentChallenge({ is_active: true, type: 'reading', icon: 'Star' }); setIsEditing(true); }}
          className="flex items-center gap-2 bg-primary text-slate-900 px-6 py-3 rounded-xl font-black uppercase text-sm shadow-lg hover:shadow-primary/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-5 h-5" /> Novo Desafio
        </button>
      </div>

      {isEditing && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-white/10 p-8 shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>

          <div className="flex justify-between items-center mb-8 relative">
            <h2 className="text-2xl font-black dark:text-white uppercase italic tracking-tighter flex items-center gap-3">
              <Trophy className="text-primary" />
              {currentChallenge.id ? 'Editar Desafio' : 'Novo Desafio'}
            </h2>
            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-500" />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Título do Desafio</label>
                <input
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm font-bold focus:border-primary outline-none transition-all"
                  value={currentChallenge.title || ''}
                  onChange={e => setCurrentChallenge({ ...currentChallenge, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Descrição</label>
                <textarea
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm focus:border-primary outline-none transition-all min-h-[100px] resize-none"
                  value={currentChallenge.description || ''}
                  onChange={e => setCurrentChallenge({ ...currentChallenge, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Icone (Lucide Name)</label>
                  <input
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm font-mono focus:border-primary outline-none"
                    value={currentChallenge.icon || ''}
                    onChange={e => setCurrentChallenge({ ...currentChallenge, icon: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Tipo</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm font-bold focus:border-primary outline-none"
                    value={currentChallenge.type || 'reading'}
                    onChange={e => setCurrentChallenge({ ...currentChallenge, type: e.target.value as any })}
                  >
                    <option value="reading">Leitura</option>
                    <option value="sharing">Compartilhamento</option>
                    <option value="engagement">Engajamento</option>
                    <option value="special">Especial</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">XP (Pontos)</label>
                  <input
                    type="number"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm font-bold focus:border-primary outline-none"
                    value={currentChallenge.points_reward || 0}
                    onChange={e => setCurrentChallenge({ ...currentChallenge, points_reward: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Facetas ($FC)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm font-bold focus:border-primary outline-none"
                    value={currentChallenge.facets_reward || 0}
                    onChange={e => setCurrentChallenge({ ...currentChallenge, facets_reward: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Valor Alvo (Meta)</label>
                <input
                  type="number"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm font-bold focus:border-primary outline-none"
                  value={currentChallenge.target_value || 1}
                  onChange={e => setCurrentChallenge({ ...currentChallenge, target_value: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-white/10 mt-8">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={currentChallenge.is_active}
                  onChange={e => setCurrentChallenge({ ...currentChallenge, is_active: e.target.checked })}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
                <label htmlFor="is_active" className="text-sm font-bold cursor-pointer">Desafio Ativo</label>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-4 pt-8 border-t border-gray-200 dark:border-white/5">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-black uppercase text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-green-500 hover:bg-green-600 text-white px-10 py-3 rounded-xl font-black uppercase text-sm shadow-xl shadow-green-500/20 transition-all flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Salvar Desafio
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center animate-pulse text-slate-500 font-bold uppercase tracking-widest">
            Carregando desafios...
          </div>
        ) : challenges.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 dark:border-white/5 rounded-2xl text-slate-500 font-medium font-bold italic">
            Nenhum desafio encontrado. Comece criando um.
          </div>
        ) : (
          challenges.map(ch => (
            <div key={ch.id} className={`bg-white dark:bg-slate-900 rounded-2xl border ${ch.is_active ? 'border-gray-200 dark:border-white/10' : 'border-red-500/20 opacity-60'} p-6 group transition-all hover:shadow-2xl`}>
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => { setCurrentChallenge(ch); setIsEditing(true); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(ch.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="text-xl font-black mb-2 uppercase italic tracking-tighter truncate">{ch.title}</h3>
              <p className="text-sm text-slate-500 mb-6 line-clamp-2 min-h-[40px] leading-relaxed font-medium">{ch.description}</p>

              <div className="grid grid-cols-2 gap-3 pb-6 border-b border-gray-200 dark:border-white/5 mb-6">
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-gray-200 dark:border-white/5">
                  <div className="text-[10px] font-black uppercase text-slate-500 mb-1">XP</div>
                  <div className="text-lg font-black text-primary">+{ch.points_reward}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-gray-200 dark:border-white/5">
                  <div className="text-[10px] font-black uppercase text-slate-500 mb-1">Facetas</div>
                  <div className="text-lg font-black text-accent-yellow">+{ch.facets_reward}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <span className={`px-2 py-1 rounded ${ch.type === 'reading' ? 'bg-blue-500/10 text-blue-500' :
                  ch.type === 'sharing' ? 'bg-purple-500/10 text-purple-500' :
                    ch.type === 'engagement' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-green-500/10 text-green-500'
                  }`}>
                  {ch.type}
                </span>
                <span className="text-slate-500">Meta: {ch.target_value} {ch.type === 'reading' ? 'Artigos' : 'Ações'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
