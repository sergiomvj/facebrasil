// @ts-nocheck
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import EditorRichText from '@/components/EditorRichText';
import { Save, ArrowLeft, Globe, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link, routing } from '@/i18n/routing';
import { upsertArticle } from '@/app/actions/article-actions';

function EditorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const articleId = searchParams.get('id');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [socialSummary, setSocialSummary] = useState('');
    const [instagramUrl, setInstagramUrl] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [featuredImageUrl, setFeaturedImageUrl] = useState('');
    const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
    const [articleLanguage, setArticleLanguage] = useState('pt');
    const [translationGroupId, setTranslationGroupId] = useState('');
    const [colocarHero, setColocarHero] = useState(false);

    async function loadInitialData() {
        setLoading(true);
        // Load Categories
        const { data: cats } = await supabase.from('categories').select('id, name').order('name');
        if (cats) setCategories(cats);

        // Load Article if ID present
        if (articleId) {
            const { data: post } = await supabase.from('articles').select('*').eq('id', articleId).single();
            if (post) {
                setTitle(post.title || '');
                setSlug(post.slug || '');
                setContent(post.content || '');
                setExcerpt(post.excerpt || '');
                setSocialSummary(post.social_summary || '');
                setInstagramUrl(post.instagram_post_url || '');
                setCategoryId(post.category_id || '');
                setStatus(post.status || 'DRAFT');
                setArticleLanguage(post.language || 'pt');
                setTranslationGroupId(post.translation_group_id || '');
                setColocarHero(post.colocar_hero || false);

                // Parse featured_image if JSON string or object
                try {
                    const img = typeof post.featured_image === 'string' ? JSON.parse(post.featured_image) : post.featured_image;
                    setFeaturedImageUrl(img?.url || '');
                } catch (e) {
                    setFeaturedImageUrl('');
                }
            }
        } else {
            // Default translation group for new articles could be UUID
            setTranslationGroupId(crypto.randomUUID());
        }
        setLoading(false);
    }

    useEffect(() => {
        void loadInitialData();
    }, [articleId]);

    const handleSave = async (targetStatus?: 'DRAFT' | 'PUBLISHED') => {
        if (!title) return alert('Title is required');
        const finalStatus = targetStatus || status;

        setSaving(true);

        const authorId = '301a8aef-0c7f-4b8e-b517-df3ca681f4d2';
        const blogId = '51adbeca-d41d-4bc2-9332-19f96d956921';
        const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const payload = {
            title,
            slug: finalSlug,
            content,
            excerpt,
            social_summary: socialSummary,
            instagram_post_url: instagramUrl,
            category_id: categoryId || null,
            status: finalStatus,
            featured_image: JSON.stringify({ url: featuredImageUrl, alt: title }),
            updated_at: new Date().toISOString(),
            author_id: authorId,
            blog_id: blogId,
            published_at: finalStatus === 'PUBLISHED' ? new Date().toISOString() : null,
            read_time: Math.ceil((content || '').split(' ').length / 200) || 1,
            language: articleLanguage,
            translation_group_id: translationGroupId || null,
            colocar_hero: colocarHero
        };

        const result = await upsertArticle(payload, articleId || undefined);

        setSaving(false);

        if (!result.success) {
            alert('Error saving: ' + result.error);
        } else {
            alert('Article saved successfully!');
            router.push('/admin/articles');
        }
    };

    if (loading) return <div className="text-center pt-20 text-slate-500 font-medium">Loading editor...</div>;

    return (
        <main className="pt-24 pb-20 px-6 max-w-[1200px] mx-auto">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/articles" className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-3xl font-black tracking-tighter">{articleId ? 'Edit Article' : 'New Article'}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-900/50 rounded-xl px-2 border border-white/5">
                        <span className="text-[10px] font-black text-slate-600 uppercase px-2 tracking-widest">Status</span>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                            className="bg-transparent text-sm text-white py-2.5 focus:outline-none cursor-pointer font-bold"
                        >
                            <option value="DRAFT">Draft</option>
                            <option value="PUBLISHED">Published</option>
                        </select>
                    </div>
                    <button
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-slate-900 font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 text-sm disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Article'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                    <input
                        type="text"
                        placeholder="Article Title Here..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-transparent text-5xl md:text-6xl font-black tracking-tight placeholder:text-slate-800 focus:outline-none"
                    />

                    <EditorRichText
                        content={content}
                        initialSocialSummary={socialSummary}
                        initialInstagramUrl={instagramUrl}
                        onChange={(html, summary, url) => {
                            setContent(html);
                            setSocialSummary(summary);
                            setInstagramUrl(url);
                        }}
                    />
                </div>

                <div className="space-y-6">
                    {/* Publication Settings */}
                    <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Meta & SEO</h3>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                    <Globe className="w-3 h-3 text-primary" /> Language
                                </label>
                                <select
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-bold"
                                    value={articleLanguage}
                                    onChange={(e) => setArticleLanguage(e.target.value)}
                                >
                                    {routing.locales.map(loc => (
                                        <option key={loc} value={loc}>{loc.toUpperCase()} - {loc === 'pt' ? 'Português' : loc === 'en' ? 'English' : 'Español'}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                    <LinkIcon className="w-3 h-3 text-primary" /> Translation Group
                                </label>
                                <input
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-[10px] text-slate-400 font-mono tracking-tight"
                                    value={translationGroupId}
                                    onChange={(e) => setTranslationGroupId(e.target.value)}
                                    placeholder="UUID for translation group"
                                />
                                <p className="text-[10px] text-slate-600">Articles with the same ID are considered translations of each other.</p>
                            </div>

                            <div className="space-y-1 pt-4 border-t border-white/5">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={colocarHero}
                                            onChange={(e) => setColocarHero(e.target.checked)}
                                        />
                                        <div className={`w-10 h-5 rounded-full transition-colors ${colocarHero ? 'bg-primary' : 'bg-slate-800'}`}></div>
                                        <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${colocarHero ? 'translate-x-5' : ''}`}></div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Destaque como Hero Article</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Card */}
                    <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Content Details</h3>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Slug (URL)</label>
                                <input
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="auto-generated-slug"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Category</label>
                                <select
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none font-bold"
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Featured Image URL</label>
                                <input
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                                    value={featuredImageUrl}
                                    onChange={(e) => setFeaturedImageUrl(e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Excerpt / Summary</label>
                                <textarea
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white h-32 resize-none focus:outline-none leading-relaxed"
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                    placeholder="Brief summary for social media and listings..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function EditorPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-primary selection:text-white">
            <Suspense fallback={<div className="pt-24 text-center font-bold text-slate-500 uppercase tracking-widest text-xs">Initializing Editor...</div>}>
                <EditorContent />
            </Suspense>
        </div>
    );
}

