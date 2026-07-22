import { v } from 'convex/values';
import { mutation, type MutationCtx } from './_generated/server';
import { legacyArtworkSlug } from './lib/legacy';
import { requireOwnerIdentity } from './lib/ownerAuth';
import { deriveArtworkCategories, normalizeArtworkCategories } from '../shared/artworkCategories';
import { normalizeArtworkAvailability } from '../shared/artworkListingState';

const nullableString = v.union(v.string(), v.null());
const nullableNumber = v.union(v.number(), v.null());
const artworkCategory = v.union(v.literal('coastal'), v.literal('mountain'), v.literal('urban'), v.literal('intaglio-lino-cut'));

async function audit(
    ctx: MutationCtx,
    actorId: string,
    action: string,
    entityType: string,
    entityId: string,
    details: Record<string, unknown> = {},
) {
    await ctx.db.insert('ownerAuditEvents', {
        actorId,
        action,
        entityType,
        entityId,
        detailsJson: JSON.stringify(details),
        createdAt: Date.now(),
    });
}

async function owner(ctx: MutationCtx) {
    const identity = await requireOwnerIdentity(ctx);
    return String(identity.subject);
}

async function artworkByLegacyId(ctx: MutationCtx, legacyId: number) {
    const artwork = await ctx.db
        .query('artworks')
        .withIndex('by_legacy_id', (q) => q.eq('legacyId', legacyId))
        .unique();
    if (!artwork || artwork.absentFromSource) throw new Error('Artwork not found.');
    return artwork;
}

function classNameFor(title: string) {
    return title
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
}

const artworkFields = {
    title: v.string(),
    description: nullableString,
    medium: nullableString,
    theme: nullableString,
    categories: v.optional(v.array(artworkCategory)),
    instagramUrl: nullableString,
    ownerNotes: nullableString,
    priceCents: v.number(),
    sold: v.boolean(),
    available: v.boolean(),
    active: v.boolean(),
    framed: v.boolean(),
    widthInches: nullableNumber,
    heightInches: nullableNumber,
};

export const updateArtwork = mutation({
    args: { legacyId: v.number(), ...artworkFields },
    handler: async (ctx, args) => {
        const actorId = await owner(ctx);
        const artwork = await artworkByLegacyId(ctx, args.legacyId);
        const { legacyId: _legacyId, categories, sold, available, ...remainingFields } = args;
        const fields = {
            ...remainingFields,
            ...normalizeArtworkAvailability({ sold, available }),
            ...(categories ? { categories } : {}),
        };
        const changed = Object.entries(fields)
            .filter(([field, value]) => !Object.is(artwork[field as keyof typeof artwork], value))
            .map(([field]) => field);
        if (changed.length === 0) return { changed: false };
        const ownerMutatedFields = [...new Set([...artwork.ownerMutatedFields, ...changed, 'className'])];
        await ctx.db.patch(artwork._id, {
            ...fields,
            className: classNameFor(fields.title),
            ownerMutatedFields,
            ownerRevision: artwork.ownerRevision + 1,
            updatedAt: Date.now(),
        });
        await audit(ctx, actorId, 'artwork.updated', 'artwork', String(artwork._id), { fields: changed });
        return { changed: true };
    },
});

export const setArtworkCategories = mutation({
    args: {
        legacyId: v.number(),
        categories: v.array(artworkCategory),
    },
    handler: async (ctx, args) => {
        const actorId = await owner(ctx);
        const artwork = await artworkByLegacyId(ctx, args.legacyId);
        const categories = normalizeArtworkCategories(args.categories);
        const currentCategories = normalizeArtworkCategories(artwork.categories ?? []);
        if (categories.join('|') === currentCategories.join('|')) return { changed: false, categories };

        await ctx.db.patch(artwork._id, {
            categories,
            ownerMutatedFields: [...new Set([...artwork.ownerMutatedFields, 'categories'])],
            ownerRevision: artwork.ownerRevision + 1,
            updatedAt: Date.now(),
        });
        await audit(ctx, actorId, 'artwork.categories_updated', 'artwork', String(artwork._id), {
            legacyId: args.legacyId,
            categories,
        });
        return { changed: true, categories };
    },
});

