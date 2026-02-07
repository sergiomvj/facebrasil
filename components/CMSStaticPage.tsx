import React from 'react';
import StaticPageLayout from '@/components/StaticPageLayout';
import { fetchStaticPageBySlug } from '@/lib/static-pages-service';
import { notFound } from 'next/navigation';

export default async function GenericStaticPage({ slug, locale }: { slug: string, locale?: string }) {
    let page = null;
    try {
        page = await fetchStaticPageBySlug(slug, locale);
    } catch (error) {
        console.error(`Error loading static page ${slug}:`, error);
        return null;
    }

    if (!page) {
        return null; // Let the caller decide or return fallback
    }

    return (
        <StaticPageLayout
            title={page.title}
            category="Institucional"
            featuredImage={page.featured_image}
            updatedAt={page.updated_at ? new Date(page.updated_at).toLocaleDateString() : undefined}
            content={
                <div dangerouslySetInnerHTML={{ __html: page.content }} />
            }
        />
    );
}
