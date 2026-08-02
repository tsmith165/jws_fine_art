import { OwnerGalleryWallManager } from '@/components/owner/OwnerGalleryWallManager';
import { OwnerHeading, OwnerShell } from '@/components/owner/OwnerShell';
import { readOwnerGalleryWalls } from '@/data/galleryWallReads';
import { readOwnerArtworksWithMedia } from '@/data/ownerReads';

export const dynamic = 'force-dynamic';

export default async function OwnerWallsPage() {
    const [walls, artworks] = await Promise.all([readOwnerGalleryWalls(), readOwnerArtworksWithMedia()]);
    return (
        <OwnerShell active="/admin/walls" title="Gallery">
            <section className="owner-content owner-walls-content">
                <OwnerHeading
                    eyebrow="Curated presentation"
                    title="Gallery"
                    description="Compose true-to-scale gallery walls, preview the collector experience, and publish only when the arrangement is ready."
                />
                <OwnerGalleryWallManager initialWalls={walls} artworks={artworks.filter((artwork) => artwork.active)} />
            </section>
        </OwnerShell>
    );
}
