import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';
import { internalMutation, internalQuery } from './_generated/server';
import { planImportedFieldMerge } from './lib/importMerge';
import { legacyArtworkSlug, normalizeLegacyBoolean, SERIALIZER_VERSION } from './lib/legacy';
import { deriveArtworkCategories } from '../shared/artworkCategories';

type ImportedArtworkField =
    | 'title'
    | 'description'
    | 'medium'
    | 'theme'
    | 'categories'
    | 'instagramUrl'
    | 'ownerNotes'
    | 'className'
    | 'legacyGalleryOrder'
    | 'legacyHomepagePriority'
    | 'priceCents'
    | 'sold'
    | 'available'
    | 'active'
    | 'framed'
    | 'widthInches'
    | 'heightInches';

const importedArtworkFields: ImportedArtworkField[] = [
    'title',
    'description',
    'medium',
    'theme',
    'categories',
    'instagramUrl',
    'ownerNotes',
    'className',
    'legacyGalleryOrder',
    'legacyHomepagePriority',
    'priceCents',
    'sold',
    'available',
    'active',
    'framed',
    'widthInches',
    'heightInches',
];

function sourceArtwork(piece: Doc<'legacyPieces'>) {
    return {
        title: piece.title,
        description: piece.description,
        medium: piece.pieceType,
        theme: piece.theme,
        categories: deriveArtworkCategories({ theme: piece.theme, medium: piece.pieceType }),
        instagramUrl: piece.instagram,
        ownerNotes: piece.comments,
        className: piece.className,
        legacyGalleryOrder: piece.oId,
        legacyHomepagePriority: piece.pId,
        priceCents: piece.price * 100,
        sold: normalizeLegacyBoolean(piece.sold, false),
        available: normalizeLegacyBoolean(piece.available, true),
        active: normalizeLegacyBoolean(piece.active, true),
        framed: normalizeLegacyBoolean(piece.framed, false),
        widthInches: piece.realWidth,
        heightInches: piece.realHeight,
    };
}

export const backfillArtworkCategories = internalMutation({
    args: { dryRun: v.boolean() },
    handler: async (ctx, args) => {
        const artworks = await ctx.db.query('artworks').collect();
        const activeArtworks = artworks.filter((artwork) => !artwork.absentFromSource);
        const projected = activeArtworks.map((artwork) => ({
            artwork,
            categories: artwork.ownerMutatedFields.includes('categories')
                ? (artwork.categories ?? [])
                : deriveArtworkCategories({ theme: artwork.theme, medium: artwork.medium }),
        }));
        const changes = projected.filter(
            ({ artwork, categories }) => JSON.stringify(artwork.categories ?? []) !== JSON.stringify(categories),
        );

        if (!args.dryRun) {
            for (const { artwork, categories } of changes) {
                await ctx.db.patch(artwork._id, { categories, updatedAt: Date.now() });
            }
        }

        return {
            dryRun: args.dryRun,
            scanned: activeArtworks.length,
            changed: changes.length,
            counts: Object.fromEntries(
                ['coastal', 'mountain', 'urban', 'intaglio-lino-cut'].map((category) => [
                    category,
                    projected.filter(({ categories }) =>
                        categories.includes(category as 'coastal' | 'mountain' | 'urban' | 'intaglio-lino-cut'),
                    ).length,
                ]),
            ),
        };
    },
});

