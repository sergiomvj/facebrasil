// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus, ShoppingBag, Star, LayoutGrid, Edit2, Trash2,
    Save, X, Globe, Link as LinkIcon, Gift,
    Tag, DollarSign, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import {
    fetchPartners, upsertPartner, deletePartner,
    fetchPartnerOffers, upsertOffer, deleteOffer,
    Partner, PartnerOffer
} from '@/app/actions/shop-actions';

export default function AdminShopPage() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [offers, setOffers] = useState<PartnerOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'partners' | 'offers'>('partners');
    const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);

    // Form states
    const [showPartnerForm, setShowPartnerForm] = useState(false);
    const [showOfferForm, setShowOfferForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const [partnerFormData, setPartnerFormData] = useState<Partial<Partner>>({
        name: '',
        description: '',
        logo_url: '',
        website_url: '',
        category: 'Varejo',
        is_active: true
    });

    const [offerFormData, setOfferFormData] = useState<Partial<PartnerOffer>>({
        partner_id: '',
        title: '',
        description: '',
        offer_type: 'product',
        facet_cost: 1000,
        currency_value: 0,
        discount_percent: 0,
        is_active: true
    });

    async function loadInitialData() {
        try {
            setLoading(true);
            const data = await fetchPartners();
            setPartners(data);
            if (data.length > 0) {
                setSelectedPartnerId(data[0].id);
                const offersData = await fetchPartnerOffers(data[0].id);
                setOffers(offersData);
            }
        } catch (error) {
            console.error('[ShopAdmin] Error:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadInitialData();
    }, []);

    const handlePartnerSave = async () => {
        try {
            setSaving(true);
            const result = await upsertPartner(partnerFormData, partnerFormData.id);
            if (result.success) {
                setShowPartnerForm(false);
                void loadInitialData();
            } else {
                alert('Erro ao salvar parceiro: ' + result.error);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleOfferSave = async () => {
        try {
            setSaving(true);
            if (!offerFormData.partner_id && selectedPartnerId) {
                offerFormData.partner_id = selectedPartnerId;
            }
            const result = await upsertOffer(offerFormData, offerFormData.id);
            if (result.success) {
                setShowOfferForm(false);
                if (selectedPartnerId) {
                    const data = await fetchPartnerOffers(selectedPartnerId);
                    setOffers(data);
                }
            } else {
                alert('Erro ao salvar oferta: ' + result.error);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePartner = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este parceiro e todas as suas ofertas?')) return;
        const result = await deletePartner(id);
        if (result.success) void loadInitialData();
    };

    const handleDeleteOffer = async (id: string) => {
        if (!confirm('Excluir esta oferta?')) return;
        const result = await deleteOffer(id);
        if (result.success && selectedPartnerId) {
            const data = await fetchPartnerOffers(selectedPartnerId);
            setOffers(data);
        }
    };

    const handlePartnerSelect = async (id: string) => {
        setSelectedPartnerId(id);
        const data = await fetchPartnerOffers(id);
        setOffers(data);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter dark:text-white text-gray-900 mb-1">FacebrasilShop</h1>
                    <p className="text-slate-500 font-bold text-sm tracking-wide">Gestão de parceiros comerciais e troca de Facetas ($FC).</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setActiveTab('partners');
                            setPartnerFormData({ name: '', description: '', is_active: true, category: 'Varejo' });
                            setShowPartnerForm(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-slate-900 rounded-xl font-black uppercase tracking-wider text-xs shadow-lg hover:shadow-primary/20 transition-all hover:scale-[1.02]"
                    >
                        <Plus className="w-4 h-4" /> Novo Parceiro
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Partners List Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-2">Parceiros Ativos</h3>
                    <div className="space-y-2">
                        {partners.map(partner => (
                            <button
                                key={partner.id}
                                onClick={() => handlePartnerSelect(partner.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedPartnerId === partner.id
                                    ? 'bg-primary/10 border-primary shadow-sm shadow-primary/10'
                                    : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-white/5 opacity-60 hover:opacity-100'
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/10">
                                    {partner.logo_url ? <img src={partner.logo_url} className="w-full h-full object-cover" /> : <ShoppingBag className="w-5 h-5" />}
                                </div>
                                <div className="text-left min-w-0">
                                    <div className="text-xs font-black dark:text-white text-gray-900 truncate uppercase">{partner.name}</div>
                                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{partner.category}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content (Offers Management) */}
                <div className="lg:col-span-3">
                    {selectedPartnerId ? (
                        <div className="space-y-6">
                            {/* Selected Partner Info */}
                            {partners.find(p => p.id === selectedPartnerId) && (
                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                    <div className="flex items-center gap-6 relative">
                                        <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-primary/20 shadow-inner overflow-hidden">
                                            {partners.find(p => p.id === selectedPartnerId)?.logo_url ? (
                                                <img src={partners.find(p => p.id === selectedPartnerId)?.logo_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <ShoppingBag className="w-8 h-8 text-primary" />
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black dark:text-white text-gray-900 uppercase italic tracking-tighter">
                                                {partners.find(p => p.id === selectedPartnerId)?.name}
                                            </h2>
                                            <p className="text-sm text-slate-500 font-medium">
                                                {partners.find(p => p.id === selectedPartnerId)?.category} • {partners.find(p => p.id === selectedPartnerId)?.website_url}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 relative">
                                        <button
                                            onClick={() => {
                                                const p = partners.find(p => p.id === selectedPartnerId);
                                                if (p) {
                                                    setPartnerFormData(p);
                                                    setShowPartnerForm(true);
                                                }
                                            }}
                                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 hover:border-primary/50 transition-all"
                                        >
                                            <Edit2 className="w-4 h-4 text-slate-400" />
                                        </button>
                                        <button
                                            onClick={() => handleDeletePartner(selectedPartnerId)}
                                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 hover:border-red-500/50 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Offers Header */}
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Ofertas e Benefícios</h3>
                                <button
                                    onClick={() => {
                                        setOfferFormData({ partner_id: selectedPartnerId, facet_cost: 1000, offer_type: 'product', is_active: true });
                                        setShowOfferForm(true);
                                    }}
                                    className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                                >
                                    <Plus className="w-3 h-3" /> Adicionar Oferta
                                </button>
                            </div>

                            {/* Offers Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {offers.length === 0 ? (
                                    <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                                        <Gift className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                        <p className="text-sm text-slate-400 font-medium italic">Nenhuma oferta cadastrada para este parceiro.</p>
                                    </div>
                                ) : offers.map(offer => (
                                    <div key={offer.id} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-gray-200 dark:border-white/10 hover:border-primary/30 transition-all group shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2 text-primary">
                                                <Tag className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{offer.offer_type}</span>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => { setOfferFormData(offer); setShowOfferForm(true); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Edit2 className="w-3 h-3 text-slate-400" /></button>
                                                <button onClick={() => handleDeleteOffer(offer.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-3 h-3 text-red-500" /></button>
                                            </div>
                                        </div>
                                        <h4 className="text-lg font-black dark:text-white text-gray-900 mb-2 uppercase italic">{offer.title}</h4>
                                        <p className="text-xs text-slate-500 line-clamp-2 mb-4 h-8">{offer.description}</p>
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                                            <div className="flex items-center gap-1.5">
                                                <Star className="w-4 h-4 text-accent-yellow fill-accent-yellow/20" />
                                                <span className="text-sm font-black text-accent-yellow">{offer.facet_cost.toLocaleString()} $FC</span>
                                            </div>
                                            {offer.currency_value && offer.currency_value > 0 && (
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Valor Ref: ${offer.currency_value}</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-900 border border-dashed border-gray-200 dark:border-white/10 rounded-3xl p-12 shadow-inner">
                            <LayoutGrid className="w-16 h-16 text-slate-300 mb-6 opacity-20" />
                            <h3 className="text-xl font-black text-slate-400 uppercase tracking-tighter">Selecione um Parceiro</h3>
                            <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto mt-2">Escolha na lista ao lado para gerenciar ofertas e convênios.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Partner Modal */}
            {showPartnerForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in active:scale-100 scale-95 duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-white/10 w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter">{partnerFormData.id ? 'Editar Parceiro' : 'Cadastrar Parceiro'}</h3>
                            <button onClick={() => setShowPartnerForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nome do Parceiro</label>
                                    <input
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold"
                                        value={partnerFormData.name}
                                        onChange={e => setPartnerFormData({ ...partnerFormData, name: e.target.value })}
                                        placeholder="Ex: Amazon, Mercado Livre..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Categoria</label>
                                    <select
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold"
                                        value={partnerFormData.category}
                                        onChange={e => setPartnerFormData({ ...partnerFormData, category: e.target.value })}
                                    >
                                        <option value="Varejo">Varejo</option>
                                        <option value="Educação">Educação</option>
                                        <option value="Saúde">Saúde</option>
                                        <option value="Serviços">Serviços</option>
                                        <option value="Viagem">Viagem</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Website</label>
                                    <input
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold"
                                        value={partnerFormData.website_url}
                                        onChange={e => setPartnerFormData({ ...partnerFormData, website_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">URL Logo</label>
                                <input
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold"
                                    value={partnerFormData.logo_url}
                                    onChange={e => setPartnerFormData({ ...partnerFormData, logo_url: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Descrição Curta</label>
                                <textarea
                                    rows={3}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold"
                                    value={partnerFormData.description}
                                    onChange={e => setPartnerFormData({ ...partnerFormData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => setShowPartnerForm(false)} className="px-6 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Cancelar</button>
                                <button
                                    onClick={handlePartnerSave}
                                    disabled={saving}
                                    className="px-8 py-3 bg-primary text-slate-900 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg flex items-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Salvar Parceiro
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Offer Modal */}
            {showOfferForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in active:scale-100 scale-95 duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-white/10 w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter">{offerFormData.id ? 'Editar Oferta' : 'Nova Oferta'}</h3>
                            <button onClick={() => setShowOfferForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Título da Oferta</label>
                                <input
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold"
                                    value={offerFormData.title}
                                    onChange={e => setOfferFormData({ ...offerFormData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Tipo</label>
                                    <select
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold"
                                        value={offerFormData.offer_type}
                                        onChange={e => setOfferFormData({ ...offerFormData, offer_type: e.target.value as any })}
                                    >
                                        <option value="product">Produto</option>
                                        <option value="service">Serviço</option>
                                        <option value="discount">Desconto %</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Custo em Facetas ($FC)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold text-accent-yellow"
                                        value={offerFormData.facet_cost}
                                        onChange={e => setOfferFormData({ ...offerFormData, facet_cost: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Valor Ref ($)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold"
                                        value={offerFormData.currency_value}
                                        onChange={e => setOfferFormData({ ...offerFormData, currency_value: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">% Desconto</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold"
                                        value={offerFormData.discount_percent}
                                        onChange={e => setOfferFormData({ ...offerFormData, discount_percent: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Regras/Descrição</label>
                                <textarea
                                    rows={4}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold"
                                    value={offerFormData.description}
                                    onChange={e => setOfferFormData({ ...offerFormData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => setShowOfferForm(false)} className="px-6 py-3 font-black text-xs uppercase tracking-widest text-slate-500">Cancelar</button>
                                <button
                                    onClick={handleOfferSave}
                                    disabled={saving}
                                    className="px-8 py-3 bg-green-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg flex items-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Salvar Oferta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