export const createArtwork = mutation({
    args: {
        ...artworkFields,
        primaryImage: v.object({
            sourceUrl: v.string(),
            sourceWidth: v.number(),
            sourceHeight: v.number(),
            smallUrl: nullableString,
            smallWidth: nullableNumber,
            smallHeight: nullableNumber,
        }),
    },
    handler: async (ctx, args) => {
        const actorId = await owner(ctx);
        const now = Date.now();
        const artworks = await ctx.db.query('artworks').collect();
        const legacyId = Math.max(0, ...artworks.map((item) => item.legacyId)) + 1;
        const galleryOrder = Math.max(0, ...artworks.map((item) => item.galleryOrder)) + 1000;
        const homepageOrder = Math.max(0, ...artworks.map((item) => item.homepageOrder)) + 1000;
        const { primaryImage, categories, sold, available, ...remainingFields } = args;
        const fields = {
            ...remainingFields,
            ...normalizeArtworkAvailability({ sold, available }),
            categories: categories ?? deriveArtworkCategories({ theme: remainingFields.theme, medium: remainingFields.medium }),
        };
        const artworkId = await ctx.db.insert('artworks', {
            origin: 'owner',
            legacyTable: 'Pieces',
            legacyId,
            sourceHash: `owner:${now}:${legacyId}`,
            slug: legacyArtworkSlug(fields.title, legacyId),
            ...fields,
            className: classNameFor(fields.title),
            legacyGalleryOrder: -galleryOrder,
            legacyHomepagePriority: -homepageOrder,
            galleryOrder,
            homepageOrder,
            ownerMutatedFields: Object.keys(fields),
            ownerRevision: 1,
            importedAt: now,
            updatedAt: now,
            absentFromSource: false,
        });
        const allMedia = await ctx.db.query('artworkMedia').collect();
        const mediaId = Math.max(0, ...allMedia.map((item) => item.legacyId)) + 1;
        await ctx.db.insert('artworkMedia', {
            legacyTable: 'Owner',
            legacyId: mediaId,
            artworkLegacyId: legacyId,
            sourceHash: `owner:${now}:${mediaId}`,
            role: 'primary',
            title: null,
            ...primaryImage,
            displayOrder: 0,
            ownerMutatedFields: ['*'],
            ownerRevision: 1,
            importedAt: now,
            updatedAt: now,
            absentFromSource: false,
        });
        await audit(ctx, actorId, 'artwork.created', 'artwork', String(artworkId), { legacyId });
        return { legacyId, artworkId };
    },
});

export const swapArtworkOrder = mutation({
    args: { currentLegacyId: v.number(), targetLegacyId: v.number(), kind: v.union(v.literal('gallery'), v.literal('homepage')) },
    handler: async (ctx, args) => {
        const actorId = await owner(ctx);
        const [current, target] = await Promise.all([
            artworkByLegacyId(ctx, args.currentLegacyId),
            artworkByLegacyId(ctx, args.targetLegacyId),
        ]);
        const now = Date.now();
        if (args.kind === 'gallery') {
            await ctx.db.patch(current._id, {
                galleryOrder: target.galleryOrder,
                legacyGalleryOrder: target.legacyGalleryOrder,
                ownerMutatedFields: [...new Set([...current.ownerMutatedFields, 'galleryOrder'])],
                ownerRevision: current.ownerRevision + 1,
                updatedAt: now,
            });
            await ctx.db.patch(target._id, {
                galleryOrder: current.galleryOrder,
                legacyGalleryOrder: current.legacyGalleryOrder,
                ownerMutatedFields: [...new Set([...target.ownerMutatedFields, 'galleryOrder'])],
                ownerRevision: target.ownerRevision + 1,
                updatedAt: now,
            });
        } else {
            await ctx.db.patch(current._id, {
                homepageOrder: target.homepageOrder,
                legacyHomepagePriority: target.legacyHomepagePriority,
                ownerMutatedFields: [...new Set([...current.ownerMutatedFields, 'homepageOrder'])],
                ownerRevision: current.ownerRevision + 1,
                updatedAt: now,
            });
            await ctx.db.patch(target._id, {
                homepageOrder: current.homepageOrder,
                legacyHomepagePriority: current.legacyHomepagePriority,
                ownerMutatedFields: [...new Set([...target.ownerMutatedFields, 'homepageOrder'])],
                ownerRevision: target.ownerRevision + 1,
                updatedAt: now,
            });
        }
        await audit(ctx, actorId, 'artwork.reordered', 'artwork', String(current._id), {
            target: String(target._id),
            kind: args.kind,
        });
        return { success: true };
    },
});

