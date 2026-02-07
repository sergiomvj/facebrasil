'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Image as ImageIcon, Trash2, Edit, Save, BarChart, ExternalLink, X } from 'lucide-react';
import { Ad } from '@/lib/ad-service';
import { upsertAd, deleteAd, toggleAdStatus } from '@/app/actions/ad-actions';

export default function AdManagerPage() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAd, setCurrentAd] = useState<Partial<Ad>>({
        position: 'home_hero',
        is_active: true,
        views: 0,
        clicks: 0,
        category_id: undefined
    });

    async function fetchCategories() {
        const { data, error } = await supabase
            .from('categories')
            .select('id, name')
            .order('name');

        if (!error && data) {
            setCategories(data);
        }
    }

    async function fetchAds() {
        const { data, error } = await supabase
            .from('ads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching ads:', error);
        } else {
            setAds(data || []);
        }
    }

    async function fetchData() {
        // isLoading is already true by default, no need to set it here periodically
        // unless this is called from a refresh button (which it isn't currently)
        await Promise.all([fetchAds(), fetchCategories()]);
        setIsLoading(false);
    }

    useEffect(() => {
        void fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSave = async () => {
        if (!currentAd.title || !currentAd.link_url || !currentAd.position) {
            alert('Please fill in all required fields (Title, URL, Position).');
            return;
        }

        const payload = {
            title: currentAd.title,
            position: currentAd.position,
            image_url: currentAd.image_url,
            link_url: currentAd.link_url,
            is_active: currentAd.is_active || false,
            category_id: currentAd.category_id || null,
        };

        const result = await upsertAd(payload, currentAd.id);

        if (!result.success) {
            alert('Error saving campaign: ' + result.error);
        } else {
            setIsEditing(false);
            setCurrentAd({ position: 'home_hero', is_active: true, views: 0, clicks: 0, category_id: undefined });
            fetchAds();
        }
    };

    const handleToggleActive = async (ad: Ad) => {
        const newStatus = !ad.is_active;
        // Optimistic update
        setAds(ads.map(a => a.id === ad.id ? { ...a, is_active: newStatus } : a));

        const result = await toggleAdStatus(ad.id, newStatus);

        if (!result.success) {
            console.error('Error updating status:', result.error);
            // Revert on error
            fetchAds();
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this campaign?')) return;

        const result = await deleteAd(id);

        if (!result.success) {
            alert('Error deleting campaign: ' + result.error);
        } else {
            fetchAds();
        }
    };

    const handleEdit = (ad: Ad) => {
        setCurrentAd(ad);
        setIsEditing(true);
    };

    const getCategoryName = (catId?: string) => {
        if (!catId) return 'Global (All Categories)';
        return categories.find(c => c.id === catId)?.name || 'Unknown Category';
    };

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter dark:text-white text-gray-900">Ad Manager</h1>
                    <p className="text-slate-400">Manage Facebrasil active campaigns and placements.</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => { setCurrentAd({ position: 'home_hero', is_active: true, views: 0, clicks: 0, category_id: undefined }); setIsEditing(true); }}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent-yellow hover:bg-accent-yellow/90 text-slate-900 font-bold transition-colors shadow-lg shadow-accent-yellow/20"
                    >
                        <Plus className="w-5 h-5" />
                        New Campaign
                    </button>
                )}
            </div>

            {/* Create/Edit Form */}
            {isEditing && (
                <div className="mb-8 bg-slate-900 border border-white/10 rounded-2xl p-6 animate-in fade-in zoom-in duration-200 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-accent-yellow/20 rounded-lg">
                                <Plus className="w-5 h-5 text-accent-yellow" />
                            </div>
                            <h2 className="font-bold text-xl text-white">{currentAd.id ? 'Edit Campaign' : 'Create New Campaign'}</h2>
                        </div>
                        <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Campaign Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Summer Sale 2024"
                                    className="w-full bg-slate-950 border border-white/10 p-3 rounded-xl text-white focus:border-accent-yellow/50 outline-none transition-all"
                                    value={currentAd.title || ''}
                                    onChange={e => setCurrentAd({ ...currentAd, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Placement</label>
                                    <select
                                        className="w-full bg-slate-950 border border-white/10 p-3 rounded-xl text-white focus:border-accent-yellow/50 outline-none transition-all"
                                        value={currentAd.position || 'home_hero'}
                                        onChange={e => setCurrentAd({ ...currentAd, position: e.target.value as Ad['position'] })}
                                    >
                                        <option value="home_hero">Home Hero (Top)</option>
                                        <option value="article_sidebar">Article Sidebar (Right)</option>
                                        <option value="feed_interstitial">Feed Interstitial (Between Cards)</option>
                                        <option value="banner_top">Banner Top (1024x150)</option>
                                        <option value="sticky_footer">Sticky Footer</option>
                                        <option value="inline">Inline Content</option>
                                        <option value="sidebar">Sidebar (350x350 - News & Reads)</option>
                                        <option value="column_middle">Column Middle (300x300 - Cols)</option>
                                        <option value="super_footer">Super Footer (1240x200)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Target Category</label>
                                    <select
                                        className="w-full bg-slate-950 border border-white/10 p-3 rounded-xl text-white focus:border-accent-yellow/50 outline-none transition-all"
                                        value={currentAd.category_id || ''}
                                        onChange={e => setCurrentAd({ ...currentAd, category_id: e.target.value || undefined })} // Handle empty string as undefined/null
                                    >
                                        <option value="">Global (All Categories)</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Target URL</label>
                                <div className="relative">
                                    <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="https://example.com/promo"
                                        className="w-full bg-slate-950 border border-white/10 p-3 pl-10 rounded-xl text-white font-mono text-sm focus:border-accent-yellow/50 outline-none transition-all"
                                        value={currentAd.link_url || ''}
                                        onChange={e => setCurrentAd({ ...currentAd, link_url: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={currentAd.is_active || false} onChange={e => setCurrentAd({ ...currentAd, is_active: e.target.checked })} />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-yellow/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                    <span className="ml-3 text-sm font-medium text-slate-300">Campaign Active</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Banner Image URL</label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    className="w-full bg-slate-950 border border-white/10 p-3 rounded-xl text-white text-sm mb-2"
                                    value={currentAd.image_url || ''}
                                    onChange={e => setCurrentAd({ ...currentAd, image_url: e.target.value })}
                                />
                                <div className="bg-slate-950 border border-white/10 rounded-xl flex items-center justify-center h-48 border-dashed relative overflow-hidden group">
                                    {currentAd.image_url ? (
                                        <img src={currentAd.image_url} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center text-slate-500">
                                            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                            <span className="text-xs">Preview will appear here</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t border-white/5 pt-6">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition-all shadow-lg shadow-green-500/20"
                        >
                            <Save className="w-4 h-4" />
                            {currentAd.id ? 'Update Campaign' : 'Launch Campaign'}
                        </button>
                    </div>
                </div>
            )}

            {/* Ads List */}
            {isLoading ? (
                <div className="text-center py-20">
                    <div className="w-12 h-12 border-4 border-accent-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading campaigns...</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {ads.length === 0 ? (
                        <div className="text-center py-20 bg-slate-900 border border-white/5 rounded-2xl">
                            <BarChart className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Campaigns Yet</h3>
                            <p className="text-slate-500 max-w-md mx-auto">Create your first ad campaign to start monetizing your content.</p>
                        </div>
                    ) : ads.map((ad) => (
                        <div key={ad.id} className="bg-slate-900 border border-white/5 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-6 hover:border-white/10 transition-all group">
                            {/* Thumbnail */}
                            <div className="w-full md:w-32 h-20 bg-slate-950 rounded-lg overflow-hidden border border-white/5 flex-shrink-0 relative">
                                {ad.image_url ? (
                                    <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                        <ImageIcon className="w-6 h-6 text-slate-600" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-bold text-lg text-white truncate">{ad.title}</h3>
                                    <label className="relative inline-flex items-center cursor-pointer ml-2">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={ad.is_active}
                                            onChange={() => handleToggleActive(ad)}
                                        />
                                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                                    <span className="bg-slate-950 px-2 py-1 rounded border border-white/5">{ad.position}</span>
                                    {ad.category_id && (
                                        <span className="bg-indigo-900/30 text-indigo-300 px-2 py-1 rounded border border-indigo-500/20 flex items-center gap-1">
                                            Target: {getCategoryName(ad.category_id)}
                                        </span>
                                    )}
                                    <a href={ad.link_url} target="_blank" rel="noreferrer" className="hover:text-accent-yellow truncate max-w-[200px] block opacity-60 hover:opacity-100 transition-opacity">{ad.link_url}</a>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 md:gap-8 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
                                <div className="text-center min-w-[60px]">
                                    <div className="text-sm font-bold text-white mb-1">{(ad.views || 0).toLocaleString()}</div>
                                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Views</div>
                                </div>
                                <div className="text-center min-w-[60px]">
                                    <div className="text-sm font-bold text-accent-yellow mb-1">{(ad.clicks || 0).toLocaleString()}</div>
                                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Clicks</div>
                                </div>
                                <div className="text-center min-w-[60px]">
                                    <div className="text-sm font-bold text-green-400 mb-1">
                                        {ad.views > 0 ? ((ad.clicks || 0) / ad.views * 100).toFixed(2) : '0.00'}%
                                    </div>
                                    <div className="text-[10px] uppercase tracking-wider text-slate-500">CTR</div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 md:border-l border-white/5 md:pl-6 pt-4 md:pt-0">
                                <button
                                    onClick={() => handleEdit(ad)}
                                    className="p-2.5 text-slate-400 hover:text-white bg-slate-950 hover:bg-white/10 rounded-xl transition-colors border border-white/5"
                                    title="Edit"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(ad.id)}
                                    className="p-2.5 text-slate-400 hover:text-red-400 bg-slate-950 hover:bg-red-500/10 rounded-xl transition-colors border border-white/5"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