export const deriveCanonical = internalMutation({
    args: {
        runId: v.string(),
        snapshotId: v.string(),
        sourceSummaryHash: v.string(),
        importedAt: v.number(),
    },
    handler: async (ctx, args) => {
        const existingRun = await ctx.db
            .query('migrationRuns')
            .withIndex('by_run_id', (q) => q.eq('runId', args.runId))
            .unique();
        if (existingRun) {
            return {
                runDocumentId: existingRun._id,
                status: existingRun.status,
                unchangedRun: true,
            };
        }

        const [pieces, extraImages, progressImages, pendingTransactions, verifiedTransactions] = await Promise.all([
            ctx.db
                .query('legacyPieces')
                .withIndex('by_snapshot_id', (q) => q.eq('snapshotId', args.snapshotId))
                .collect(),
            ctx.db
                .query('legacyExtraImages')
                .withIndex('by_snapshot_id', (q) => q.eq('snapshotId', args.snapshotId))
                .collect(),
            ctx.db
                .query('legacyProgressImages')
                .withIndex('by_snapshot_id', (q) => q.eq('snapshotId', args.snapshotId))
                .collect(),
            ctx.db
                .query('legacyPendingTransactions')
                .withIndex('by_snapshot_id', (q) => q.eq('snapshotId', args.snapshotId))
                .collect(),
            ctx.db
                .query('legacyVerifiedTransactions')
                .withIndex('by_snapshot_id', (q) => q.eq('snapshotId', args.snapshotId))
                .collect(),
        ]);

        const rawCounts = {
            legacyPieces: pieces.length,
            legacyExtraImages: extraImages.length,
            legacyProgressImages: progressImages.length,
            legacyPendingTransactions: pendingTransactions.length,
            legacyVerifiedTransactions: verifiedTransactions.length,
        };

        const runDocumentId = await ctx.db.insert('migrationRuns', {
            runId: args.runId,
            snapshotId: args.snapshotId,
            serializerVersion: SERIALIZER_VERSION,
            sourceSummaryHash: args.sourceSummaryHash,
            status: 'running',
            rawCountsJson: JSON.stringify(rawCounts),
            canonicalCountsJson: '{}',
            conflicts: 0,
            startedAt: args.importedAt,
            completedAt: null,
        });

        let conflicts = 0;
        let insertedArtworks = 0;
        let updatedArtworks = 0;
        let insertedMedia = 0;
        let updatedMedia = 0;

        const existingArtworks = await ctx.db.query('artworks').collect();
        const artworksByLegacyId = new Map(existingArtworks.map((artwork) => [artwork.legacyId, artwork]));
        const pieceIds = new Set(pieces.map((piece) => piece.legacyId));
        const initialArtworkImport = existingArtworks.length === 0;

        const gallerySeed = [...pieces]
            .sort((a, b) => b.oId - a.oId || a.legacyId - b.legacyId)
            .map((piece, index) => [piece.legacyId, (index + 1) * 1000] as const);
        const homepageSeed = [...pieces]
            .sort((a, b) => b.pId - a.pId || a.legacyId - b.legacyId)
            .map((piece, index) => [piece.legacyId, (index + 1) * 1000] as const);
        const galleryPositions = new Map(gallerySeed);
        const homepagePositions = new Map(homepageSeed);
        let nextGalleryOrder = Math.max(0, ...existingArtworks.map((artwork) => artwork.galleryOrder)) + 1000;
        let nextHomepageOrder = Math.max(0, ...existingArtworks.map((artwork) => artwork.homepageOrder)) + 1000;

        for (const piece of [...pieces].sort((a, b) => a.legacyId - b.legacyId)) {
            const existing = artworksByLegacyId.get(piece.legacyId);
            const imported = sourceArtwork(piece);

            if (!existing) {
                const artworkId = await ctx.db.insert('artworks', {
                    origin: 'legacy',
                    legacyTable: 'Pieces',
                    legacyId: piece.legacyId,
                    sourceHash: piece.sourceHash,
                    slug: legacyArtworkSlug(piece.title, piece.legacyId),
                    ...imported,
                    galleryOrder: initialArtworkImport ? (galleryPositions.get(piece.legacyId) ?? nextGalleryOrder) : nextGalleryOrder,
                    homepageOrder: initialArtworkImport ? (homepagePositions.get(piece.legacyId) ?? nextHomepageOrder) : nextHomepageOrder,
                    ownerMutatedFields: [],
                    ownerRevision: 0,
                    importedAt: args.importedAt,
                    updatedAt: args.importedAt,
                    absentFromSource: false,
                });
                artworksByLegacyId.set(piece.legacyId, (await ctx.db.get(artworkId))!);
                insertedArtworks += 1;
                if (!initialArtworkImport) {
                    nextGalleryOrder += 1000;
                    nextHomepageOrder += 1000;
                }
                continue;
            }

            if (
                existing.sourceHash === piece.sourceHash &&
                !existing.absentFromSource &&
                existing.legacyGalleryOrder !== undefined &&
                existing.legacyHomepagePriority !== undefined
            ) {
                continue;
            }

            const mergePlan = planImportedFieldMerge({
                existing,
                imported,
                fields: importedArtworkFields,
                ownerMutatedFields: existing.ownerMutatedFields,
            });
            const patch: Partial<Doc<'artworks'>> = {
                origin: 'legacy',
                sourceHash: piece.sourceHash,
                absentFromSource: false,
                importedAt: args.importedAt,
                ...(mergePlan.patch as Partial<Doc<'artworks'>>),
            };

            for (const field of mergePlan.conflicts) {
                await ctx.db.insert('migrationConflicts', {
                    runId: args.runId,
                    sourceTable: 'Pieces',
                    legacyId: piece.legacyId,
                    field,
                    reason: 'Source value changed after an audited owner mutation.',
                    sourceHash: piece.sourceHash,
                    createdAt: args.importedAt,
                });
                conflicts += 1;
            }

            await ctx.db.patch(existing._id, patch);
            updatedArtworks += 1;
        }

        for (const artwork of existingArtworks) {
            if (!pieceIds.has(artwork.legacyId) && !artwork.absentFromSource) {
                await ctx.db.patch(artwork._id, {
                    absentFromSource: true,
                    updatedAt: args.importedAt,
                });
                updatedArtworks += 1;
            }
        }

        const primaryMedia = pieces.map((piece) => ({
            legacyTable: 'Pieces' as const,
            legacyId: piece.legacyId,
            artworkLegacyId: piece.legacyId,
            sourceHash: piece.sourceHash,
            role: 'primary' as const,
            title: null,
            sourceUrl: piece.imagePath,
            sourceWidth: piece.width,
            sourceHeight: piece.height,
            smallUrl: piece.smallImagePath,
            smallWidth: piece.smallWidth,
            smallHeight: piece.smallHeight,
            displayOrder: 0,
        }));
        const supportingMedia = extraImages.map((image) => ({
            legacyTable: 'ExtraImages' as const,
            legacyId: image.legacyId,
            artworkLegacyId: image.pieceLegacyId,
            sourceHash: image.sourceHash,
            role: 'supporting' as const,
            title: image.title,
            sourceUrl: image.imagePath,
            sourceWidth: image.width,
            sourceHeight: image.height,
            smallUrl: image.smallImagePath,
            smallWidth: image.smallWidth,
            smallHeight: image.smallHeight,
            displayOrder: image.legacyId * 10,
        }));
        const progressMedia = progressImages.map((image) => ({
            legacyTable: 'ProgressImages' as const,
            legacyId: image.legacyId,
            artworkLegacyId: image.pieceLegacyId,
            sourceHash: image.sourceHash,
            role: 'progress' as const,
            title: image.title,
            sourceUrl: image.imagePath,
            sourceWidth: image.width,
            sourceHeight: image.height,
            smallUrl: image.smallImagePath,
            smallWidth: image.smallWidth,
            smallHeight: image.smallHeight,
            displayOrder: 1_000_000 + image.legacyId * 10,
        }));
        const sourceMedia = [...primaryMedia, ...supportingMedia, ...progressMedia];
        const sourceMediaKeys = new Set(sourceMedia.map((media) => `${media.legacyTable}:${media.legacyId}`));
        const existingMedia = await ctx.db.query('artworkMedia').collect();
        const mediaBySource = new Map(existingMedia.map((media) => [`${media.legacyTable}:${media.legacyId}`, media]));

        for (const media of sourceMedia) {
            const key = `${media.legacyTable}:${media.legacyId}`;
            const existing = mediaBySource.get(key);
            if (!existing) {
                await ctx.db.insert('artworkMedia', {
                    ...media,
                    ownerMutatedFields: [],
                    ownerRevision: 0,
                    importedAt: args.importedAt,
                    updatedAt: args.importedAt,
                    absentFromSource: false,
                });
                insertedMedia += 1;
                continue;
            }
            if (existing.sourceHash === media.sourceHash && !existing.absentFromSource) {
                continue;
            }
            if (existing.ownerMutatedFields.length > 0) {
                await ctx.db.insert('migrationConflicts', {
                    runId: args.runId,
                    sourceTable: media.legacyTable,
                    legacyId: media.legacyId,
                    field: '*',
                    reason: 'Source media changed after an audited owner mutation.',
                    sourceHash: media.sourceHash,
                    createdAt: args.importedAt,
                });
                conflicts += 1;
                continue;
            }
            await ctx.db.patch(existing._id, {
                ...media,
                absentFromSource: false,
                importedAt: args.importedAt,
            });
            updatedMedia += 1;
        }

        for (const media of existingMedia) {
            const key = `${media.legacyTable}:${media.legacyId}`;
            if (!sourceMediaKeys.has(key) && !media.absentFromSource) {
                await ctx.db.patch(media._id, {
                    absentFromSource: true,
                    updatedAt: args.importedAt,
                });
                updatedMedia += 1;
            }
        }

        const verifiedByStripeId = new Map<string, Doc<'legacyVerifiedTransactions'>[]>();
        for (const transaction of verifiedTransactions) {
            const group = verifiedByStripeId.get(transaction.stripeId) ?? [];
            group.push(transaction);
            verifiedByStripeId.set(transaction.stripeId, group);
        }

        let insertedOrders = 0;
        for (const [stripeId, group] of verifiedByStripeId) {
            const existing = await ctx.db
                .query('orders')
                .withIndex('by_legacy_stripe_id', (q) => q.eq('legacyStripeId', stripeId))
                .unique();
            if (existing) continue;

            const sorted = [...group].sort((a, b) => a.legacyId - b.legacyId);
            const representative = sorted[0];
            const artwork = artworksByLegacyId.get(representative.pieceLegacyId) ?? null;
            await ctx.db.insert('orders', {
                source: 'legacy',
                legacySourceIds: sorted.map((transaction) => transaction.legacyId),
                legacyStripeId: stripeId,
                paymentIntentId: null,
                checkoutIntentId: null,
                artworkId: (artwork?._id as Id<'artworks'> | undefined) ?? null,
                artworkLegacyId: representative.pieceLegacyId,
                artworkTitle: representative.pieceTitle,
                artworkImageUrl: representative.imagePath,
                legacyRecordedPriceCents: representative.price * 100,
                amountPaidCents: null,
                shippingPaidCents: null,
                currency: 'usd',
                buyerName: representative.fullName,
                buyerPhone: representative.phone,
                buyerEmail: representative.email,
                shippingAddress: representative.address,
                international: representative.international === true,
                purchasedOn: representative.purchasedOn,
                status: 'legacy_verified',
                fulfillmentStatus: 'untracked',
                createdAt: args.importedAt,
                updatedAt: args.importedAt,
            });
            insertedOrders += 1;
        }

        const canonicalCounts = {
            artworks: (await ctx.db.query('artworks').collect()).length,
            artworkMedia: (await ctx.db.query('artworkMedia').collect()).length,
            orders: (await ctx.db.query('orders').collect()).length,
            insertedArtworks,
            updatedArtworks,
            insertedMedia,
            updatedMedia,
            insertedOrders,
        };
        await ctx.db.patch(runDocumentId, {
            status: 'verified',
            canonicalCountsJson: JSON.stringify(canonicalCounts),
            conflicts,
            completedAt: Date.now(),
        });

        return {
            runDocumentId,
            status: 'verified' as const,
            unchangedRun: false,
            rawCounts,
            canonicalCounts,
            conflicts,
        };
    },
});

