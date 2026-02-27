"use client";

import React, { useEffect, useState } from 'react';
import { useXP } from '@/hooks/useXP';
import { adService, Ad } from '@/lib/ad-service';
import { detectLocation } from '@/lib/geo-utils';

interface AdSpaceProps {
    position: 'banner_top' | 'sidebar' | 'inline' | 'sticky_footer' | 'home_hero' | 'article_sidebar' | 'feed_interstitial' | 'column_middle' | 'super_footer';
    className?: string;
    categoryId?: string;
}

const AdSpace: React.FC<AdSpaceProps> = ({ position, className = '', categoryId }) => {
    const { grantXP } = useXP();
    const [ad, setAd] = useState<Ad | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewRecorded, setViewRecorded] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const fetchAd = async () => {
            try {
                // Detect user location
                const location = await detectLocation();

                // Fetch a real ad from the database with location filtering
                const fetchedAd = await adService.getAdByPosition(position, categoryId, location || undefined);

                if (fetchedAd) {
                    setAd(fetchedAd);
                } else {
                    // No active ad for this position
                    setIsVisible(false);
                }
            } catch (error) {
                console.error("Failed to fetch ad", error);
                setIsVisible(false);
            } finally {
                setLoading(false);
            }
        };

        fetchAd();
    }, [position, categoryId]);

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsVisible(false);
    };

    useEffect(() => {
        if (ad && isVisible && !viewRecorded && !loading) {
            const timer = setTimeout(() => {
                grantXP('VIEW_AD', ad.id);
                adService.trackView(ad.id);
                setViewRecorded(true);
            }, 3000); // 3 seconds view time to count
            return () => clearTimeout(timer);
        }
    }, [viewRecorded, ad, isVisible, loading, position, grantXP]);

    const handleClick = () => {
        if (!ad) return;
        grantXP('CLICK_AD', ad.id + '_click_' + new Date().toISOString().split('T')[0]); // Unique per day
        adService.trackClick(ad.id);

        // Open link if available
        if (ad.link_url) {
            window.open(ad.link_url, '_blank');
        }
    };

    // If hidden or loading, we might want to return nothing or a placeholder.
    if (!isVisible) return null;

    if (loading) {
        return <div className={`w-full h-24 bg-slate-900/10 animate-pulse rounded-lg ${className}`} />;
    }

    if (!ad) return null;

    // Base classes based on Position (Desktop Sizes)
    let sizeClasses = '';
    switch (position) {
        case 'banner_top':
            sizeClasses = 'max-w-[1024px] h-[150px]';
            break;
        case 'sidebar':
        case 'article_sidebar':
            sizeClasses = 'w-[350px] h-[350px]';
            break;
        case 'column_middle':
            sizeClasses = 'w-[300px] h-[300px]';
            break;
        case 'super_footer':
            sizeClasses = 'max-w-[1240px] h-[200px]';
            break;
        default:
            sizeClasses = 'w-full'; // Default fallback
    }

    return (
        <div
            onClick={handleClick}
            className={`relative flex flex-col items-center justify-center p-4 rounded-lg overflow-hidden group cursor-pointer transition-all hover:opacity-95 shadow-md mx-auto ${sizeClasses} ${className}`}
        >
            {/* Background Image or Fallback Color */}
            {
                ad.image_url ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url(${ad.image_url})` }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 z-0" />
                )
            }

            {/* Overlay for text readability if image exists */}
            {ad.image_url && <div className="absolute inset-0 bg-black/40 z-0 transition-opacity group-hover:bg-black/30" />}

            {/* Content */}
            <div className="relative z-10 text-center w-full">
                <span className="absolute top-0 right-0 py-0.5 px-2 bg-black/50 text-[9px] uppercase tracking-widest text-white/70 rounded-bl-lg font-black tracking-tighter italic">
                    Patrocinado
                </span>

                {position === 'sticky_footer' && (
                    <button
                        onClick={handleClose}
                        className="absolute -top-3 -left-3 p-1 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {!ad.image_url && (
                    <div className="py-2">
                        <h3 className="text-lg font-bold text-white mb-1 uppercase italic tracking-tighter">{ad.title}</h3>
                        <p className="text-[10px] text-white/70 font-mono break-all">{ad.link_url}</p>
                    </div>
                )}
            </div>

            {/* Click Indicator */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <span className="text-[10px] font-black uppercase text-slate-900 bg-primary px-3 py-1 rounded-full shadow-lg">
                    Ver Mais &rarr;
                </span>
            </div>
        </div >
    );
};

export default AdSpace;
