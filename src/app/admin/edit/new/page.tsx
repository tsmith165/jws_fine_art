import type { Metadata } from 'next';
import CreatePiece from './CreatePiece';
import { OwnerHeading, OwnerShell } from '@/components/owner/OwnerShell';

export const metadata: Metadata = { title: 'New artwork · JWS Fine Art' };
export const dynamic = 'force-dynamic';

export default function NewPiecePage() {
    return (
        <OwnerShell active="/admin/artwork" title="New artwork">
            <section className="owner-content">
                <OwnerHeading
                    eyebrow="New catalog record"
                    title="Add artwork"
                    description="Start with the highest-quality original. The image is preserved as uploaded, then presentation variants are generated at delivery time."
                />
                <CreatePiece />
            </section>
        </OwnerShell>
    );
}