const legacyTableValidator = v.union(
    v.literal('legacyPieces'),
    v.literal('legacyExtraImages'),
    v.literal('legacyProgressImages'),
    v.literal('legacyPendingTransactions'),
    v.literal('legacyVerifiedTransactions'),
);

export const snapshotTableStatus = internalQuery({
    args: {
        table: legacyTableValidator,
        snapshotId: v.string(),
    },
    handler: async (ctx, args) => {
        switch (args.table) {
            case 'legacyPieces':
                return (
                    await ctx.db
                        .query('legacyPieces')
                        .withIndex('by_snapshot_id', (q) => q.eq('snapshotId', args.snapshotId))
                        .collect()
                ).length;
            case 'legacyExtraImages':
                return (
                    await ctx.db
                        .query('legacyExtraImages')
                        .withIndex('by_snapshot_id', (q) => q.eq('snapshotId', args.snapshotId))
                        .collect()
                ).length;
            case 'legacyProgressImages':
                return (
                    await ctx.db
                        .query('legacyProgressImages')
                        .withIndex('by_snapshot_id', (q) => q.eq('snapshotId', args.snapshotId))
                        .collect()
                ).length;
            case 'legacyPendingTransactions':
                return (
                    await ctx.db
                        .query('legacyPendingTransactions')
                        .withIndex('by_snapshot_id', (q) => q.eq('snapshotId', args.snapshotId))
                        .collect()
                ).length;
            case 'legacyVerifiedTransactions':
                return (
                    await ctx.db
                        .query('legacyVerifiedTransactions')
                        .withIndex('by_snapshot_id', (q) => q.eq('snapshotId', args.snapshotId))
                        .collect()
                ).length;
        }
    },
});

