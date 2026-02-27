"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useXP } from '@/hooks/useXP';
import { adService, Ad } from '@/lib/ad-service';
import { detectLocation } from '@/lib/geo-utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdSpaceProps {
    position: 'super_hero' | 'sidebar' | 'column' | 'super_footer';
    className?: string;
    categoryId?: string;
    publicationName?: 'Facebrasil' | 'TVFacebrasil';
}

const AdSpace: React.FC<AdSpaceProps> = ({
    position,
    className = '',
    categoryId,
    publicationName = 'Facebrasil'
}) => {
    const { grantXP } = useXP();
    const [adsPool, setAdsPool] = useState<Ad[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(true);

    // Tracking states for current ad
    const [statsLogged, setStatsLogged] = useState({
        view: false,
        curiosity: false
    });
    const [isHovering, setIsHovering] = useState(false);

    const viewTimerRef = useRef<NodeJS.Timeout | null>(null);
    const curiosityTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const location = await detectLocation();
                const pool = await adService.getAdsByPosition(position, publicationName, categoryId, location || undefined);

                if (pool && pool.length > 0) {
                    setAdsPool(pool);
                } else {
                    setIsVisible(false);
                }
            } catch (error) {
                console.error("Failed to fetch ads", error);
                setIsVisible(false);
            } finally {
                setLoading(false);
            }
        };

        fetchAds();
    }, [position, categoryId, publicationName]);

    const activeAd = adsPool[currentIndex];
    const adImageUrl = isMobile && activeAd?.mobile_image_url ? activeAd.mobile_image_url : activeAd?.image_url;

    // Reset tracking when ad changes
    useEffect(() => {
        setStatsLogged({ view: false, curiosity: false });

        // Clear old timers
        if (viewTimerRef.current) clearTimeout(viewTimerRef.current);
        if (curiosityTimerRef.current) clearTimeout(curiosityTimerRef.current);

        if (activeAd && isVisible) {
            // 📊 1. Visualização (20s)
            viewTimerRef.current = setTimeout(() => {
                adService.trackView(activeAd.id);
                setStatsLogged(prev => ({ ...prev, view: true }));
            }, 20000);
        }

        return () => {
            if (viewTimerRef.current) clearTimeout(viewTimerRef.current);
            if (curiosityTimerRef.current) clearTimeout(curiosityTimerRef.current);
        };
    }, [activeAd, isVisible, currentIndex]);

    // 📊 2. Curiosidade (MouseOver + 10s)
    useEffect(() => {
        if (isHovering && !statsLogged.curiosity && activeAd) {
            curiosityTimerRef.current = setTimeout(() => {
                adService.trackCuriosity(activeAd.id);
                setStatsLogged(prev => ({ ...prev, curiosity: true }));
            }, 10000);
        } else {
            if (curiosityTimerRef.current) clearTimeout(curiosityTimerRef.current);
        }

        return () => {
            if (curiosityTimerRef.current) clearTimeout(curiosityTimerRef.current);
        };
    }, [isHovering, statsLogged.curiosity, activeAd]);

    // Carousel Rotation (Auto)
    useEffect(() => {
        if (adsPool.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex(prev => (prev + 1) % adsPool.length);
            }, 15000); // Rotate every 15s
            return () => clearInterval(interval);
        }
    }, [adsPool.length]);

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex(prev => (prev + 1) % adsPool.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex(prev => (prev - 1 + adsPool.length) % adsPool.length);
    };

    const handleClick = () => {
        if (!activeAd) return;
        adService.trackClick(activeAd.id);
        if (activeAd.link_url) {
            window.open(activeAd.link_url, '_blank');
        }
    };

    if (!isVisible || (loading && !activeAd)) return null;
    if (!activeAd) return null;

    // Size mappings from requirements
    let sizeClasses = '';
    switch (position) {
        case 'super_hero':
            sizeClasses = 'max-w-[1240px] w-full aspect-[300/50] md:aspect-[1240/150] h-auto';
            break;
        case 'sidebar':
            sizeClasses = 'w-[300px] h-[300px] md:w-[350px] md:h-[350px]';
            break;
        case 'column':
            sizeClasses = 'w-[300px] h-[300px]';
            break;
        case 'super_footer':
            sizeClasses = 'max-w-[1240px] w-full aspect-[300/150] md:aspect-[1240/250] h-auto';
            break;
    }

    return (
        <div
            className={`relative group bg-slate-950 overflow-hidden border border-white/5 shadow-2xl ${sizeClasses} ${className}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={handleClick}
        >
            {/* Ad Content */}
            <div className="absolute inset-0 cursor-pointer transition-transform duration-700 group-hover:scale-105">
                {adImageUrl ? (
                    <img
                        src={adImageUrl}
                        alt={activeAd.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-center">
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">{activeAd.title}</h3>
                        <p className="text-xs text-accent-yellow font-bold uppercase tracking-widest">Saiba Mais</p>
                    </div>
                )}
            </div>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* Labels */}
            <div className="absolute top-0 right-0 p-1 bg-black/80">
                <span className="text-[10px] font-black uppercase text-white/50 tracking-tighter italic px-2">Anúncio</span>
            </div>

            {/* Carousel Controls (if multiple) */}
            {adsPool.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-accent-yellow text-white hover:text-slate-950 rounded-full opacity-0 group-hover:opacity-100 transition-all z-20"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-accent-yellow text-white hover:text-slate-950 rounded-full opacity-0 group-hover:opacity-100 transition-all z-20"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    {/* Dots */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                        {adsPool.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-accent-yellow scale-125' : 'bg-white/30'}`}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Performance Indicators (Only for visual feedback in dev/testing if needed, but here it's production) */}
            <div className="absolute bottom-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-accent-yellow text-slate-950 font-black text-[10px] uppercase px-4 py-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    {activeAd.title} &rarr;
                </span>
            </div>
        </div>
    );
};

export default AdSpace;
