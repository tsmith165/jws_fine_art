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
      url: 'https://www.jwsfineart.com/details/1',
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
    {
      url: 'https://www.jwsfineart.com/checkout/1',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: 'https://www.jwsfineart.com/checkout/cancel/1',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: 'https://www.jwsfineart.com/checkout/success/1',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];
}