export const auditSummary = internalQuery({
    args: { snapshotId: v.string() },
    handler: async (ctx, args) => {
        const [pieces, extra, progress, pending, verified, artworks, media, orders, runs, conflicts] = await Promise.all([
            ctx.db
                .query('legacyPieces')
                .withIndex('by_snapshot_id', (q) => q.eq('snapshotId', args.snapshotId))
                .collect(),
            ctx.db
                .query('legacyExtraImages')
                .withIndex('by_snapshot_id', (q) => q.eq('snapshotId', args.snapshotId))
                .collect(),
            ctx.db
                .query('legacyProgressImages')
                .withIndex('by_snapshot_id', (q) => q.eq('snapshotId', args.snapshotId))
                .collect(),
            ctx.db
                .query('legacyPendingTransactions')
                .withIndex('by_snapshot_id', (q) => q.eq('snapshotId', args.snapshotId))
                .collect(),
            ctx.db
                .query('legacyVerifiedTransactions')
                .withIndex('by_snapshot_id', (q) => q.eq('snapshotId', args.snapshotId))
                .collect(),
            ctx.db.query('artworks').collect(),
            ctx.db.query('artworkMedia').collect(),
            ctx.db.query('orders').collect(),
            ctx.db.query('migrationRuns').collect(),
            ctx.db.query('migrationConflicts').collect(),
        ]);

        return {
            raw: {
                legacyPieces: pieces.map(({ legacyId, sourceHash }) => ({ legacyId, sourceHash })),
                legacyExtraImages: extra.map(({ legacyId, pieceLegacyId, sourceHash }) => ({
                    legacyId,
                    pieceLegacyId,
                    sourceHash,
                })),
                legacyProgressImages: progress.map(({ legacyId, pieceLegacyId, sourceHash }) => ({
                    legacyId,
                    pieceLegacyId,
                    sourceHash,
                })),
                legacyPendingTransactions: pending.map(({ legacyId, pieceLegacyId, sourceHash }) => ({
                    legacyId,
                    pieceLegacyId,
                    sourceHash,
                })),
                legacyVerifiedTransactions: verified.map(({ legacyId, pieceLegacyId, stripeId, sourceHash }) => ({
                    legacyId,
                    pieceLegacyId,
                    stripeId,
                    sourceHash,
                })),
            },
            canonical: {
                artworks: artworks.map(
                    ({
                        legacyId,
                        sourceHash,
                        slug,
                        title,
                        description,
                        medium,
                        theme,
                        instagramUrl,
                        ownerNotes,
                        className,
                        legacyGalleryOrder,
                        legacyHomepagePriority,
                        priceCents,
                        releasedAt,
                        sold,
                        available,
                        active,
                        framed,
                        widthInches,
                        heightInches,
                        galleryOrder,
                        homepageOrder,
                        absentFromSource,
                    }) => ({
                        legacyId,
                        sourceHash,
                        slug,
                        title,
                        description,
                        medium,
                        theme,
                        instagramUrl,
                        ownerNotes,
                        className,
                        legacyGalleryOrder,
                        legacyHomepagePriority,
                        priceCents,
                        releasedAt,
                        sold,
                        available,
                        active,
                        framed,
                        widthInches,
                        heightInches,
                        galleryOrder,
                        homepageOrder,
                        absentFromSource,
                    }),
                ),
                artworkMedia: media.map(
                    ({
                        legacyTable,
                        legacyId,
                        artworkLegacyId,
                        sourceHash,
                        role,
                        title,
                        sourceUrl,
                        sourceWidth,
                        sourceHeight,
                        smallUrl,
                        smallWidth,
                        smallHeight,
                        displayOrder,
                        absentFromSource,
                    }) => ({
                        legacyTable,
                        legacyId,
                        artworkLegacyId,
                        sourceHash,
                        role,
                        title,
                        sourceUrl,
                        sourceWidth,
                        sourceHeight,
                        smallUrl,
                        smallWidth,
                        smallHeight,
                        displayOrder,
                        absentFromSource,
                    }),
                ),
                legacyOrders: orders
                    .filter((order) => order.source === 'legacy')
                    .map(({ legacySourceIds, legacyStripeId }) => ({ legacySourceIds, legacyStripeId })),
            },
            migrationRuns: runs.map(({ runId, snapshotId, status, conflicts: runConflicts }) => ({
                runId,
                snapshotId,
                status,
                conflicts: runConflicts,
            })),
            conflictCount: conflicts.length,
        };
    },
});
