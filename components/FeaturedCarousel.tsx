'use client';

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { BlogPost } from '@/lib/fbr-types';
import Link from 'next/link';
import { Clock, TrendingUp } from 'lucide-react';

interface FeaturedCarouselProps {
    posts: BlogPost[];
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ posts }) => {
    const [emblaRef] = useEmblaCarousel({
        align: 'start',
        loop: true,
        dragFree: true
    });

    if (!posts || posts.length === 0) return null;

    return (
        <section className="w-full max-w-[1280px] mx-auto px-6 mb-16 relative z-10 -mt-10 md:-mt-10">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-accent-yellow w-5 h-5" />
                <h3 className="text-white font-bold text-lg">Trending Now</h3>
            </div>

            {/* Desktop: Carousel (Visible md+) */}
            <div className="hidden md:block overflow-hidden" ref={emblaRef}>
                <div className="flex -ml-4">
                    {posts.map((post) => (
                        <div className="flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_19%] pl-4 min-w-0" key={post.id}>
                            <Link href={`/article/${post.slug}`} className="block group">
                                <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-xl p-4 h-full hover:bg-slate-800 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0 bg-slate-700"
                                            style={{ backgroundImage: `url('${post.featuredImage.url}')` }}
                                        ></div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[10px] uppercase font-bold text-blue-400 mb-1 block truncate">
                                                {post.categories[0]}
                                            </span>
                                            <h4 className="text-sm font-bold text-white leading-tight mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                                                {post.title}
                                            </h4>
                                            <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                                <Clock className="w-3 h-3" />
                                                <span>{post.readTime} min</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile: Vertical Grid (Visible < md) */}
            <div className="md:hidden grid grid-cols-1 gap-3">
                {posts.map((post) => (
                    <Link href={`/article/${post.slug}`} className="block group" key={post.id}>
                        <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-xl p-3 flex items-center gap-4 hover:bg-slate-800 transition-colors">
                            <div
                                className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0 bg-slate-700"
                                style={{ backgroundImage: `url('${post.featuredImage.url}')` }}
                            ></div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-white leading-tight mb-1 line-clamp-2">
                                    {post.title}
                                </h4>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                    <span className="text-blue-400 font-bold uppercase">{post.categories[0]}</span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{post.readTime} min</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default FeaturedCarousel;
