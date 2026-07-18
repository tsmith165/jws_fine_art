import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Check, PackageCheck, ShieldCheck } from 'lucide-react';
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
                    <div>
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
                </aside>
                <div className="lw-checkout-panel">
                    <span className="lw-eyebrow">Secure checkout</span>
                    <h2>Where should the artwork go?</h2>
                    <p>Enter your contact and shipping details. You will review the final amount before paying on Stripe.</p>
                    <CheckoutForm current_piece={piece} />
                    <ul>
                        <li>
                            <ShieldCheck size={16} /> Insured shipping
                        </li>
                        <li>
                            <PackageCheck size={16} /> Packed by Jill’s studio
                        </li>
                        <li>
                            <Check size={16} /> 30-day returns
                        </li>
                    </ul>
                </div>
            </section>
        </SiteShell>
    );
}

export const dynamic = 'force-dynamic';
