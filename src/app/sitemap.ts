import type { MetadataRoute } from 'next';
import { readPublicArtworks } from '@/data/artworkReads';
import { artworkHref } from '@/lib/artwork';

const origin = 'https://www.jwsfineart.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const artwork = await readPublicArtworks();
    return [
        { url: origin, changeFrequency: 'weekly', priority: 1 },
        { url: `${origin}/work`, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${origin}/studio`, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${origin}/commissions`, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${origin}/contact`, changeFrequency: 'yearly', priority: 0.6 },
        { url: `${origin}/shipping`, changeFrequency: 'yearly', priority: 0.6 },
        ...artwork.map((piece) => ({
            url: `${origin}${artworkHref(piece)}`,
            changeFrequency: 'monthly' as const,
            priority: piece.available && !piece.sold ? 0.8 : 0.55,
            images: [piece.image_path],
        })),
    ];
}
