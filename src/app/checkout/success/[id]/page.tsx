import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { SiteShell } from '@/components/lit-wall/SiteShell';
import { readPublicArtwork } from '@/data/artworkReads';

export const metadata: Metadata = { title: 'Purchase received', robots: { index: false, follow: false } };

export default async function SuccessPage({ params }: { params: Promise<{ id: string }> }) {
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
                    <CheckCircle2 size={36} />
                    <span className="lw-eyebrow">Purchase received</span>
                    <h1>Thank you for collecting {piece.title}.</h1>
                    <p>A receipt is on its way to your email. Jill will follow up with packing and insured shipping details.</p>
                    <p>
                        Questions? Email <a href="mailto:jwsfineart@gmail.com">jwsfineart@gmail.com</a>.
                    </p>
                    <Link className="lw-button lw-button-brass" href="/work">
                        Continue through the collection <ArrowRight size={16} />
                    </Link>
                </article>
            </section>
        </SiteShell>
    );
}

export const dynamic = 'force-dynamic';
