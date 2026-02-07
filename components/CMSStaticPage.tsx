import React from 'react';
import StaticPageLayout from '@/components/StaticPageLayout';
import { fetchStaticPageBySlug } from '@/lib/static-pages-service';
import { notFound } from 'next/navigation';

export default async function GenericStaticPage({ slug }: { slug: string }) {
    try {
        const page = await fetchStaticPageBySlug(slug);

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
    } catch (error) {
        console.error(`Error loading static page ${slug}:`, error);
        return null;
    }
}
