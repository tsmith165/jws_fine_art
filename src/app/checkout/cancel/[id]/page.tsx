import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { SiteShell } from '@/components/lit-wall/SiteShell';
import { readPublicArtwork } from '@/data/artworkReads';
import { artworkHref } from '@/lib/artwork';

export const metadata: Metadata = { title: 'Checkout paused', robots: { index: false, follow: false } };

export default async function CancelPage({ params }: { params: Promise<{ id: string }> }) {
    const id = Number((await params).id);
    const piece = Number.isSafeInteger(id) ? await readPublicArtwork(id) : null;
    if (!piece) notFound();
    return (
        <SiteShell>
            <section className="lw-purchase-status">
                <div>
                    <Image
                        src={piece.image_path}
                        alt={piece.title}
                        width={piece.width || 1}
                        height={piece.height || 1}
                        sizes="(max-width: 760px) 92vw, 42vw"
                    />
                </div>
                <article>
                    <span className="lw-eyebrow">Checkout paused</span>
                    <h1>{piece.title} is still on the wall.</h1>
                    <p>No payment was taken. You can return to the artwork whenever you are ready, or ask Jill a question first.</p>
                    <Link className="lw-button lw-button-brass" href={artworkHref(piece)}>
                        <ArrowLeft size={16} /> Return to the artwork
                    </Link>
                    <Link className="lw-button lw-button-ghost" href={`/contact?artwork=${piece.id}`}>
                        Ask the studio
                    </Link>
                </article>
            </section>
        </SiteShell>
    );
}

export const dynamic = 'force-dynamic';
