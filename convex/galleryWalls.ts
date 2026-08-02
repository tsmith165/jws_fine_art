import { v } from 'convex/values';
import type { Doc } from './_generated/dataModel';
import { mutation, query, type MutationCtx, type QueryCtx } from './_generated/server';
import { requireOwnerIdentity } from './lib/ownerAuth';
import { finishedArtworkDimensions } from '../shared/artworkDimensions';
import { galleryWallLayoutIssues, type GalleryWallPlacementGeometry } from '../shared/galleryWallLayout';

const nullableString = v.union(v.string(), v.null());
const wallPreset = v.union(
    v.literal('white-oak'),
    v.literal('warm-plaster'),
    v.literal('museum-green'),
    v.literal('charcoal'),
    v.literal('midnight'),
);
const wallBackground = v.union(
    v.object({ kind: v.literal('preset'), preset: wallPreset }),
    v.object({
        kind: v.literal('photo'),
        mediaId: v.string(),
        calibration: v.object({ referenceInches: v.number(), referencePixels: v.number(), horizonY: v.number() }),
    }),
);
const placement = v.object({
    id: v.string(),
    artworkLegacyId: v.number(),
    centerXInches: v.number(),
    centerYInches: v.number(),
});
const wallFields = {
    title: v.string(),
    narrative: nullableString,
    widthInches: v.number(),
    heightInches: v.number(),
    background: wallBackground,
    floorStyle: v.union(v.literal('oak'), v.literal('concrete'), v.literal('none')),
    lighting: v.union(v.literal('gallery'), v.literal('daylight'), v.literal('soft')),
    placements: v.array(placement),
};

function slugify(value: string) {
    return (
        value
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') || 'untitled-wall'
    );
}

async function uniqueSlug(ctx: MutationCtx, title: string, currentId?: string) {
    const base = slugify(title);
    let slug = base;
    let suffix = 2;
    while (true) {
        const existing = await ctx.db
            .query('galleryWalls')
            .withIndex('by_slug', (q) => q.eq('slug', slug))
            .unique();
        if (!existing || String(existing._id) === currentId) return slug;
        slug = `${base}-${suffix++}`;
    }
}

async function publicWall(ctx: QueryCtx, wall: Doc<'galleryWalls'>) {
    const snapshot = wall.publishedSnapshot;
    if (wall.status !== 'published' || !snapshot || snapshot.background.kind !== 'preset') return null;
    const [artworks, media] = await Promise.all([ctx.db.query('artworks').collect(), ctx.db.query('artworkMedia').collect()]);
    const artworkByLegacyId = new Map(artworks.map((artwork) => [artwork.legacyId, artwork]));
    const primaryByLegacyId = new Map(
        media.filter((item) => !item.absentFromSource && item.role === 'primary').map((item) => [item.artworkLegacyId, item]),
    );
    const placements = snapshot.placements.flatMap((item) => {
        const artwork = artworkByLegacyId.get(item.artworkLegacyId);
        const primary = primaryByLegacyId.get(item.artworkLegacyId);
        if (!artwork || !primary || artwork.absentFromSource || !artwork.active || (!artwork.available && !artwork.sold)) return [];
        const size = finishedArtworkDimensions({
            framed: artwork.framed,
            widthInches: artwork.widthInches,
            heightInches: artwork.heightInches,
            framedWidthInches: artwork.framedWidthInches,
            framedHeightInches: artwork.framedHeightInches,
            framedDimensionsVerified: artwork.framedDimensionsVerified,
        });
        if (!size) return [];
        return [
            {
                ...item,
                artwork: {
                    legacyId: artwork.legacyId,
                    slug: artwork.slug,
                    title: artwork.title,
                    medium: artwork.medium,
                    priceCents: artwork.priceCents,
                    sold: artwork.sold,
                    available: artwork.available,
                    framed: artwork.framed,
                    widthInches: size.widthInches,
                    heightInches: size.heightInches,
                    dimensionsEstimated: size.estimated,
                    imageUrl: primary.sourceUrl,
                    imageWidth: primary.sourceWidth,
                    imageHeight: primary.sourceHeight,
                    presentationCrop: primary.presentationCrop ?? null,
                },
            },
        ];
    });
    return {
        id: wall._id,
        slug: wall.slug,
        title: snapshot.title,
        narrative: snapshot.narrative,
        publishOrder: wall.publishOrder,
        widthInches: snapshot.widthInches,
        heightInches: snapshot.heightInches,
        background: snapshot.background,
        floorStyle: snapshot.floorStyle,
        lighting: snapshot.lighting,
        placements,
        publishedAt: snapshot.publishedAt,
    };
}

