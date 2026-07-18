import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { OwnerArtworkEditor } from '@/components/owner/OwnerArtworkEditor';
import { OwnerShell } from '@/components/owner/OwnerShell';
import { readOwnerArtworksWithMedia } from '@/data/ownerReads';

export const metadata: Metadata = { title: 'Artwork editor · JWS Fine Art' };
export const dynamic = 'force-dynamic';

export default async function OwnerArtworkEditorPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
    const artworks = (await readOwnerArtworksWithMedia()).sort((a, b) => a.o_id - b.o_id || a.id - b.id);
    if (!artworks.length) redirect('/admin/edit/new');
    const requested = Number((await searchParams).id);
    const index = Math.max(
        0,
        artworks.findIndex((artwork) => artwork.id === requested),
    );
    const piece = artworks[index] || artworks[0];
    if (!requested || requested !== piece.id) redirect(`/admin/edit?id=${piece.id}`);
    const previousId = artworks[(index - 1 + artworks.length) % artworks.length].id;
    const nextId = artworks[(index + 1) % artworks.length].id;
    return (
        <OwnerShell active="/admin/artwork" title="Artwork editor">
            <OwnerArtworkEditor piece={piece} previousId={previousId} nextId={nextId} />
        </OwnerShell>
    );
}
