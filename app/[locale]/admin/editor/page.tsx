// @ts-nocheck
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import EditorRichText from '@/components/EditorRichText';
import { Save, ArrowLeft, Globe, Link as LinkIcon, Sparkles, MonitorPlay, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link, routing } from '@/i18n/routing';
import { upsertArticle } from '@/app/actions/article-actions';
import { generateMetadata, generateSEOStrategy, generateSEOTitle, applySEOStrategy } from '@/app/actions/ai-actions';
import { sendArticlesToTV } from '@/app/actions/tv-facebrasil-actions';
import { buildCategoryTree, flattenCategoryTree, Category } from '@/lib/category-utils';

function EditorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const articleId = searchParams.get('id');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [generatingSlug, setGeneratingSlug] = useState(false);
    const [generatingExcerpt, setGeneratingExcerpt] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [authors, setAuthors] = useState<any[]>([]);
    const [authorId, setAuthorId] = useState('');

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
    const [disableViewSimulation, setDisableViewSimulation] = useState(false);
    
    // SEO Strategy State
    const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
    const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
    
    // SEO Application Content State
    const [seoApplied, setSeoApplied] = useState(false);
    const [isApplyingSEO, setIsApplyingSEO] = useState(false);
    const [seoReviewContent, setSeoReviewContent] = useState<string | null>(null);

    const handleGenerateSlug = async () => {
        if (!content && !title) return alert('Escreva algum conteúdo ou título primeiro');
        setGeneratingSlug(true);
        try {
            const result = await generateMetadata(title || content, 'slug');
            if (result.success && result.content) setSlug(result.content);
        } finally {
            setGeneratingSlug(false);
        }
    };

    const handleGenerateExcerpt = async () => {
        if (!content) return alert('Escreva o conteúdo primeiro');
        setGeneratingExcerpt(true);
        try {
            const textContent = content.replace(/<[^>]*>/g, '');
            const result = await generateMetadata(textContent, 'excerpt');
            if (result.success && result.content) setExcerpt(result.content);
        } finally {
            setGeneratingExcerpt(false);
        }
    };

    const handleAggregateSEO = async () => {
        if (!socialSummary) return alert('Por favor, gere ou escreva um "Resumo para Social" primeiro.');
        setIsGeneratingSEO(true);
        try {
            const result = await generateSEOStrategy(socialSummary);
            if (result.success && result.keywords) {
                setSeoKeywords(result.keywords);
            } else {
                alert('Erro ao buscar termos chave: ' + result.error);
            }
        } finally {
            setIsGeneratingSEO(false);
        }
    };

    const handleApplySEO = async () => {
        if (!content || content === '<p></p>') return alert('Escreva o conteúdo do artigo primeiro.');
        if (seoKeywords.length === 0) return alert('Busque os termos chave primeiro.');
        
        setIsApplyingSEO(true);
        try {
            const result = await applySEOStrategy(content, seoKeywords);
            if (result.success && result.content) {
                setSeoReviewContent(result.content);
            } else {
                alert('Erro ao aplicar SEO no texto: ' + result.error);
            }
        } finally {
            setIsApplyingSEO(false);
        }
    };

    const handleGenerateTitle = async () => {
        if (!content || content === '<p></p>') return alert('Escreva o conteúdo do artigo primeiro.');
        if (seoKeywords.length === 0) return alert('Agregue a Estratégia de SEO primeiro para obter melhores resultados.');
        
        setIsGeneratingTitle(true);
        try {
            const textContent = content.replace(/<[^>]*>/g, '');
            const result = await generateSEOTitle(textContent, seoKeywords);
            if (result.success && result.title) {
                setTitle(result.title);
            } else {
                alert('Erro ao gerar título: ' + result.error);
            }
        } finally {
            setIsGeneratingTitle(false);
        }
    };

    async function loadInitialData() {
        setLoading(true);

        // Load Categories
        const { data: cats } = await supabase.from('categories').select('*').order('name');
        if (cats) {
            const tree = buildCategoryTree(cats as Category[]);
            setCategories(flattenCategoryTree(tree));
        }

        // Load Authors
        const { data: authorsData } = await supabase
            .from('profiles')
            .select('id, name')
            .not('role', 'eq', 'VIEWER')
            .order('name');
        if (authorsData) setAuthors(authorsData);

        // Load Article if ID present
        if (articleId) {
            const { data: post } = await supabase.from('articles').select('*').eq('id', articleId).single();
            if (post) {
                setAuthorId(post.author_id || '');
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
                setDisableViewSimulation(post.disable_view_simulation || false);
                setSeoApplied(post.seo_applied || false);

                // Parse featured_image if JSON string or object
                try {
                    const img = typeof post.featured_image === 'string' ? JSON.parse(post.featured_image) : post.featured_image;
                    setFeaturedImageUrl(img?.url || '');
                } catch (e) {
                    setFeaturedImageUrl('');
                }

                // Load existing SEO keywords from ai_context
                try {
                    if (post.ai_context) {
                        const context = typeof post.ai_context === 'string' ? JSON.parse(post.ai_context) : post.ai_context;
                        if (context && Array.isArray(context.seoKeywords)) {
                            setSeoKeywords(context.seoKeywords);
                        }
                    }
                } catch (e) {
                    console.error('Error parsing ai_context for SEO keywords');
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

    const handleSendToTV = async () => {
        if (!articleId) {
            alert('Salve o artigo antes de enviar para a TV.');
            return;
        }
        if (!confirm('Deseja enviar este artigo para a curadoria da TV Facebrasil?')) return;

        const baseUrl = window.location.origin;
        const result = await sendArticlesToTV([{
            id: articleId,
            titulo: title,
            conteudo: content.replace(/<[^>]*>/g, ''),
            link: `${baseUrl}/article/${slug}`
        }]);

        if (result.success) {
            alert('Artigo enviado com sucesso para a TV Facebrasil!');
        } else {
            alert('Erro ao enviar para a TV: ' + result.error);
        }
    };

    const handleSave = async (targetStatus?: 'DRAFT' | 'PUBLISHED') => {
        if (!title) return alert('Title is required');
        const finalStatus = targetStatus || status;

        setSaving(true);

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
            published_at: finalStatus === 'PUBLISHED' ? new Date().toISOString() : null,
            read_time: Math.ceil((content || '').split(' ').length / 200) || 1,
            language: articleLanguage,
            translation_group_id: translationGroupId || null,
            colocar_hero: colocarHero,
            disable_view_simulation: disableViewSimulation,
            author_id: authorId || null,
            seo_applied: seoApplied,
            ai_context: seoKeywords.length > 0 ? { seoKeywords } : null
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
                        onClick={handleSendToTV}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white font-black transition-all text-sm"
                    >
                        <MonitorPlay className="w-4 h-4 text-blue-400" />
                        Enviar para TV
                    </button>
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
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                                Título do Artigo <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">Gerado por IA</span>
                            </label>
                            <button
                                onClick={handleGenerateTitle}
                                disabled={isGeneratingTitle}
                                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20 px-4 py-2 rounded-xl hover:bg-purple-500/20 transition-all disabled:opacity-50"
                            >
                                <Sparkles className="w-4 h-4" />
                                {isGeneratingTitle ? 'Criando Título...' : 'Criar Título do Artigo'}
                            </button>
                        </div>
                        <input
                            type="text"
                            placeholder="O título será gerado pela IA após você inserir o conteúdo e as palavras-chave..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-900/50 text-3xl md:text-5xl font-black tracking-tight placeholder:text-slate-700/50 focus:outline-none border border-white/5 rounded-2xl p-6 text-white focus:border-purple-500/30 transition-colors"
                        />
                    </div>

                    <EditorRichText
                        content={content}
                        initialSocialSummary={socialSummary}
                        initialInstagramUrl={instagramUrl}
                        onChange={(html, summary, url, firstImageUrl) => {
                            setContent(html);
                            setSocialSummary(summary);
                            setInstagramUrl(url);
                            // Auto-fill featured image if empty and we found one in content
                            if (!featuredImageUrl && firstImageUrl) {
                                setFeaturedImageUrl(firstImageUrl);
                            }
                        }}
                    />
                </div>

                <div className="space-y-6">
                    {/* SEO Strategy Card */}
                    <div className="bg-slate-900 border border-purple-500/20 rounded-2xl p-6 space-y-6 shadow-[0_0_30px_-10px_rgba(168,85,247,0.1)]">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-purple-400">Estratégia SEO</h3>
                            <div className="p-1.5 bg-purple-500/10 rounded-lg">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleAggregateSEO}
                                disabled={isGeneratingSEO}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 font-black transition-all text-sm disabled:opacity-50"
                            >
                                {isGeneratingSEO ? 'Buscando Termos...' : 'Buscar Termos Chave'}
                            </button>

                            {seoKeywords.length > 0 ? (
                                <div className="space-y-3 pt-4 border-t border-white/5">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Palavras-chave Foco:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {seoKeywords.map((keyword, idx) => (
                                            <span key={idx} className="text-xs bg-slate-950 border border-white/10 text-slate-300 px-3 py-1.5 rounded-lg font-medium">
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-relaxed mt-2 italic">
                                        Use o botão &quot;Criar Título do Artigo&quot; para gerar um título otimizado usando estas palavras-chave.
                                    </p>
                                    <button
                                        onClick={handleApplySEO}
                                        disabled={isApplyingSEO || seoApplied}
                                        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border font-black transition-all text-sm mt-4
                                            ${seoApplied 
                                                ? 'bg-slate-800 border-white/5 text-slate-500 cursor-not-allowed' 
                                                : 'bg-green-500/10 hover:bg-green-500/20 border-green-500/20 text-green-400'
                                            }`}
                                    >
                                        {seoApplied 
                                            ? 'SEO Aplicado ao Texto'
                                            : isApplyingSEO ? 'Gerando Novo Texto...' : 'Utilizar Estratégia de SEO'
                                        }
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center pt-4 border-t border-white/5">
                                    <p className="text-xs text-slate-500">Crie ou gere o &quot;Resumo para Social&quot; no final da página antes de buscar termos chave.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Publication Settings */}
                    <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Meta & Settings</h3>

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

                            <div className="space-y-1 pt-3">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={disableViewSimulation}
                                            onChange={(e) => setDisableViewSimulation(e.target.checked)}
                                        />
                                        <div className={`w-10 h-5 rounded-full transition-colors ${disableViewSimulation ? 'bg-amber-500' : 'bg-slate-800'}`}></div>
                                        <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${disableViewSimulation ? 'translate-x-5' : ''}`}></div>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Desativar simulação de views</span>
                                        <p className="text-[10px] text-slate-600 mt-0.5">Impede o script automático de incrementar as views deste artigo.</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Card */}
                    <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Content Details</h3>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center justify-between">
                                    Slug (URL)
                                    <button
                                        onClick={handleGenerateSlug}
                                        disabled={generatingSlug}
                                        className="text-[10px] text-purple-400 font-black uppercase tracking-widest flex items-center gap-1 hover:text-purple-300 transition-colors disabled:opacity-50"
                                    >
                                        <Sparkles className="w-2.5 h-2.5" />
                                        {generatingSlug ? 'Gerando...' : 'IA'}
                                    </button>
                                </label>
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
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none font-bold appearance-none cursor-pointer"
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((c: any) => (
                                        <option key={c.id} value={c.id}>
                                            {'\u00A0'.repeat(c.depth * 4)} {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                                    <User className="w-3 h-3 text-primary" /> Author
                                </label>
                                <select
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none font-bold appearance-none cursor-pointer"
                                    value={authorId}
                                    onChange={(e) => setAuthorId(e.target.value)}
                                >
                                    <option value="">Default (Current User)</option>
                                    {authors.map((a: any) => (
                                        <option key={a.id} value={a.id}>
                                            {a.name || 'Anonymous'}
                                        </option>
                                    ))}
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
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center justify-between">
                                    Excerpt / Summary
                                    <button
                                        onClick={handleGenerateExcerpt}
                                        disabled={generatingExcerpt}
                                        className="text-[10px] text-purple-400 font-black uppercase tracking-widest flex items-center gap-1 hover:text-purple-300 transition-colors disabled:opacity-50"
                                    >
                                        <Sparkles className="w-2.5 h-2.5" />
                                        {generatingExcerpt ? 'Gerando...' : 'IA'}
                                    </button>
                                </label>
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

            {/* SEO Strategy Review Modal */}
            {seoReviewContent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-green-500/30 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
                            <div>
                                <h2 className="text-xl font-black text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-green-400" />
                                    Revisão de Estratégia SEO
                                </h2>
                                <p className="text-sm text-slate-400 mt-1">A IA reescreveu trechos do texto inserindo as palavras-chave foco em <strong>negrito</strong> para melhorar a indexabilidade.</p>
                            </div>
                        </div>
                        <div className="p-8 overflow-y-auto flex-1 prose prose-invert prose-green max-w-none text-slate-300 bg-slate-950/50">
                            <div dangerouslySetInnerHTML={{ __html: seoReviewContent }} />
                        </div>
                        <div className="p-6 border-t border-white/5 flex items-center gap-3 justify-end bg-slate-900/50">
                            <button
                                onClick={() => setSeoReviewContent(null)}
                                className="px-6 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                            >
                                Descartar Alterações
                            </button>
                            <button
                                onClick={() => {
                                    setContent(seoReviewContent);
                                    setSeoApplied(true);
                                    setSeoReviewContent(null);
                                }}
                                className="px-8 py-3 rounded-xl text-sm font-black bg-green-500 hover:bg-green-400 text-slate-950 transition-all shadow-lg shadow-green-500/20"
                            >
                                Aceitar Texto Otimizado
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
