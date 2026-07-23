import type { Doc } from './_generated/dataModel';
import { internalQuery, query, type QueryCtx } from './_generated/server';
import { requireOwnerIdentity } from './lib/ownerAuth';
import { deriveArtworkCategories } from '../shared/artworkCategories';

async function latestVerifiedSnapshotId(ctx: QueryCtx): Promise<string | null> {
    const runs = await ctx.db.query('migrationRuns').collect();
    return runs.filter((run) => run.status === 'verified').sort((a, b) => b.startedAt - a.startedAt)[0]?.snapshotId ?? null;
}

async function ownerArtworks(ctx: QueryCtx) {
    const [artworks, media] = await Promise.all([ctx.db.query('artworks').collect(), ctx.db.query('artworkMedia').collect()]);
    const mediaByArtwork = new Map<number, Doc<'artworkMedia'>[]>();
    for (const item of media) {
        if (item.absentFromSource) continue;
        const items = mediaByArtwork.get(item.artworkLegacyId) ?? [];
        items.push(item);
        mediaByArtwork.set(item.artworkLegacyId, items);
    }

    return artworks
        .filter((artwork) => !artwork.absentFromSource)
        .map((artwork) => ({
            legacyId: artwork.legacyId,
            slug: artwork.slug,
            title: artwork.title,
            description: artwork.description,
            medium: artwork.medium,
            theme: artwork.theme,
            categories: artwork.categories ?? deriveArtworkCategories({ theme: artwork.theme, medium: artwork.medium }),
            instagramUrl: artwork.instagramUrl,
            ownerNotes: artwork.ownerNotes,
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
            media: (mediaByArtwork.get(artwork.legacyId) ?? [])
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((item) => ({
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
        }));
}

async function legacyVerifiedTransactions(ctx: QueryCtx) {
    const snapshotId = await latestVerifiedSnapshotId(ctx);
    if (!snapshotId) return [];
    const transactions = await ctx.db
        .query('legacyVerifiedTransactions')
        .withIndex('by_snapshot_id', (q) => q.eq('snapshotId', snapshotId))
        .collect();
    return transactions
        .sort((a, b) => a.legacyId - b.legacyId)
        .map((transaction) => ({
            legacyId: transaction.legacyId,
            pieceLegacyId: transaction.pieceLegacyId,
            pieceTitle: transaction.pieceTitle,
            fullName: transaction.fullName,
            phone: transaction.phone,
            email: transaction.email,
            address: transaction.address,
            international: transaction.international,
            imagePath: transaction.imagePath,
            imageWidth: transaction.imageWidth,
            imageHeight: transaction.imageHeight,
            purchasedOn: transaction.purchasedOn,
            stripeId: transaction.stripeId,
            price: transaction.price,
        }));
}

export const listArtworks = query({
    args: {},
    handler: async (ctx) => {
        await requireOwnerIdentity(ctx);
        return ownerArtworks(ctx);
    },
});

export const getHomepageRotation = query({
    args: {},
    handler: async (ctx) => {
        await requireOwnerIdentity(ctx);
        const rotation = await ctx.db
            .query('homepageRotations')
            .withIndex('by_key', (q) => q.eq('key', 'primary'))
            .unique();
        if (rotation) return { configured: true, artworkLegacyIds: rotation.artworkLegacyIds };

        const artworks = await ownerArtworks(ctx);
        const artworkLegacyIds = artworks
            .filter((artwork) => artwork.active && artwork.media.some((item) => item.role === 'primary'))
            .sort((a, b) => b.legacyHomepagePriority - a.legacyHomepagePriority || b.legacyId - a.legacyId)
            .map((artwork) => artwork.legacyId);
        return { configured: false, artworkLegacyIds };
    },
});

export const listLegacyVerifiedTransactions = query({
    args: {},
    handler: async (ctx) => {
        await requireOwnerIdentity(ctx);
        return legacyVerifiedTransactions(ctx);
    },
});

// Internal parity reads exercise the same serialization without weakening the owner API.
export const auditReadContracts = internalQuery({
    args: {},
    handler: async (ctx) => ({
        artworks: await ownerArtworks(ctx),
        legacyVerifiedTransactions: await legacyVerifiedTransactions(ctx),
    }),
});
