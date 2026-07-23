import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import { notFound, redirect } from 'next/navigation';
import CheckoutForm from './CheckoutForm';
import { SiteShell } from '@/components/lit-wall/SiteShell';
import { readPublicArtwork } from '@/data/artworkReads';
import { artworkHref, dimensions, isPurchasable, money } from '@/lib/artwork';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false, follow: false } };

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
    const id = Number((await params).id);
    const piece = Number.isSafeInteger(id) ? await readPublicArtwork(id) : null;
    if (!piece) notFound();
    if (!isPurchasable(piece)) redirect(artworkHref(piece));
    return (
        <SiteShell>
            <nav className="lw-checkout-back">
                <Link href={artworkHref(piece)}>
                    <ArrowLeft size={16} /> Back to {piece.title}
                </Link>
            </nav>
            <section className="lw-checkout-layout">
                <aside className="lw-checkout-piece">
                    <div className="lw-checkout-artwork-image">
                        <Image
                            src={piece.image_path}
                            alt={piece.title}
                            width={piece.width || 1}
                            height={piece.height || 1}
                            sizes="(max-width: 800px) 92vw, 42vw"
                            priority
                            quality={90}
                        />
                    </div>
                    <span className="lw-eyebrow">Original artwork</span>
                    <h1>{piece.title}</h1>
                    <p>
                        {piece.piece_type || 'Original artwork'} · {dimensions(piece)}
                    </p>
                    <strong>{money(piece.price)}</strong>
                    <p className="lw-checkout-piece-note">The artwork is reserved for 30 minutes after secure checkout opens.</p>
                </aside>
                <div className="lw-checkout-panel">
                    <ol className="lw-checkout-progress" aria-label="Checkout progress">
                        <li className="is-complete">
                            <Check size={13} /> Artwork
                        </li>
                        <li aria-current="step">
                            <span>2</span> Delivery
                        </li>
                        <li>
                            <span>3</span> Payment
                        </li>
                    </ol>
                    <span className="lw-eyebrow">Secure checkout</span>
                    <h2>Choose how the artwork gets to you.</h2>
                    <p>
                        Select fixed insured U.S. shipping or free local pickup. Stripe collects any delivery address securely, and sales
                        tax is included where applicable.
                    </p>
                    <CheckoutForm current_piece={piece} />
                </div>
            </section>
        </SiteShell>
    );
}

export const dynamic = 'force-dynamic';
