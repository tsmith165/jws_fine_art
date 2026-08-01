import type { MetadataRoute } from 'next';
import { readPublicArtworks } from '@/data/artworkReads';
import { artworkHref } from '@/lib/artwork';
import { readPublishedGalleryWalls } from '@/data/galleryWallReads';

const origin = 'https://www.jwsfineart.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [artwork, viewingRoomWalls] = await Promise.all([readPublicArtworks(), readPublishedGalleryWalls()]);
    return [
        { url: origin, changeFrequency: 'weekly', priority: 1 },
        { url: `${origin}/work`, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${origin}/studio`, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${origin}/commissions`, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${origin}/contact`, changeFrequency: 'yearly', priority: 0.6 },
        { url: `${origin}/shipping`, changeFrequency: 'yearly', priority: 0.6 },
        ...(viewingRoomWalls.length
            ? [
                  { url: `${origin}/viewing-room`, changeFrequency: 'weekly' as const, priority: 0.8 },
                  ...viewingRoomWalls.map((wall) => ({
                      url: `${origin}/viewing-room/${wall.slug}`,
                      lastModified: new Date(wall.publishedAt),
                      changeFrequency: 'weekly' as const,
                      priority: 0.75,
                      images: wall.placements.map((placement) => placement.artwork.imageUrl),
                  })),
              ]
            : []),
        ...artwork.map((piece) => ({
            url: `${origin}${artworkHref(piece)}`,
            changeFrequency: 'monthly' as const,
            priority: piece.available && !piece.sold ? 0.8 : 0.55,
            images: [piece.image_path],
        })),
    ];
}
