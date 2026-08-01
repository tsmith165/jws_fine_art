import { OwnerHeading, OwnerShell } from '@/components/owner/OwnerShell';
import { OwnerTools } from '@/components/owner/OwnerTools';
import { readOwnerArtworksWithMedia } from '@/data/ownerReads';
import { summarizeFramedDimensionReadiness } from '@/lib/framedDimensionAudit';
import { readOwnerGalleryWallDiagnostics } from '@/data/galleryWallReads';

export const dynamic = 'force-dynamic';

export default async function OwnerToolsPage() {
    const [artworks, wallHealth] = await Promise.all([readOwnerArtworksWithMedia(), readOwnerGalleryWallDiagnostics()]);
    const frameReadiness = summarizeFramedDimensionReadiness(artworks);
    return (
        <OwnerShell active="/admin/tools" title="Tools">
            <section className="owner-content">
                <OwnerHeading
                    eyebrow="Site health"
                    title="Tools"
                    description="Observable, owner-only utilities for backups, email verification, and image health. Each operation reports its result before you leave the page."
                />
                <OwnerTools frameReadiness={frameReadiness} wallHealth={wallHealth} />
            </section>
        </OwnerShell>
    );
}
