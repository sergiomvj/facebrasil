import { MetadataRoute } from 'next';
import { fetchPosts } from '@/lib/blog-service';

const BASE_URL = 'https://facebrasil.com'; // Adjust domain as needed

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const { data: posts } = await fetchPosts({ limit: 100 });

    const articleEntries: MetadataRoute.Sitemap = posts.map((post) => ({
        url: `${BASE_URL}/article/${post.slug}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...articleEntries,
    ];
}
