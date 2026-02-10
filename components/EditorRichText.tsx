'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Undo, Redo, Quote, Heading1, Heading2, Sparkles, Share2 } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { generateMetadata } from '@/app/actions/ai-actions';

interface EditorRichTextProps {
    content?: string;
    onChange?: (html: string, socialSummary: string, instagramUrl: string) => void;
    initialSocialSummary?: string;
    initialInstagramUrl?: string;
}

const ToolbarButton = ({ onClick, isActive, icon: Icon, title, disabled }: {
    onClick: () => void;
    isActive: boolean;
    icon: React.ElementType;
    title: string;
    disabled?: boolean;
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
            "p-2 rounded hover:bg-white/10 transition-colors disabled:opacity-50",
            isActive ? "text-primary bg-white/5" : "text-slate-400"
        )}
        title={title}
        type="button"
    >
        <Icon className="w-4 h-4" />
    </button>
);

const EditorRichText: React.FC<EditorRichTextProps> = ({
    content = '',
    onChange,
    initialSocialSummary = '',
    initialInstagramUrl = ''
}) => {
    const [socialSummary, setSocialSummary] = useState(initialSocialSummary);
    const [instagramUrl, setInstagramUrl] = useState(initialInstagramUrl);
    const [uploading, setUploading] = useState(false);
    const [generatingSocial, setGeneratingSocial] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Placeholder.configure({
                placeholder: 'Write something amazing...',
            }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px]',
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange?.(html, socialSummary, instagramUrl);
        },
        immediatelyRender: false,
    });

    const handleSocialChange = (key: 'summary' | 'url', value: string) => {
        if (key === 'summary') {
            setSocialSummary(value);
            onChange?.(editor?.getHTML() || '', value, instagramUrl);
        } else {
            setInstagramUrl(value);
            onChange?.(editor?.getHTML() || '', socialSummary, value);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || `Erro no servidor (${res.status})`);
            }

            if (data.url) {
                editor?.chain().focus().setImage({ src: data.url }).run();
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            alert(`Erro no upload: ${error.message}`);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleGenerateSocialSummary = async () => {
        const htmlContent = editor?.getHTML() || '';
        if (!htmlContent || htmlContent === '<p></p>') return alert('Escreva o conteúdo primeiro.');

        setGeneratingSocial(true);
        try {
            const textContent = htmlContent.replace(/<[^>]*>/g, '');
            const result = await generateMetadata(textContent, 'social_summary');
            if (result.success && result.content) {
                setSocialSummary(result.content);
                onChange?.(htmlContent, result.content, instagramUrl);
            }
        } finally {
            setGeneratingSocial(false);
        }
    };

    // Sync from props when data is loaded
    React.useEffect(() => {
        if (initialSocialSummary) setSocialSummary(initialSocialSummary);
        if (initialInstagramUrl) setInstagramUrl(initialInstagramUrl);
        if (content && editor && !editor.getText()) {
            editor.commands.setContent(content);
        }
    }, [initialSocialSummary, initialInstagramUrl, content, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-col gap-8">
            {/* Main Editor */}
            <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-900/50 backdrop-blur-sm">
                <div className="border-b border-white/10 p-2 flex flex-wrap gap-1 bg-slate-900/80">
                    <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} title="Bold" />
                    <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} title="Italic" />
                    <div className="w-px h-6 bg-white/10 mx-1 self-center" />
                    <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} icon={Heading1} title="H1" />
                    <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={Heading2} title="H2" />
                    <div className="w-px h-6 bg-white/10 mx-1 self-center" />
                    <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} title="Bullet List" />
                    <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} title="Ordered List" />
                    <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={Quote} title="Quote" />
                    <div className="w-px h-6 bg-white/10 mx-1 self-center" />

                    {/* Image Upload Button */}
                    <ToolbarButton
                        onClick={() => fileInputRef.current?.click()}
                        isActive={false}
                        icon={ImageIcon}
                        title="Upload Image"
                        disabled={uploading}
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                        accept="image/*"
                    />

                    <div className="w-px h-6 bg-white/10 mx-1 self-center" />
                    <ToolbarButton onClick={() => editor.chain().focus().undo().run()} isActive={false} icon={Undo} title="Undo" />
                    <ToolbarButton onClick={() => editor.chain().focus().redo().run()} isActive={false} icon={Redo} title="Redo" />
                </div>

                <div className="p-10 min-h-[500px]">
                    <EditorContent editor={editor} />
                </div>
            </div>

            {/* Social Media Integration Section - Moved to Bottom */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <Share2 className="w-6 h-6 text-blue-500" />
                        Redes Sociais
                        <span className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full font-black tracking-widest uppercase">Obrigatório</span>
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs text-slate-400 font-black uppercase tracking-widest">Resumo para Social (Max 150 palavras)</label>
                            <button
                                onClick={handleGenerateSocialSummary}
                                disabled={generatingSocial}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                {generatingSocial ? 'Gerando...' : 'Gerar com IA'}
                            </button>
                        </div>
                        <textarea
                            value={socialSummary}
                            onChange={(e) => handleSocialChange('summary', e.target.value)}
                            className="w-full bg-slate-950 border border-white/5 rounded-xl p-5 text-sm text-white focus:ring-1 focus:ring-blue-500/50 focus:outline-none h-32 resize-none transition-all"
                            placeholder="Um resumo matador para Instagram ou Meta description..."
                        />
                        <div className="text-right text-[10px] font-bold text-slate-600 tracking-widest">
                            {socialSummary.length} caracteres / ~150 palavras
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs text-slate-400 font-black uppercase tracking-widest">Post do Instagram (Link)</label>
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={instagramUrl}
                                onChange={(e) => handleSocialChange('url', e.target.value)}
                                placeholder="https://instagram.com/p/..."
                                className="w-full bg-slate-950 border border-white/5 rounded-xl p-5 text-sm text-white focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-all"
                            />
                            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                                Cole o link direto do post do Instagram relacionado. Isso ativará o botão &quot;Ver no Instagram&quot; na matéria.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditorRichText;