export const listPublished = query({
    args: {},
    handler: async (ctx) => {
        const walls = await ctx.db
            .query('galleryWalls')
            .withIndex('by_status_order', (q) => q.eq('status', 'published'))
            .collect();
        return (await Promise.all(walls.sort((a, b) => a.publishOrder - b.publishOrder).map((wall) => publicWall(ctx, wall)))).filter(
            (wall): wall is NonNullable<typeof wall> => Boolean(wall),
        );
    },
});

export const getPublishedBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        const wall = await ctx.db
            .query('galleryWalls')
            .withIndex('by_slug', (q) => q.eq('slug', args.slug))
            .unique();
        return wall ? publicWall(ctx, wall) : null;
    },
});

export const listOwner = query({
    args: {},
    handler: async (ctx) => {
        await requireOwnerIdentity(ctx);
        const walls = await ctx.db.query('galleryWalls').collect();
        return walls.sort((a, b) => a.publishOrder - b.publishOrder || b.updatedAt - a.updatedAt);
    },
});

export const ownerDiagnostics = query({
    args: {},
    handler: async (ctx) => {
        await requireOwnerIdentity(ctx);
        const [walls, artworks, media] = await Promise.all([
            ctx.db.query('galleryWalls').collect(),
            ctx.db.query('artworks').collect(),
            ctx.db.query('artworkMedia').collect(),
        ]);
        const artworkByLegacyId = new Map(artworks.map((artwork) => [artwork.legacyId, artwork]));
        const primaryIds = new Set(
            media.filter((item) => item.role === 'primary' && !item.absentFromSource).map((item) => item.artworkLegacyId),
        );
        const brokenWalls = walls.flatMap((wall) => {
            if (wall.status !== 'published' || !wall.publishedSnapshot) return [];
            const issues = wall.publishedSnapshot.placements.flatMap((placement) => {
                const artwork = artworkByLegacyId.get(placement.artworkLegacyId);
                if (!artwork || artwork.absentFromSource) return [`Artwork #${placement.artworkLegacyId} is missing`];
                if (!artwork.active) return [`${artwork.title} is archived`];
                if (!artwork.available && !artwork.sold) return [`${artwork.title} is private`];
                if (!primaryIds.has(artwork.legacyId)) return [`${artwork.title} has no primary image`];
                const size = finishedArtworkDimensions({
                    framed: artwork.framed,
                    widthInches: artwork.widthInches,
                    heightInches: artwork.heightInches,
                    framedWidthInches: artwork.framedWidthInches,
                    framedHeightInches: artwork.framedHeightInches,
                    framedDimensionsVerified: artwork.framedDimensionsVerified,
                });
                return size ? [] : [`${artwork.title} has no usable finished dimensions`];
            });
            return issues.length ? [{ wallId: String(wall._id), slug: wall.slug, title: wall.title, issues }] : [];
        });
        return {
            publishedCount: walls.filter((wall) => wall.status === 'published').length,
            brokenCount: brokenWalls.length,
            brokenWalls,
        };
    },
});

