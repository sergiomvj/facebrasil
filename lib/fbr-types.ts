// lib/fbr-types.ts

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string; // HTML sanitizado
    author: {
        name: string;
        avatar?: string;
        bio?: string;
    };
    categories: string[];
    tags: string[];
    featuredImage: {
        url: string;
        alt: string;
        width: number;
        height: number;
    };
    images: Array<{
        url: string;
        alt: string;
        caption?: string;
    }>;
    seo: {
        metaTitle: string;
        metaDescription: string;
        keywords: string[];
        ogImage?: string;
        canonicalUrl?: string;
    };
    publishedAt: string;
    updatedAt: string;
    status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' | 'published' | 'draft' | 'scheduled';
    readTime: number; // minutos
    socialSummary?: string; // 150 words summary for social sharing
    instagramPostUrl?: string; // Direct link to Instagram post
    destaqueHero?: boolean;
    source_type?: 'manual' | 'automated';
    ai_context?: {
        historical?: string;
        statistical?: string;
        geopolitical?: string;
        practical?: string;
    };
}

export interface VideoReport {
    id: string;
    title: string;
    description?: string;
    video_url: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    created_at: string;
}

export interface BlogConfig {
    blogId: string;
    name: string;
    description: string;
    logo: string;
    // ... outros campos de config podem ser adicionados conforme necessidade
}

export interface FetchPostsParams {
    page?: number;
    limit?: number;
    category?: string | string[];
    excludeCategory?: string;
    tag?: string;
    search?: string;
    sort?: 'latest' | 'popular';
    language?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}
