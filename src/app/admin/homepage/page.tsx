import { OwnerHomepageRotation } from '@/components/owner/OwnerHomepageRotation';
import { OwnerHeading, OwnerShell } from '@/components/owner/OwnerShell';
import { readOwnerArtworks, readOwnerHomepageRotation } from '@/data/ownerReads';

export const dynamic = 'force-dynamic';

export default async function OwnerHomepagePage() {
    const [artworks, rotation] = await Promise.all([readOwnerArtworks('gallery'), readOwnerHomepageRotation()]);

    return (
        <OwnerShell active="/admin/homepage" title="Homepage">
            <section className="owner-content">
                <OwnerHeading
                    eyebrow="Public site"
                    title="Homepage rotation"
                    description="Choose and order up to five artworks for the opening slideshow. Changes publish without a redeploy."
                />
                <OwnerHomepageRotation artworks={artworks} initialSelectedIds={rotation.artworkLegacyIds} />
            </section>
        </OwnerShell>
    );
}
