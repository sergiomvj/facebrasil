import React from 'react';
import StaticPageLayout from '@/components/StaticPageLayout';
import { fetchStaticPageBySlug } from '@/lib/static-pages-service';
import { notFound } from 'next/navigation';

export default async function GenericStaticPage({
    slug,
    locale,
    children
}: {
    slug: string,
    locale?: string,
    children?: React.ReactNode
}) {
    let page = null;
    try {
        page = await fetchStaticPageBySlug(slug, locale);
    } catch (error) {
        console.error(`Error loading static page ${slug}:`, error);
        return null;
    }

    if (!page) {
        return <>{children}</>;
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
