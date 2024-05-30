// /app/sitemap.ts
interface SitemapEntry {
    url: string;
    lastModified: Date;
    changeFrequency: 'yearly' | 'weekly';
    priority: number;
}

export default function sitemap(): SitemapEntry[] {
    return [
        {
            url: 'https://www.jwsfineart.com',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1,
        },
        {
            url: 'https://www.jwsfineart.com/gallery',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: 'https://www.jwsfineart.com/details',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: 'https://www.jwsfineart.com/slideshow',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.5,
        },
    ];
}
