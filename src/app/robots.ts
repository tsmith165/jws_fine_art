import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/checkout/', '/signin/', '/signup/'],
        },
        sitemap: 'https://www.jwsfineart.com/sitemap.xml',
        host: 'https://www.jwsfineart.com',
    };
}