export const saveWall = mutation({
    args: { wallId: v.optional(v.id('galleryWalls')), expectedRevision: v.optional(v.number()), ...wallFields },
    handler: async (ctx, args) => {
        const identity = await requireOwnerIdentity(ctx);
        const actorId = String(identity.subject);
        if (!args.title.trim()) throw new Error('Give this wall a title.');
        if (args.widthInches < 48 || args.heightInches < 48) throw new Error('Gallery walls must be at least 48 inches wide and tall.');
        const now = Date.now();
        const { wallId, expectedRevision, ...fields } = args;
        if (fields.background.kind !== 'preset') throw new Error('Photo walls are reserved for a future calibrated workflow.');
        if (wallId) {
            const existing = await ctx.db.get(wallId);
            if (!existing) throw new Error('Gallery wall not found.');
            if (expectedRevision !== undefined && existing.draftRevision !== expectedRevision) {
                throw new Error('This wall changed in another session. Reload before saving so the newer draft is not overwritten.');
            }
            const slug = await uniqueSlug(ctx, fields.title, String(wallId));
            const draftRevision = existing.draftRevision + 1;
            await ctx.db.patch(wallId, { ...fields, title: fields.title.trim(), slug, draftRevision, updatedAt: now });
            await ctx.db.insert('ownerAuditEvents', {
                actorId,
                action: 'gallery_wall.updated',
                entityType: 'galleryWall',
                entityId: String(wallId),
                detailsJson: JSON.stringify({ draftRevision }),
                createdAt: now,
            });
            return { wallId, slug, draftRevision };
        }
        const walls = await ctx.db.query('galleryWalls').collect();
        const publishOrder = Math.max(0, ...walls.map((wall) => wall.publishOrder)) + 1000;
        const slug = await uniqueSlug(ctx, fields.title);
        const id = await ctx.db.insert('galleryWalls', {
            ...fields,
            title: fields.title.trim(),
            slug,
            status: 'draft',
            publishOrder,
            draftRevision: 1,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert('ownerAuditEvents', {
            actorId,
            action: 'gallery_wall.created',
            entityType: 'galleryWall',
            entityId: String(id),
            detailsJson: JSON.stringify({ draftRevision: 1 }),
            createdAt: now,
        });
        return { wallId: id, slug, draftRevision: 1 };
    },
});

export const publishWall = mutation({
    args: { wallId: v.id('galleryWalls') },
    handler: async (ctx, args) => {
        const identity = await requireOwnerIdentity(ctx);
        const wall = await ctx.db.get(args.wallId);
        if (!wall) throw new Error('Gallery wall not found.');
        if (!wall.placements.length) throw new Error('Place at least one artwork before publishing.');
        if (wall.background.kind !== 'preset') throw new Error('Only calibrated gallery presets can be published.');
        const [artworks, media] = await Promise.all([ctx.db.query('artworks').collect(), ctx.db.query('artworkMedia').collect()]);
        const byLegacyId = new Map(artworks.map((artwork) => [artwork.legacyId, artwork]));
        const primaryIds = new Set(
            media.filter((item) => item.role === 'primary' && !item.absentFromSource).map((item) => item.artworkLegacyId),
        );
        const geometry: GalleryWallPlacementGeometry[] = [];
        for (const placement of wall.placements) {
            const artwork = byLegacyId.get(placement.artworkLegacyId);
            if (!artwork || artwork.absentFromSource || !artwork.active)
                throw new Error('Remove archived or missing artwork before publishing.');
            if (!artwork.available && !artwork.sold)
                throw new Error(`${artwork.title} is private. Make it public or remove it before publishing.`);
            if (!primaryIds.has(artwork.legacyId)) throw new Error(`${artwork.title} needs a primary image before this wall can publish.`);
            const size = finishedArtworkDimensions({
                framed: artwork.framed,
                widthInches: artwork.widthInches,
                heightInches: artwork.heightInches,
                framedWidthInches: artwork.framedWidthInches,
                framedHeightInches: artwork.framedHeightInches,
                framedDimensionsVerified: artwork.framedDimensionsVerified,
            });
            if (!size) throw new Error(`${artwork.title} needs usable finished dimensions before this wall can publish.`);
            geometry.push({ ...placement, widthInches: size.widthInches, heightInches: size.heightInches });
        }
        const issues = galleryWallLayoutIssues({ widthInches: wall.widthInches, heightInches: wall.heightInches }, geometry);
        if (issues.outOfBoundsIds.length) throw new Error('Move every artwork fully inside the wall before publishing.');
        if (issues.overlappingPairs.length) throw new Error('Separate overlapping artwork before publishing.');
        const now = Date.now();
        await ctx.db.patch(args.wallId, {
            status: 'published',
            publishedSnapshot: {
                revision: wall.draftRevision,
                title: wall.title,
                narrative: wall.narrative,
                widthInches: wall.widthInches,
                heightInches: wall.heightInches,
                background: wall.background,
                floorStyle: wall.floorStyle,
                lighting: wall.lighting,
                placements: wall.placements,
                publishedAt: now,
            },
            updatedAt: now,
        });
        await ctx.db.insert('ownerAuditEvents', {
            actorId: String(identity.subject),
            action: 'gallery_wall.published',
            entityType: 'galleryWall',
            entityId: String(wall._id),
            detailsJson: JSON.stringify({ revision: wall.draftRevision, placements: wall.placements.length }),
            createdAt: now,
        });
        return { published: true, slug: wall.slug };
    },
});

export const unpublishWall = mutation({
    args: { wallId: v.id('galleryWalls') },
    handler: async (ctx, args) => {
        const identity = await requireOwnerIdentity(ctx);
        const wall = await ctx.db.get(args.wallId);
        if (!wall) throw new Error('Gallery wall not found.');
        await ctx.db.patch(args.wallId, { status: 'draft', updatedAt: Date.now() });
        await ctx.db.insert('ownerAuditEvents', {
            actorId: String(identity.subject),
            action: 'gallery_wall.unpublished',
            entityType: 'galleryWall',
            entityId: String(wall._id),
            detailsJson: '{}',
            createdAt: Date.now(),
        });
        return { unpublished: true, slug: wall.slug };
    },
});

export const duplicateWall = mutation({
    args: { wallId: v.id('galleryWalls') },
    handler: async (ctx, args) => {
        const identity = await requireOwnerIdentity(ctx);
        const wall = await ctx.db.get(args.wallId);
        if (!wall) throw new Error('Gallery wall not found.');
        const now = Date.now();
        const title = `${wall.title} copy`;
        const slug = await uniqueSlug(ctx, title);
        const walls = await ctx.db.query('galleryWalls').collect();
        const publishOrder = Math.max(0, ...walls.map((item) => item.publishOrder)) + 1000;
        const wallId = await ctx.db.insert('galleryWalls', {
            slug,
            title,
            narrative: wall.narrative,
            status: 'draft',
            publishOrder,
            widthInches: wall.widthInches,
            heightInches: wall.heightInches,
            background: wall.background,
            floorStyle: wall.floorStyle,
            lighting: wall.lighting,
            draftRevision: 1,
            placements: wall.placements.map((item) => ({ ...item, id: `${item.id}-copy-${now}` })),
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert('ownerAuditEvents', {
            actorId: String(identity.subject),
            action: 'gallery_wall.duplicated',
            entityType: 'galleryWall',
            entityId: String(wallId),
            detailsJson: JSON.stringify({ sourceWallId: String(wall._id) }),
            createdAt: now,
        });
        return { wallId, slug };
    },
});

export const moveWall = mutation({
    args: { wallId: v.id('galleryWalls'), direction: v.union(v.literal('up'), v.literal('down')) },
    handler: async (ctx, args) => {
        const identity = await requireOwnerIdentity(ctx);
        const walls = (await ctx.db.query('galleryWalls').collect()).sort((a, b) => a.publishOrder - b.publishOrder);
        const index = walls.findIndex((wall) => wall._id === args.wallId);
        const targetIndex = args.direction === 'up' ? index - 1 : index + 1;
        if (index < 0 || targetIndex < 0 || targetIndex >= walls.length) return { changed: false };
        const current = walls[index];
        const target = walls[targetIndex];
        const now = Date.now();
        await ctx.db.patch(current._id, { publishOrder: target.publishOrder, updatedAt: now });
        await ctx.db.patch(target._id, { publishOrder: current.publishOrder, updatedAt: now });
        await ctx.db.insert('ownerAuditEvents', {
            actorId: String(identity.subject),
            action: 'gallery_wall.reordered',
            entityType: 'galleryWall',
            entityId: String(current._id),
            detailsJson: JSON.stringify({ direction: args.direction, targetWallId: String(target._id) }),
            createdAt: now,
        });
        return { changed: true };
    },
});

export const archiveWall = mutation({
    args: { wallId: v.id('galleryWalls') },
    handler: async (ctx, args) => {
        const identity = await requireOwnerIdentity(ctx);
        const wall = await ctx.db.get(args.wallId);
        if (!wall) throw new Error('Gallery wall not found.');
        await ctx.db.patch(args.wallId, { status: 'archived', updatedAt: Date.now() });
        await ctx.db.insert('ownerAuditEvents', {
            actorId: String(identity.subject),
            action: 'gallery_wall.archived',
            entityType: 'galleryWall',
            entityId: String(wall._id),
            detailsJson: '{}',
            createdAt: Date.now(),
        });
        return { archived: true };
    },
});
