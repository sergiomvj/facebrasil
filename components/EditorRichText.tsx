'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Undo, Redo, Quote, Heading1, Heading2 } from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '@/lib/utils'; // Assuming you have a utils file, if not I'll create one or use clsx directly

interface EditorRichTextProps {
    content?: string;
    onChange?: (html: string, socialSummary: string, instagramUrl: string) => void;
    initialSocialSummary?: string;
    initialInstagramUrl?: string;
}

const EditorRichText: React.FC<EditorRichTextProps> = ({
    content = '',
    onChange,
    initialSocialSummary = '',
    initialInstagramUrl = ''
}) => {
    const [socialSummary, setSocialSummary] = useState(initialSocialSummary);
    const [instagramUrl, setInstagramUrl] = useState(initialInstagramUrl);



    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Link.configure({
                openOnClick: false,
            }),
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
        immediatelyRender: false, // Fix SSR hydration mismatch
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

    const ToolbarButton = ({ onClick, isActive, icon: Icon, title }: any) => (
        <button
            onClick={onClick}
            className={cn(
                "p-2 rounded hover:bg-white/10 transition-colors",
                isActive ? "text-primary bg-white/5" : "text-slate-400"
            )}
            title={title}
            type="button"
        >
            <Icon className="w-4 h-4" />
        </button>
    );

    return (
        <div className="flex flex-col gap-6">

            {/* Social Media Integration Section - Top Priority */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    Social Media Integration
                    <span className="text-[10px] bg-accent-yellow text-slate-900 px-2 py-0.5 rounded-full font-bold">REQUIRED</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-medium">Social Summary (Max 150 words)</label>
                        <textarea
                            value={socialSummary}
                            onChange={(e) => handleSocialChange('summary', e.target.value)}
                            className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-secondary focus:outline-none h-24 resize-none"
                            placeholder="Short, punchy summary for Instagram caption, Twitter, or Meta description..."
                        />
                        <div className="text-right text-[10px] text-slate-500">
                            {socialSummary.split(/\s+/).filter(w => w.length > 0).length} / 150 words
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-medium">Instagram Implementation</label>
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={instagramUrl}
                                onChange={(e) => handleSocialChange('url', e.target.value)}
                                placeholder="https://instagram.com/p/..."
                                className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-secondary focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-500">
                                Paste the direct link to the Instagram post related to this article. This will generate the &quot;View on Instagram&quot; button.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

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
                    <ToolbarButton onClick={() => editor.chain().focus().undo().run()} isActive={false} icon={Undo} title="Undo" />
                    <ToolbarButton onClick={() => editor.chain().focus().redo().run()} isActive={false} icon={Redo} title="Redo" />
                </div>

                <div className="p-6 min-h-[400px]">
                    <EditorContent editor={editor} />
                </div>
            </div>
        </div>
    );
};

export default EditorRichText;