export const setHomepageRotation = mutation({
    args: { artworkLegacyIds: v.array(v.number()) },
    handler: async (ctx, args) => {
        const actorId = await owner(ctx);
        if (args.artworkLegacyIds.length < 1 || args.artworkLegacyIds.length > 5) {
            throw new Error('Choose between one and five artworks for the homepage.');
        }
        if (args.artworkLegacyIds.some((legacyId) => !Number.isSafeInteger(legacyId) || legacyId <= 0)) {
            throw new Error('Homepage artwork IDs must be positive integers.');
        }
        if (new Set(args.artworkLegacyIds).size !== args.artworkLegacyIds.length) {
            throw new Error('Each homepage artwork can only appear once.');
        }

        for (const legacyId of args.artworkLegacyIds) {
            const artwork = await artworkByLegacyId(ctx, legacyId);
            if (!artwork.active) throw new Error(`${artwork.title} is archived and cannot appear on the homepage.`);
            const media = await ctx.db
                .query('artworkMedia')
                .withIndex('by_artwork_and_order', (q) => q.eq('artworkLegacyId', legacyId))
                .collect();
            if (!media.some((item) => item.role === 'primary' && !item.absentFromSource)) {
                throw new Error(`${artwork.title} does not have an active primary image.`);
            }
        }

        const existing = await ctx.db
            .query('homepageRotations')
            .withIndex('by_key', (q) => q.eq('key', 'primary'))
            .unique();
        const updatedAt = Date.now();
        if (existing) {
            await ctx.db.patch(existing._id, { artworkLegacyIds: args.artworkLegacyIds, updatedAt });
        } else {
            await ctx.db.insert('homepageRotations', { key: 'primary', artworkLegacyIds: args.artworkLegacyIds, updatedAt });
        }
        await audit(ctx, actorId, 'homepage.rotation_updated', 'homepageRotation', 'primary', {
            artworkLegacyIds: args.artworkLegacyIds,
        });
        return { success: true };
    },
});

export const setArtworkActive = mutation({
    args: { legacyId: v.number(), active: v.boolean() },
    handler: async (ctx, args) => {
        const actorId = await owner(ctx);
        const artwork = await artworkByLegacyId(ctx, args.legacyId);
        const now = Date.now();
        let galleryOrder = artwork.galleryOrder;
        if (args.active && !artwork.active) {
            const artworks = await ctx.db.query('artworks').collect();
            galleryOrder = Math.max(0, ...artworks.map((item) => item.galleryOrder)) + 1000;
        }
        await ctx.db.patch(artwork._id, {
            active: args.active,
            galleryOrder,
            legacyGalleryOrder: args.active ? -galleryOrder : -1_000_000,
            ownerMutatedFields: [...new Set([...artwork.ownerMutatedFields, 'active', 'galleryOrder'])],
            ownerRevision: artwork.ownerRevision + 1,
            updatedAt: now,
        });
        await audit(ctx, actorId, args.active ? 'artwork.restored' : 'artwork.archived', 'artwork', String(artwork._id));
        return { success: true };
    },
});

const mediaInput = {
    sourceUrl: v.string(),
    sourceWidth: v.number(),
    sourceHeight: v.number(),
    smallUrl: nullableString,
    smallWidth: nullableNumber,
    smallHeight: nullableNumber,
};

export const storeArtworkMedia = mutation({
    args: {
        artworkLegacyId: v.number(),
        role: v.union(v.literal('primary'), v.literal('supporting'), v.literal('progress')),
        title: nullableString,
        ...mediaInput,
    },
    handler: async (ctx, args) => {
        const actorId = await owner(ctx);
        const artwork = await artworkByLegacyId(ctx, args.artworkLegacyId);
        const now = Date.now();
        const allMedia = await ctx.db.query('artworkMedia').collect();
        const artworkMedia = allMedia.filter((item) => item.artworkLegacyId === args.artworkLegacyId && !item.absentFromSource);
        if (args.role === 'primary') {
            const existing = artworkMedia.find((item) => item.role === 'primary');
            if (!existing) throw new Error('Primary image not found.');
            await ctx.db.patch(existing._id, {
                title: args.title,
                sourceUrl: args.sourceUrl,
                sourceWidth: args.sourceWidth,
                sourceHeight: args.sourceHeight,
                smallUrl: args.smallUrl,
                smallWidth: args.smallWidth,
                smallHeight: args.smallHeight,
                ownerMutatedFields: ['*'],
                ownerRevision: existing.ownerRevision + 1,
                updatedAt: now,
            });
            await audit(ctx, actorId, 'media.primary_replaced', 'artwork', String(artwork._id));
            return { mediaId: existing.legacyId };
        }
        const mediaId = Math.max(0, ...allMedia.map((item) => item.legacyId)) + 1;
        const sameRole = artworkMedia.filter((item) => item.role === args.role);
        const base = args.role === 'progress' ? 1_000_000 : 10_000;
        const displayOrder = Math.max(base, ...sameRole.map((item) => item.displayOrder)) + 1000;
        const id = await ctx.db.insert('artworkMedia', {
            legacyTable: 'Owner',
            legacyId: mediaId,
            artworkLegacyId: args.artworkLegacyId,
            sourceHash: `owner:${now}:${mediaId}`,
            role: args.role,
            title: args.title,
            sourceUrl: args.sourceUrl,
            sourceWidth: args.sourceWidth,
            sourceHeight: args.sourceHeight,
            smallUrl: args.smallUrl,
            smallWidth: args.smallWidth,
            smallHeight: args.smallHeight,
            displayOrder,
            ownerMutatedFields: ['*'],
            ownerRevision: 1,
            importedAt: now,
            updatedAt: now,
            absentFromSource: false,
        });
        await audit(ctx, actorId, 'media.added', 'media', String(id), { artworkId: String(artwork._id), role: args.role });
        return { mediaId };
    },
});

