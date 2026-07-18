import { notFound, permanentRedirect } from 'next/navigation';
import { readPublicArtwork } from '@/data/artworkReads';
import { artworkHref } from '@/lib/artwork';

export default async function LegacyArtworkRedirect({ params }: { params: Promise<{ id: string }> }) {
    const id = Number((await params).id);
    const piece = Number.isSafeInteger(id) ? await readPublicArtwork(id) : null;
    if (!piece) notFound();
    permanentRedirect(artworkHref(piece));
}
