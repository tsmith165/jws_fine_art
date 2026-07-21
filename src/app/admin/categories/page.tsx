import { OwnerQuickCategorizer } from '@/components/owner/OwnerQuickCategorizer';
import { OwnerHeading, OwnerShell } from '@/components/owner/OwnerShell';
import { readOwnerArtworksWithMedia } from '@/data/ownerReads';
import { filterCategorizerArtworks } from '@/lib/ownerArtworkFilters';

export const dynamic = 'force-dynamic';

export default async function OwnerCategoriesPage() {
    const artworks = filterCategorizerArtworks(await readOwnerArtworksWithMedia()).sort(
        (a, b) => a.o_id - b.o_id || a.title.localeCompare(b.title),
    );

    return (
        <OwnerShell active="/admin/categories" title="Quick categorize">
            <section className="owner-content owner-categorizer-content">
                <OwnerHeading
                    eyebrow="Catalog workflow"
                    title="Quick categorize"
                    description="Review each artwork at full size and keep the collection taxonomy consistent."
                />
                <OwnerQuickCategorizer initialArtworks={artworks} />
            </section>
        </OwnerShell>
    );
}