async function ownerMediaById(ctx: MutationCtx, mediaId: number, role: 'supporting' | 'progress') {
    const media = await ctx.db.query('artworkMedia').collect();
    const item = media.find((candidate) => candidate.legacyId === mediaId && candidate.role === role && !candidate.absentFromSource);
    if (!item) throw new Error('Artwork image not found.');
    return item;
}

export const swapMediaOrder = mutation({
    args: {
        currentMediaId: v.number(),
        targetMediaId: v.number(),
        role: v.union(v.literal('supporting'), v.literal('progress')),
    },
    handler: async (ctx, args) => {
        const actorId = await owner(ctx);
        const [current, target] = await Promise.all([
            ownerMediaById(ctx, args.currentMediaId, args.role),
            ownerMediaById(ctx, args.targetMediaId, args.role),
        ]);
        if (current.artworkLegacyId !== target.artworkLegacyId) throw new Error('Images belong to different artworks.');
        const now = Date.now();
        await ctx.db.patch(current._id, {
            displayOrder: target.displayOrder,
            ownerMutatedFields: ['*'],
            ownerRevision: current.ownerRevision + 1,
            updatedAt: now,
        });
        await ctx.db.patch(target._id, {
            displayOrder: current.displayOrder,
            ownerMutatedFields: ['*'],
            ownerRevision: target.ownerRevision + 1,
            updatedAt: now,
        });
        await audit(ctx, actorId, 'media.reordered', 'media', String(current._id), { target: String(target._id) });
        return { success: true };
    },
});

export const updateMediaTitle = mutation({
    args: {
        mediaId: v.number(),
        role: v.union(v.literal('supporting'), v.literal('progress')),
        title: nullableString,
    },
    handler: async (ctx, args) => {
        const actorId = await owner(ctx);
        const media = await ownerMediaById(ctx, args.mediaId, args.role);
        await ctx.db.patch(media._id, {
            title: args.title,
            ownerMutatedFields: ['*'],
            ownerRevision: media.ownerRevision + 1,
            updatedAt: Date.now(),
        });
        await audit(ctx, actorId, 'media.title_updated', 'media', String(media._id));
        return { success: true };
    },
});

export const archiveMedia = mutation({
    args: {
        mediaId: v.number(),
        role: v.union(v.literal('supporting'), v.literal('progress')),
    },
    handler: async (ctx, args) => {
        const actorId = await owner(ctx);
        const media = await ownerMediaById(ctx, args.mediaId, args.role);
        await ctx.db.patch(media._id, {
            absentFromSource: true,
            ownerMutatedFields: ['*'],
            ownerRevision: media.ownerRevision + 1,
            updatedAt: Date.now(),
        });
        await audit(ctx, actorId, 'media.archived', 'media', String(media._id));
        return { success: true };
    },
});

export const updateMediaDimensions = mutation({
    args: {
        mediaId: v.number(),
        role: v.union(v.literal('primary'), v.literal('supporting'), v.literal('progress')),
        sourceWidth: v.number(),
        sourceHeight: v.number(),
        smallWidth: nullableNumber,
        smallHeight: nullableNumber,
    },
    handler: async (ctx, args) => {
        const actorId = await owner(ctx);
        const media = (await ctx.db.query('artworkMedia').collect()).find(
            (candidate) => candidate.legacyId === args.mediaId && candidate.role === args.role && !candidate.absentFromSource,
        );
        if (!media) throw new Error('Artwork image not found.');
        await ctx.db.patch(media._id, {
            sourceWidth: args.sourceWidth,
            sourceHeight: args.sourceHeight,
            smallWidth: args.smallWidth,
            smallHeight: args.smallHeight,
            ownerMutatedFields: [...new Set([...media.ownerMutatedFields, 'sourceWidth', 'sourceHeight', 'smallWidth', 'smallHeight'])],
            ownerRevision: media.ownerRevision + 1,
            updatedAt: Date.now(),
        });
        await audit(ctx, actorId, 'media.dimensions_verified', 'media', String(media._id));
        return { success: true };
    },
});
