// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Plus, Edit, Trash2, Save, X, Hash, Palette, Search,
    ChevronRight, ChevronDown, Folder, CornerDownRight
} from 'lucide-react';
import { buildCategoryTree, flattenCategoryTree, Category } from '@/lib/category-utils';

// Category interface moved to lib/category-utils.ts

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCat, setCurrentCat] = useState<Partial<Category>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    // Fetch and build tree
    async function fetchCategories() {
        setLoading(true);
        const { data, error } = await supabase.from('categories').select('*').order('name');

        if (error) {
            console.error('Error fetching categories:', error);
        } else if (data) {
            setCategories(buildCategoryTree(data as Category[]));
        }
        setLoading(false);
    }

    useEffect(() => {
        void fetchCategories();
    }, []);

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSave = async () => {
        if (!currentCat.name || !currentCat.slug) return;

        const payload: any = {
            name: currentCat.name,
            slug: currentCat.slug,
            color: currentCat.color || '#3B82F6',
            // Explicitly ensure empty strings from <select> are treated as null for Postgres
            parent_id: currentCat.parent_id === "" ? null : (currentCat.parent_id || null),
            escopo: currentCat.escopo || [],
            updated_at: new Date().toISOString()
        };

        // Ensure we have a blog_id for new categories
        if (!currentCat.id) {
            const { data: blogs } = await supabase.from('blogs').select('id').limit(1);
            if (blogs && blogs.length > 0) {
                payload.blog_id = blogs[0].id;
            }
        }

        let result;
        if (currentCat.id) {
            result = await supabase.from('categories').update(payload).eq('id', currentCat.id);
        } else {
            result = await supabase.from('categories').insert([payload]);
        }

        if (!result.error) {
            setIsEditing(false);
            setCurrentCat({});
            fetchCategories();
        } else {
            console.error('Save error:', result.error);
            alert('Error saving category: ' + result.error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category? This might affect existing articles.')) return;
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchCategories();
    };

    const flatListForDropdown = flattenCategoryTree(categories, 0, currentCat.id);

    // Filter categories based on search
    const filterTree = (nodes: Category[], query: string): Category[] => {
        if (!query) return nodes;

        return nodes.reduce((acc: Category[], node) => {
            const matchesSelf = node.name.toLowerCase().includes(query.toLowerCase()) ||
                node.slug.toLowerCase().includes(query.toLowerCase());

            const filteredChildren = node.children ? filterTree(node.children, query) : [];
            const hasMatchingChildren = filteredChildren.length > 0;

            if (matchesSelf || hasMatchingChildren) {
                // Automatically expand parents of matches
                if (hasMatchingChildren && !expanded[node.id]) {
                    // This is side-effecty but helps UX
                    // Use a timeout or a separate effect to avoid state updates during render
                }
                acc.push({ ...node, children: filteredChildren });
            }
            return acc;
        }, []);
    };

    const filteredCategories = filterTree(categories, searchQuery);

    // Auto-expand parents when searching
    useEffect(() => {
        if (searchQuery) {
            const expandAll = (nodes: Category[]) => {
                const newExpands: Record<string, boolean> = {};
                const traverse = (ns: Category[]) => {
                    ns.forEach(n => {
                        if (n.children?.length) {
                            newExpands[n.id] = true;
                            traverse(n.children);
                        }
                    });
                };
                traverse(nodes);
                setExpanded(prev => ({ ...prev, ...newExpands }));
            };
            expandAll(categories);
        }
    }, [searchQuery, categories]);

    // Recursive Tree Item Component
    const CategoryItem = ({ category, level = 0 }: { category: Category, level?: number }) => {
        const hasChildren = category.children && category.children.length > 0;
        const isExpanded = expanded[category.id];

        return (
            <div className="select-none">
                <div
                    className={`
                        flex items-center gap-3 p-3 rounded-xl border border-transparent 
                        hover:bg-white/[0.02] hover:border-white/5 transition-all group
                        ${level > 0 ? 'ml-6' : ''}
                    `}
                >
                    <div className="flex items-center gap-2 flex-1">
                        {/* Indent connector */}
                        {level > 0 && <CornerDownRight className="w-4 h-4 text-slate-600" />}

                        {/* Expand Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleExpand(category.id); }}
                            className={`p-1 rounded-lg hover:bg-white/10 transition-colors ${hasChildren ? 'visible' : 'invisible'}`}
                        >
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </button>

                        {/* Icon & Color */}
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 shadow-sm" style={{ backgroundColor: category.color + '20' }}>
                            <Folder className="w-4 h-4" style={{ color: category.color }} />
                        </div>

                        {/* Name & Slug */}
                        <div>
                            <div className="font-bold text-slate-200 group-hover:text-white transition-colors">
                                {category.name}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 bg-slate-950/30 px-1.5 py-0.5 rounded inline-block">
                                {category.slug}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                            onClick={() => {
                                setCurrentCat({ parent_id: category.id, color: '#3B82F6' });
                                setIsEditing(true);
                            }}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Add Subcategory"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => { setCurrentCat(category); setIsEditing(true); }}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(category.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Subcategories */}
                {hasChildren && isExpanded && (
                    <div className="border-l-2 border-slate-800 ml-9 pl-1 mt-1 space-y-1">
                        {category.children!.map(child => (
                            <CategoryItem key={child.id} category={child} level={level + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black dark:text-white text-gray-900 mb-1">Categories Structure</h1>
                    <p className="text-slate-400 text-sm">Manage category hierarchy and organization</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search structure..."
                            className="bg-slate-900/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all w-full sm:w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => { setCurrentCat({ color: '#3B82F6', parent_id: null }); setIsEditing(true); }}
                            className="bg-primary text-slate-900 px-6 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all w-full md:w-auto text-sm"
                        >
                            <Plus className="w-5 h-5" /> New Root Category
                        </button>
                    )}
                </div>
            </div>

            {/* Editing Form */}
            {isEditing && (
                <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 mb-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/20 rounded-lg">
                                {currentCat.id ? <Edit className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                            </div>
                            <h3 className="font-black text-xl text-white">
                                {currentCat.id ? 'Edit Category' : 'Create New Category'}
                            </h3>
                        </div>
                        <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Display Name</label>
                                <input
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 pl-4 text-white focus:border-primary/50 outline-none transition-all"
                                    placeholder="e.g. Technology"
                                    value={currentCat.name || ''}
                                    onChange={e => setCurrentCat({ ...currentCat, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">URL Slug</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 pl-10 text-white font-mono text-sm focus:border-primary/50 outline-none transition-all"
                                        placeholder="technology"
                                        value={currentCat.slug || ''}
                                        onChange={e => setCurrentCat({ ...currentCat, slug: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Parent Category</label>
                                <select
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 outline-none transition-all appearance-none"
                                    value={currentCat.parent_id || ''}
                                    onChange={e => setCurrentCat({ ...currentCat, parent_id: e.target.value || null })}
                                >
                                    <option value="">No Parent (Root Level)</option>
                                    {flatListForDropdown.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {'\u00A0'.repeat(cat.depth * 4)} {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

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

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                    Escopo do Artigo (Tópicos Sugeridos)
                                </label>
                                <textarea
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-primary/50 outline-none transition-all h-32 resize-none leading-relaxed"
                                    placeholder="Insira um tópico por linha...&#10;Ex: Visto de Estudante&#10;Processo de Imigração&#10;Custo de Vida"
                                    value={currentCat.escopo ? currentCat.escopo.join('\n') : ''}
                                    onChange={e => setCurrentCat({
                                        ...currentCat,
                                        escopo: e.target.value.split('\n').filter(line => line.trim() !== '')
                                    })}
                                />
                                <p className="mt-2 text-[10px] text-slate-500 italic">Estes tópicos aparecerão como opções fixas no gerador de artigos via IA.</p>
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
                            <Save className="w-5 h-5" /> {currentCat.id ? 'Update' : 'Create'}
                        </button>
                    </div>
                </div>
            )}

            {/* Tree View */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-xl min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-pulse">
                        <Folder className="w-12 h-12 mb-4 opacity-50" />
                        <p>Loading structure...</p>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-xl">
                        <p className="text-slate-500 mb-4">No categories found in the database.</p>
                        <button
                            onClick={() => { setCurrentCat({ color: '#3B82F6' }); setIsEditing(true); }}
                            className="text-primary font-bold hover:underline"
                        >
                            Create your first category
                        </button>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filteredCategories.map(cat => (
                            <CategoryItem key={cat.id} category={cat} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
