'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, Save, X, Hash, Palette, Search } from 'lucide-react';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCat, setCurrentCat] = useState<any>({});
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        const { data } = await supabase.from('categories').select('*').order('name');
        if (data) setCategories(data);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!currentCat.name || !currentCat.slug) return;

        const payload: any = {
            name: currentCat.name,
            slug: currentCat.slug,
            color: currentCat.color || '#3B82F6',
        };

        // Ensure we have a blog_id for new categories
        if (!currentCat.id) {
            const { data: blogs } = await supabase.from('blogs').select('id').limit(1);
            if (blogs && blogs.length > 0) {
                payload.blog_id = blogs[0].id;
            }
        }

        let error;
        if (currentCat.id) {
            const { error: err } = await supabase.from('categories').update(payload).eq('id', currentCat.id);
            error = err;
        } else {
            const { error: err } = await supabase.from('categories').insert([payload]);
            error = err;
        }

        if (!error) {
            setIsEditing(false);
            setCurrentCat({});
            fetchCategories();
        } else {
            alert('Error saving category: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category? This might affect existing articles.')) return;
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchCategories();
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black dark:text-white text-gray-900 mb-1">Categories</h1>
                    <p className="text-slate-400 text-sm">Organize your content into sections</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => { setCurrentCat({ color: '#3B82F6' }); setIsEditing(true); }}
                        className="bg-primary text-slate-900 px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all w-full md:w-auto"
                    >
                        <Plus className="w-5 h-5" /> New Category
                    </button>
                )}
            </div>

            {/* Quick Filter */}
            {!isEditing && (
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Filter categories..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            )}

            {isEditing && (
                <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 mb-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/20 rounded-lg">
                                <Plus className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="font-black text-xl text-white">{currentCat.id ? 'Edit Category' : 'Create New Category'}</h3>
                        </div>
                        <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Display Name</label>
                                <div className="relative">
                                    <input
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 pl-4 text-white focus:border-primary/50 outline-none transition-all"
                                        placeholder="e.g. Saúde e Bem Estar"
                                        value={currentCat.name || ''}
                                        onChange={e => setCurrentCat({ ...currentCat, name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">URL Slug</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 pl-10 text-white font-mono text-sm focus:border-primary/50 outline-none transition-all"
                                        placeholder="saude-e-bem-estar"
                                        value={currentCat.slug || ''}
                                        onChange={e => setCurrentCat({ ...currentCat, slug: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Theme Color</label>
                                <div className="flex gap-4">
                                    <div
                                        className="w-14 h-14 rounded-2xl border-2 border-white/20 shadow-inner flex-shrink-0"
                                        style={{ backgroundColor: currentCat.color || '#3B82F6' }}
                                    ></div>
                                    <div className="relative flex-1">
                                        <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                        <input
                                            className="w-full h-14 bg-slate-950 border border-white/10 rounded-xl p-3 pl-10 text-white cursor-pointer"
                                            type="color"
                                            value={currentCat.color || '#3B82F6'}
                                            onChange={e => setCurrentCat({ ...currentCat, color: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-950/50 border border-white/5 rounded-xl text-xs text-slate-500 italic">
                                Tip: The color will be used for badges and category highlights throughout the site.
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-green-500 hover:bg-green-600 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-500/20 transition-all"
                        >
                            <Save className="w-5 h-5" /> {currentCat.id ? 'Update Category' : 'Create Category'}
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                {loading ? <div className="p-12 text-center text-slate-400">Loading categories...</div> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-950/50 border-b border-white/5 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                                <tr>
                                    <th className="p-4 pl-6">Category Name</th>
                                    <th className="p-4">Slug</th>
                                    <th className="p-4">Color</th>
                                    <th className="p-4 text-right pr-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-500 italic">No categories found matching your search.</td>
                                    </tr>
                                ) : filteredCategories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                                <span className="font-bold text-white group-hover:text-primary transition-colors">{cat.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs text-slate-400 font-mono tracking-tight bg-slate-950/50 px-2 py-1 rounded border border-white/5">{cat.slug}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                                                <div className="w-6 h-6 rounded-lg border border-white/20 shadow-md" style={{ backgroundColor: cat.color }}></div>
                                                {cat.color.toUpperCase()}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right pr-6">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                <button onClick={() => { setCurrentCat(cat); setIsEditing(true); }} className="p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors" title="Edit Category">
                                                    <Edit className="w-4.5 h-4.5" />
                                                </button>
                                                <button onClick={() => handleDelete(cat.id)} className="p-2.5 text-slate-400 hover:text-red-400 rounded-xl hover:bg-red-400/10 transition-colors" title="Delete Category">
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
