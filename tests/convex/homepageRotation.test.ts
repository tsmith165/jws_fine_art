import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, it } from 'vitest';
import { api } from '../../convex/_generated/api';
import schema from '../../convex/schema';

const modules = (import.meta as ImportMeta & { glob(pattern: string): Record<string, () => Promise<unknown>> }).glob(
    '../../convex/**/*.ts',
);

function createHarness() {
    return convexTest(schema, modules);
}

async function seedArtwork(
    t: ReturnType<typeof createHarness>,
    {
        legacyId,
        title = `Artwork ${legacyId}`,
        homepageOrder = 1000,
        active = true,
        withPrimaryImage = true,
    }: {
        legacyId: number;
        title?: string;
        homepageOrder?: number;
        active?: boolean;
        withPrimaryImage?: boolean;
    },
) {
    return t.run(async (ctx) => {
        const now = Date.now();
        const artworkId = await ctx.db.insert('artworks', {
            origin: 'legacy',
            legacyTable: 'Pieces',
            legacyId,
            sourceHash: `test-artwork-${legacyId}`,
            slug: `test-artwork-${legacyId}`,
            title,
            description: null,
            medium: 'Oil on panel',
            theme: 'Coastal',
            instagramUrl: null,
            ownerNotes: null,
            className: `test_artwork_${legacyId}`,
            legacyGalleryOrder: legacyId,
            legacyHomepagePriority: homepageOrder,
            priceCents: 95000,
            sold: false,
            available: true,
            active,
            framed: true,
            widthInches: 16,
            heightInches: 20,
            galleryOrder: legacyId,
            homepageOrder,
            ownerMutatedFields: [],
            ownerRevision: 0,
            importedAt: now,
            updatedAt: now,
            absentFromSource: false,
        });

        if (withPrimaryImage) {
            await ctx.db.insert('artworkMedia', {
                legacyTable: 'Pieces',
                legacyId,
                artworkLegacyId: legacyId,
                sourceHash: `test-media-${legacyId}`,
                role: 'primary',
                title: null,
                sourceUrl: `https://example.com/artwork-${legacyId}.jpg`,
                sourceWidth: 1600,
                sourceHeight: 2000,
                smallUrl: null,
                smallWidth: null,
                smallHeight: null,
                displayOrder: 0,
                ownerMutatedFields: [],
                ownerRevision: 0,
                importedAt: now,
                updatedAt: now,
                absentFromSource: false,
            });
        }

        return artworkId;
    });
}

function owner(t: ReturnType<typeof createHarness>) {
    return t.withIdentity({ subject: 'owner-test', owner_role: 'ADMIN' });
}

beforeEach(() => {
    delete process.env.JWS_WRITE_FREEZE;
});

describe('homepage artwork rotation', () => {
    it('preserves the legacy priority fallback until an owner publishes a rotation', async () => {
        const t = createHarness();
        await seedArtwork(t, { legacyId: 101, homepageOrder: 100 });
        await seedArtwork(t, { legacyId: 102, homepageOrder: 300 });
        await seedArtwork(t, { legacyId: 103, homepageOrder: 200 });

        const publicArtworks = await t.query(api.artworks.listHomepage, {});
        const ownerRotation = await owner(t).query(api.ownerReads.getHomepageRotation, {});

        expect(publicArtworks.map((artwork) => artwork.legacyId)).toEqual([102, 103, 101]);
        expect(ownerRotation).toEqual({ configured: false, artworkLegacyIds: [102, 103, 101] });
    });

    it('publishes an explicit order and records the owner action', async () => {
        const t = createHarness();
        await seedArtwork(t, { legacyId: 101, homepageOrder: 100 });
        await seedArtwork(t, { legacyId: 102, homepageOrder: 300 });
        await seedArtwork(t, { legacyId: 103, homepageOrder: 200 });

        await owner(t).mutation(api.ownerMutations.setHomepageRotation, { artworkLegacyIds: [101, 103] });

        const publicArtworks = await t.query(api.artworks.listHomepage, {});
        const ownerRotation = await owner(t).query(api.ownerReads.getHomepageRotation, {});
        const auditEvents = await t.run(async (ctx) => ctx.db.query('ownerAuditEvents').collect());

        expect(publicArtworks.map((artwork) => artwork.legacyId)).toEqual([101, 103]);
        expect(ownerRotation).toEqual({ configured: true, artworkLegacyIds: [101, 103] });
        expect(auditEvents).toHaveLength(1);
        expect(auditEvents[0]).toMatchObject({
            actorId: 'owner-test',
            action: 'homepage.rotation_updated',
            entityType: 'homepageRotation',
            entityId: 'primary',
        });
    });

    it('rejects unauthenticated, empty, duplicate, archived, and image-free selections', async () => {
        const t = createHarness();
        await seedArtwork(t, { legacyId: 101 });
        await seedArtwork(t, { legacyId: 102, active: false });
        await seedArtwork(t, { legacyId: 103, withPrimaryImage: false });

        await expect(t.mutation(api.ownerMutations.setHomepageRotation, { artworkLegacyIds: [101] })).rejects.toThrow(
            'Owner access is required',
        );
        await expect(owner(t).mutation(api.ownerMutations.setHomepageRotation, { artworkLegacyIds: [] })).rejects.toThrow('at least one');
        await expect(owner(t).mutation(api.ownerMutations.setHomepageRotation, { artworkLegacyIds: [101, 101] })).rejects.toThrow(
            'only appear once',
        );
        await expect(owner(t).mutation(api.ownerMutations.setHomepageRotation, { artworkLegacyIds: [102] })).rejects.toThrow('archived');
        await expect(owner(t).mutation(api.ownerMutations.setHomepageRotation, { artworkLegacyIds: [103] })).rejects.toThrow(
            'active primary image',
        );
    });

    it('omits a configured artwork if it is later archived', async () => {
        const t = createHarness();
        const firstId = await seedArtwork(t, { legacyId: 101 });
        await seedArtwork(t, { legacyId: 102 });
        await owner(t).mutation(api.ownerMutations.setHomepageRotation, { artworkLegacyIds: [101, 102] });

        await t.run(async (ctx) => ctx.db.patch(firstId, { active: false, updatedAt: Date.now() }));

        const publicArtworks = await t.query(api.artworks.listHomepage, {});
        expect(publicArtworks.map((artwork) => artwork.legacyId)).toEqual([102]);
    });

    it('publishes and returns rotations larger than five artworks', async () => {
        const t = createHarness();
        const artworkLegacyIds = [101, 102, 103, 104, 105, 106];
        for (const legacyId of artworkLegacyIds) {
            await seedArtwork(t, { legacyId, homepageOrder: legacyId });
        }

        await owner(t).mutation(api.ownerMutations.setHomepageRotation, { artworkLegacyIds });

        const publicArtworks = await t.query(api.artworks.listHomepage, {});
        const ownerRotation = await owner(t).query(api.ownerReads.getHomepageRotation, {});

        expect(publicArtworks.map((artwork) => artwork.legacyId)).toEqual(artworkLegacyIds);
        expect(ownerRotation).toEqual({ configured: true, artworkLegacyIds });
    });
});
