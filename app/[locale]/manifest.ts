import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Facebrasil Magazine',
        short_name: 'Facebrasil',
        description: 'A cultura brasileira em destaque na Flórida.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#f97316',
        icons: [
            {
                src: '/icon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
        ],
    };
}
