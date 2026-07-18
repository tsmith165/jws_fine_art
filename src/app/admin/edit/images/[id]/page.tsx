import type { Metadata } from 'next';
import ImageEditor from './ImageEditor';
import { OwnerHeading, OwnerShell } from '@/components/owner/OwnerShell';

export const metadata: Metadata = { title: 'Artwork media · JWS Fine Art' };
export const dynamic = 'force-dynamic';

export default async function OwnerMediaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <OwnerShell active="/admin/artwork" title="Artwork media">
            <section className="owner-content">
                <OwnerHeading
                    eyebrow="Media library"
                    title="Add artwork images"
                    description="Upload the untouched original, identify its role, and review its dimensions before it joins the artwork record."
                />
                <ImageEditor pieceId={id} />
            </section>
        </OwnerShell>
    );
}
