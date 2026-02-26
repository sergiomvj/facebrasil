"use client";

import React, { useState } from 'react';

import { Instagram, Copy, Share2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useXP } from '@/hooks/useXP';


interface SocialShareBarProps {
    articleId?: string;
    instagramUrl?: string;
    socialSummary?: string;
    title: string;
}

const SocialShareBar: React.FC<SocialShareBarProps> = ({
    articleId,
    instagramUrl,
    socialSummary,
    title
}) => {
    const [copied, setCopied] = useState(false);
    const { gainXP } = useXP();

    const handleCopyCaption = async () => {
        if (!socialSummary) return;
        try {
            await navigator.clipboard.writeText(socialSummary);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);

            // Ganhar XP ao copiar legenda (conta como intenção de compartilhar)
            if (articleId) {
                gainXP('SHARE', articleId);
            }
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: socialSummary,
                    url: window.location.href,
                });

                // Ganhar XP ao compartilhar
                if (articleId) {
                    gainXP('SHARE', articleId);
                }
            } catch (err) {
                console.log('Error sharing', err);
            }
        } else {
            // Fallback or toast
            handleCopyCaption();
        }
    };


    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 lg:flex-col lg:left-8 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0">

            {/* Container */}
            <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-full p-2 flex lg:flex-col items-center gap-2 shadow-2xl">

                {/* Instagram Link */}
                {instagramUrl && (
                    <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-full hover:bg-white/10 text-pink-500 transition-colors group relative"
                        title="View on Instagram"
                    >
                        <Instagram className="w-5 h-5" />
                        <span className="sr-only">View on Instagram</span>
                    </a>
                )}

                {/* Copy Caption */}
                {socialSummary && (
                    <button
                        onClick={handleCopyCaption}
                        className={cn(
                            "p-3 rounded-full hover:bg-white/10 transition-colors relative group",
                            copied ? "text-green-400" : "text-slate-300"
                        )}
                        title="Copy Caption for Repost"
                    >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                )}

                <div className="w-px h-6 bg-white/10 lg:w-6 lg:h-px" />

                {/* Native Share */}
                <button
                    onClick={handleShare}
                    className="p-3 rounded-full bg-primary hover:bg-primary/90 text-slate-900 transition-colors shadow-lg shadow-primary/20"
                    title="Share Article"
                >
                    <Share2 className="w-5 h-5" />
                </button>

            </div>
        </div>
    );
};

export default SocialShareBar;
