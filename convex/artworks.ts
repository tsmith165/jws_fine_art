import { v } from 'convex/values';
import type { Doc } from './_generated/dataModel';
import { query, type QueryCtx } from './_generated/server';

function publicArtwork(artwork: Doc<'artworks'>, media: Doc<'artworkMedia'>[]) {
    return {
        legacyId: artwork.legacyId,
        slug: artwork.slug,
        title: artwork.title,
        description: artwork.description,
        medium: artwork.medium,
        theme: artwork.theme,
        instagramUrl: artwork.instagramUrl,
        className: artwork.className,
        legacyGalleryOrder: artwork.legacyGalleryOrder ?? -artwork.galleryOrder,
        legacyHomepagePriority: artwork.legacyHomepagePriority ?? -artwork.homepageOrder,
        priceCents: artwork.priceCents,
        sold: artwork.sold,
        available: artwork.available,
        active: artwork.active,
        framed: artwork.framed,
        widthInches: artwork.widthInches,
        heightInches: artwork.heightInches,
        galleryOrder: artwork.galleryOrder,
        homepageOrder: artwork.homepageOrder,
        media: media.map((item) => ({
            legacyTable: item.legacyTable,
            legacyId: item.legacyId,
            role: item.role,
            title: item.title,
            sourceUrl: item.sourceUrl,
            sourceWidth: item.sourceWidth,
            sourceHeight: item.sourceHeight,
            smallUrl: item.smallUrl,
            smallWidth: item.smallWidth,
            smallHeight: item.smallHeight,
            displayOrder: item.displayOrder,
        })),
    };
}

async function activeArtworks(ctx: QueryCtx) {
    const [artworks, media] = await Promise.all([
        ctx.db
            .query('artworks')
            .withIndex('by_active_gallery_order', (q) => q.eq('active', true))
            .collect(),
        ctx.db.query('artworkMedia').collect(),
    ]);
    const mediaByArtwork = new Map<number, Doc<'artworkMedia'>[]>();
    for (const item of media) {
        if (item.absentFromSource) continue;
        const items = mediaByArtwork.get(item.artworkLegacyId) ?? [];
        items.push(item);
        mediaByArtwork.set(item.artworkLegacyId, items);
    }

    return artworks
        .filter((artwork) => !artwork.absentFromSource)
        .map((artwork) =>
            publicArtwork(
                artwork,
                (mediaByArtwork.get(artwork.legacyId) ?? []).sort((a, b) => a.displayOrder - b.displayOrder),
            ),
        );
}

export const listPublic = query({
    args: {},
    handler: async (ctx) => activeArtworks(ctx),
});

export const listHomepage = query({
    args: { limit: v.number() },
    handler: async (ctx, args) => {
        const artworks = await activeArtworks(ctx);
        return artworks
            .sort((a, b) => b.legacyHomepagePriority - a.legacyHomepagePriority || b.legacyId - a.legacyId)
            .slice(0, Math.max(0, args.limit));
    },
});

export const getPublicByLegacyId = query({
    args: { legacyId: v.number() },
    handler: async (ctx, args) => {
        const artwork = await ctx.db
            .query('artworks')
            .withIndex('by_legacy_id', (q) => q.eq('legacyId', args.legacyId))
            .unique();
        if (!artwork || !artwork.active || artwork.absentFromSource) return null;
        const media = await ctx.db
            .query('artworkMedia')
            .withIndex('by_artwork_and_order', (q) => q.eq('artworkLegacyId', args.legacyId))
            .collect();
        return publicArtwork(
            artwork,
            media.filter((item) => !item.absentFromSource).sort((a, b) => a.displayOrder - b.displayOrder),
        );
    },
});
