'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Image as ImageIcon, Trash2, Edit, Save, BarChart, ExternalLink, X, Globe, MapPin, Hash, CheckCircle2 } from 'lucide-react';
import { Ad } from '@/lib/ad-service';
import { upsertAd, deleteAd, toggleAdStatus, fetchPublications, fetchAdPublications } from '@/app/actions/ad-actions';

type GeoMode = 'global' | 'region' | 'local';

interface Publication {
    id: string;
    name: string;
}

export default function AdManagerPage() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [publications, setPublications] = useState<Publication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [geoMode, setGeoMode] = useState<GeoMode>('global');
    const [selectedPubs, setSelectedPubs] = useState<string[]>([]);

    const [currentAd, setCurrentAd] = useState<Partial<Ad>>({
        position: 'super_hero',
        is_active: true,
        views: 0,
        clicks: 0,
        curiosity_count: 0,
        category_id: undefined,
        target_countries: [],
        target_regions: [],
        target_zip_codes: []
    });

    async function fetchData() {
        setIsLoading(true);
        const [adsRes, catsRes, pubsRes] = await Promise.all([
            supabase.from('ads').select('*').order('created_at', { ascending: false }),
            supabase.from('categories').select('id, name').order('name'),
            fetchPublications()
        ]);

        if (adsRes.data) setAds(adsRes.data);
        if (catsRes.data) setCategories(catsRes.data);
        if (pubsRes) setPublications(pubsRes);
        setIsLoading(false);
    }

    useEffect(() => {
        void fetchData();
    }, []);

    const handleSave = async () => {
        if (!currentAd.title || !currentAd.link_url || !currentAd.position) {
            alert('Por favor, preencha o Título, URL e Posição.');
            return;
        }

        if (selectedPubs.length === 0) {
            alert('Selecione pelo menos uma publicação para veicular o anúncio.');
            return;
        }

        const payload = {
            title: currentAd.title,
            position: currentAd.position as any,
            image_url: currentAd.image_url,
            link_url: currentAd.link_url,
            is_active: currentAd.is_active || false,
            category_id: currentAd.category_id || null,
            target_countries: geoMode === 'region' ? currentAd.target_countries : [],
            target_regions: geoMode === 'region' ? currentAd.target_regions : [],
            target_zip_codes: geoMode === 'local' ? currentAd.target_zip_codes : [],
            publication_ids: selectedPubs
        };

        const result = await upsertAd(payload, currentAd.id);

        if (!result.success) {
            alert('Erro ao salvar campanha: ' + result.error);
        } else {
            setIsEditing(false);
            resetForm();
            fetchData();
        }
    };

    const resetForm = () => {
        setCurrentAd({
            position: 'super_hero',
            is_active: true,
            views: 0,
            clicks: 0,
            curiosity_count: 0,
            category_id: undefined,
            target_countries: [],
            target_regions: [],
            target_zip_codes: []
        });
        setSelectedPubs([]);
        setGeoMode('global');
    };

    const handleEdit = async (ad: Ad) => {
        setCurrentAd(ad);
        const adPubs = await fetchAdPublications(ad.id);
        setSelectedPubs(adPubs);

        if (ad.target_zip_codes && ad.target_zip_codes.length > 0) {
            setGeoMode('local');
        } else if ((ad.target_countries && ad.target_countries.length > 0) || (ad.target_regions && ad.target_regions.length > 0)) {
            setGeoMode('region');
        } else {
            setGeoMode('global');
        }

        setIsEditing(true);
    };

    const handleToggleActive = async (ad: Ad) => {
        const newStatus = !ad.is_active;
        setAds(ads.map(a => a.id === ad.id ? { ...a, is_active: newStatus } : a));
        const result = await toggleAdStatus(ad.id, newStatus);
        if (!result.success) fetchData();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja realmente excluir esta campanha?')) return;
        const result = await deleteAd(id);
        if (result.success) fetchData();
    };

    const togglePub = (pubId: string) => {
        setSelectedPubs(prev =>
            prev.includes(pubId) ? prev.filter(id => id !== pubId) : [...prev, pubId]
        );
    };

    return (
        <div className="p-1 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter dark:text-white text-gray-900 uppercase italic">
                        Gestão de Ads <span className="text-accent-yellow">v2</span>
                    </h1>
                    <p className="text-slate-400">Controle total de veiculação, publicações e geolocalização.</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => { resetForm(); setIsEditing(true); }}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent-yellow hover:bg-yellow-400 text-slate-950 font-black transition-all shadow-lg uppercase shadow-accent-yellow/20"
                    >
                        <Plus className="w-5 h-5" />
                        Nova Campanha
                    </button>
                )}
            </div>

            {isEditing && (
                <div className="mb-8 bg-slate-900 border border-white/10 rounded-2xl p-4 md:p-8 animate-in fade-in zoom-in duration-200 shadow-2xl">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-accent-yellow/10 rounded-xl border border-accent-yellow/30">
                                <Plus className="w-6 h-6 text-accent-yellow" />
                            </div>
                            <div>
                                <h2 className="font-black text-2xl text-white uppercase italic tracking-tighter">
                                    {currentAd.id ? 'Editar Campanha' : 'Lançar Campanha'}
                                </h2>
                                <p className="text-xs text-slate-500 font-mono">Configurações de veiculação avançadas</p>
                            </div>
                        </div>
                        <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Coluna 1: Basics */}
                        <div className="space-y-6 lg:col-span-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Título da Campanha</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Oferta Especial Fev/2024"
                                        className="w-full bg-slate-950 border border-white/10 p-3 rounded-xl text-white focus:border-accent-yellow/50 outline-none transition-all font-bold"
                                        value={currentAd.title || ''}
                                        onChange={e => setCurrentAd({ ...currentAd, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Posicionamento (Placement)</label>
                                    <select
                                        className="w-full bg-slate-950 border border-white/10 p-3 rounded-xl text-white focus:border-accent-yellow/50 outline-none transition-all font-bold"
                                        value={currentAd.position || 'super_hero'}
                                        onChange={e => setCurrentAd({ ...currentAd, position: e.target.value as any })}
                                    >
                                        <option value="super_hero">SuperHero (1240x150 / 300x50)</option>
                                        <option value="sidebar">Sidebar (350x350 / 300x300)</option>
                                        <option value="column">Columm (300x300 / 300x300)</option>
                                        <option value="super_footer">SuperFooter (1240x250 / 300x150)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Link de Destino</label>
                                    <div className="relative">
                                        <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            placeholder="https://..."
                                            className="w-full bg-slate-950 border border-white/10 p-3 pl-10 rounded-xl text-white font-mono text-xs focus:border-accent-yellow/50 outline-none transition-all"
                                            value={currentAd.link_url || ''}
                                            onChange={e => setCurrentAd({ ...currentAd, link_url: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Categoria do Blog</label>
                                    <select
                                        className="w-full bg-slate-950 border border-white/10 p-3 rounded-xl text-white focus:border-accent-yellow/50 outline-none transition-all font-bold"
                                        value={currentAd.category_id || ''}
                                        onChange={e => setCurrentAd({ ...currentAd, category_id: e.target.value || undefined })}
                                    >
                                        <option value="">Global (Todas as categorias)</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Publicações Selection */}
                            <div className="p-6 bg-slate-950/50 rounded-2xl border border-white/5">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Veicular em Publicações</label>
                                <div className="flex flex-wrap gap-4">
                                    {publications.map(pub => (
                                        <button
                                            key={pub.id}
                                            onClick={() => togglePub(pub.id)}
                                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${selectedPubs.includes(pub.id)
                                                    ? 'bg-accent-yellow/20 border-accent-yellow text-accent-yellow'
                                                    : 'bg-slate-900 border-white/10 text-slate-500'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${selectedPubs.includes(pub.id) ? 'bg-accent-yellow border-accent-yellow' : 'bg-transparent border-white/20'
                                                }`}>
                                                {selectedPubs.includes(pub.id) && <CheckCircle2 className="w-4 h-4 text-slate-950" />}
                                            </div>
                                            <span className="font-bold text-sm">{pub.name}</span>
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-4 text-[10px] text-slate-600 italic">*Demais publicações integradas via API receberão este ad conforme disponibilidade.</p>
                            </div>

                            {/* Geolocation Section */}
                            <div className="p-6 bg-slate-950/50 rounded-2xl border border-white/5 space-y-6">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Preferência de Geolocalização</label>

                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={() => setGeoMode('global')}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all gap-2 ${geoMode === 'global' ? 'bg-accent-yellow/10 border-accent-yellow text-accent-yellow shadow-lg' : 'bg-slate-900 border-white/5 text-slate-500'}`}
                                    >
                                        <Globe className="w-6 h-6" />
                                        <span className="text-[10px] font-black uppercase">Global (Sem limites)</span>
                                    </button>
                                    <button
                                        onClick={() => setGeoMode('region')}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all gap-2 ${geoMode === 'region' ? 'bg-accent-yellow/10 border-accent-yellow text-accent-yellow shadow-lg' : 'bg-slate-900 border-white/5 text-slate-500'}`}
                                    >
                                        <MapPin className="w-6 h-6" />
                                        <span className="text-[10px] font-black uppercase">Região (País/Estado)</span>
                                    </button>
                                    <button
                                        onClick={() => setGeoMode('local')}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all gap-2 ${geoMode === 'local' ? 'bg-accent-yellow/10 border-accent-yellow text-accent-yellow shadow-lg' : 'bg-slate-900 border-white/5 text-slate-500'}`}
                                    >
                                        <Hash className="w-6 h-6" />
                                        <span className="text-[10px] font-black uppercase">Local (Postais/Zip)</span>
                                    </button>
                                </div>

                                {geoMode === 'region' && (
                                    <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-500 uppercase mb-2">Países (ISO Codes)</label>
                                            <input
                                                type="text"
                                                placeholder="BR, US, ES"
                                                className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl text-white text-xs"
                                                value={currentAd.target_countries?.join(', ') || ''}
                                                onChange={e => setCurrentAd({ ...currentAd, target_countries: e.target.value.split(',').map(s => s.trim().toUpperCase()).filter(Boolean) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-500 uppercase mb-2">Estados/Regiões</label>
                                            <input
                                                type="text"
                                                placeholder="SP, FL, RJ"
                                                className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl text-white text-xs"
                                                value={currentAd.target_regions?.join(', ') || ''}
                                                onChange={e => setCurrentAd({ ...currentAd, target_regions: e.target.value.split(',').map(s => s.trim().toUpperCase()).filter(Boolean) })}
                                            />
                                        </div>
                                    </div>
                                )}

                                {geoMode === 'local' && (
                                    <div className="animate-in slide-in-from-top-2">
                                        <label className="block text-[9px] font-black text-slate-500 uppercase mb-2">Códigos Postais / Zip Codes (Separados por vírgula)</label>
                                        <textarea
                                            placeholder="33166, 01000-000, 90210"
                                            className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl text-white text-xs font-mono h-20"
                                            value={currentAd.target_zip_codes?.join(', ') || ''}
                                            onChange={e => setCurrentAd({ ...currentAd, target_zip_codes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Coluna 2: Media & Controls */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">URL da Imagem Banner</label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    className="w-full bg-slate-950 border border-white/10 p-3 rounded-xl text-white text-xs mb-4"
                                    value={currentAd.image_url || ''}
                                    onChange={e => setCurrentAd({ ...currentAd, image_url: e.target.value })}
                                />
                                <div className="bg-slate-950 border border-white/10 rounded-2xl flex items-center justify-center aspect-square border-dashed relative overflow-hidden group shadow-inner">
                                    {currentAd.image_url ? (
                                        <img src={currentAd.image_url} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center text-slate-700">
                                            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Preview Indisponível</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 bg-slate-950/50 rounded-2xl border border-white/5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-xs font-black text-white uppercase italic">Status da Campanha</h4>
                                        <p className="text-[10px] text-slate-500">Ativa imediatamente após salvar</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={currentAd.is_active || false} onChange={e => setCurrentAd({ ...currentAd, is_active: e.target.checked })} />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex justify-end gap-4 border-t border-white/5 pt-8">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-8 py-3 rounded-xl font-black text-slate-400 hover:text-white hover:bg-white/5 transition-all uppercase text-xs tracking-widest"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-10 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-slate-950 font-black transition-all shadow-lg shadow-green-500/20 uppercase text-xs tracking-widest"
                        >
                            <Save className="w-5 h-5" />
                            {currentAd.id ? 'Salvar Alterações' : 'Publicar Campanha'}
                        </button>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-40">
                    <div className="w-16 h-16 border-4 border-accent-yellow border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-slate-500 font-mono tracking-widest text-[10px] uppercase">Sincronizando Banco de Dados...</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {ads.length === 0 ? (
                        <div className="text-center py-32 bg-slate-900/50 border border-white/5 rounded-3xl border-dashed">
                            <BarChart className="w-20 h-20 text-slate-800 mx-auto mb-6" />
                            <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">Sem Campanhas Ativas</h3>
                            <p className="text-slate-500 max-w-sm mx-auto text-sm">Crie seu primeiro anúncio para começar a gerenciar o inventário das revistas.</p>
                        </div>
                    ) : ads.map((ad) => (
                        <div key={ad.id} className="bg-slate-900 border border-white/5 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center gap-8 hover:border-white/10 transition-all group relative overflow-hidden shadow-xl">
                            <div className="absolute top-0 left-0 w-1 h-full bg-accent-yellow opacity-40 group-hover:opacity-100 transition-opacity" />

                            {/* Visual Preview */}
                            <div className="w-full lg:w-48 h-28 bg-slate-950 rounded-xl overflow-hidden border border-white/5 flex-shrink-0 relative shadow-lg">
                                {ad.image_url ? (
                                    <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-950">
                                        <ImageIcon className="w-8 h-8 text-slate-800" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-3">
                                    <h3 className="font-black text-xl text-white truncate uppercase italic tracking-tighter">{ad.title}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${ad.is_active ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-red-500/20 text-red-500 border border-red-500/20'
                                        }`}>
                                        {ad.is_active ? 'Online' : 'Offline'}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                    <span className="bg-slate-950 text-white/90 px-2 py-1 rounded-md border border-white/5 text-[10px] font-bold uppercase tracking-tighter shadow-sm">{ad.position}</span>
                                    {ad.target_zip_codes && ad.target_zip_codes.length > 0 && (
                                        <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md border border-blue-500/20 text-[10px] font-bold flex items-center gap-1">
                                            <Hash className="w-3 h-3" /> Zip Targeting
                                        </span>
                                    )}
                                    <span className="bg-slate-950 text-slate-500 px-2 py-1 rounded-md border border-white/5 text-[9px] font-mono truncate max-w-[150px]">{ad.link_url}</span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {/* Stats Grid */}
                                    <div className="p-3 bg-slate-950 rounded-xl border border-white/5">
                                        <div className="text-xl font-black text-white mb-1 uppercase tracking-tighter">{(ad.views || 0).toLocaleString()}</div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">Visualização (20s)</div>
                                    </div>
                                    <div className="p-3 bg-slate-950 rounded-xl border border-white/5">
                                        <div className="text-xl font-black text-accent-yellow mb-1 uppercase tracking-tighter">{(ad.curiosity_count || 0).toLocaleString()}</div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">Curiosidade (10s + Hover)</div>
                                    </div>
                                    <div className="p-3 bg-slate-950 rounded-xl border border-white/5">
                                        <div className="text-xl font-black text-green-400 mb-1 uppercase tracking-tighter">{(ad.clicks || 0).toLocaleString()}</div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">Interesse (Click)</div>
                                    </div>
                                    <div className="p-3 bg-slate-950 rounded-xl border border-white/5 hidden md:block">
                                        <div className="text-xl font-black text-blue-400 mb-1 uppercase tracking-tighter">
                                            {ad.views > 0 ? ((ad.clicks || 0) / ad.views * 100).toFixed(1) : '0.0'}%
                                        </div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">Conversão (CTR)</div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Column */}
                            <div className="flex lg:flex-col lg:justify-center gap-2 lg:border-l border-white/5 lg:pl-8 pt-4 lg:pt-0">
                                <button
                                    onClick={() => handleToggleActive(ad)}
                                    className={`p-3 rounded-xl border transition-all ${ad.is_active ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'
                                        }`}
                                    title={ad.is_active ? 'Pausar' : 'Ativar'}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleEdit(ad)}
                                    className="p-3 text-slate-400 hover:text-white bg-slate-950 hover:bg-white/10 rounded-xl transition-colors border border-white/5 shadow-lg shadow-black/20"
                                    title="Editar Campanha"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(ad.id)}
                                    className="p-3 text-slate-400 hover:text-red-400 bg-slate-950 hover:bg-red-500/10 rounded-xl transition-colors border border-white/5"
                                    title="Excluir"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
