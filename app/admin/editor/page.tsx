'use client';

import React, { useState, useEffect, Suspense } from 'react';
import EditorRichText from '@/components/EditorRichText';
import Navbar from '@/components/Navbar';
import { Save, Eye, Send, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { generateSlug } from '@/lib/utils';
import { upsertArticle } from '@/app/actions/article-actions';

function EditorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const articleId = searchParams.get('id');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [socialSummary, setSocialSummary] = useState('');
    const [instagramUrl, setInstagramUrl] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [featuredImageUrl, setFeaturedImageUrl] = useState('');
    const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');

    useEffect(() => {
        loadInitialData();
    }, [articleId]);

    const loadInitialData = async () => {
        setLoading(true);
        // Load Categories
        const { data: cats } = await supabase.from('categories').select('id, name').order('name');
        if (cats) setCategories(cats);

        // Load Article if ID present
        if (articleId) {
            const { data: post } = await supabase.from('articles').select('*').eq('id', articleId).single();
            if (post) {
                setTitle(post.title);
                setSlug(post.slug);
                setContent(post.content);
                setExcerpt(post.excerpt || '');
                setSocialSummary(post.social_summary || '');
                setInstagramUrl(post.instagram_post_url || '');
                setCategoryId(post.category_id || '');
                setStatus(post.status || 'DRAFT');

                // Parse featured_image if JSON string or object
                try {
                    const img = typeof post.featured_image === 'string' ? JSON.parse(post.featured_image) : post.featured_image;
                    setFeaturedImageUrl(img?.url || '');
                } catch (e) {
                    setFeaturedImageUrl('');
                }
            }
        }
        setLoading(false);
    };

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
            read_time: Math.ceil(content.split(' ').length / 200) || 1
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

    if (loading) return <div className="text-center pt-20 text-slate-500">Loading editor...</div>;

    return (
        <main className="pt-24 pb-20 px-6 max-w-[1000px] mx-auto">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/articles" className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-3xl font-black tracking-tighter">{articleId ? 'Edit Article' : 'New Article'}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-2 border border-slate-700">
                        <span className="text-xs font-bold text-slate-500 uppercase px-2">Status:</span>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                            className="bg-transparent text-sm text-white py-2 focus:outline-none cursor-pointer"
                        >
                            <option value="DRAFT">Draft</option>
                            <option value="PUBLISHED">Published</option>
                        </select>
                    </div>
                    <button
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-slate-900 font-bold transition-colors text-sm disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Article Meta */}
            <div className="space-y-6 mb-8">
                <input
                    type="text"
                    placeholder="Article Title Here..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent text-5xl font-black tracking-tight placeholder:text-slate-700 focus:outline-none"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-900/50 border border-white/5 rounded-2xl">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 font-bold uppercase">Slug (URL)</label>
                            <input
                                className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-sm text-slate-300"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="auto-generated-slug"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 font-bold uppercase">Details</label>
                            <select
                                className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-sm text-slate-300"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 font-bold uppercase">Featured Image URL</label>
                            <input
                                className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-sm text-slate-300"
                                value={featuredImageUrl}
                                onChange={(e) => setFeaturedImageUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 font-bold uppercase">Excerpt</label>
                            <textarea
                                className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-sm text-slate-300 h-24 resize-none"
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                placeholder="Checking..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Editor */}
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
        </main>
    );
}

export default function EditorPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-primary selection:text-white">
            <Navbar />
            <Suspense fallback={<div className="pt-24 text-center">Loading...</div>}>
                <EditorContent />
            </Suspense>
        </div>
    );
}
