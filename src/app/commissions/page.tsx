import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { SiteShell } from '@/components/lit-wall/SiteShell';
import { readPublicArtworks } from '@/data/artworkReads';

export const metadata: Metadata = {
    title: 'Commissions',
    description: 'Commission an original meaningful-place painting by Jill Weeks Smith.',
    alternates: { canonical: '/commissions' },
};

export default async function CommissionsPage() {
    const pieces = await readPublicArtworks();
    const hero = pieces.find((piece) => /house|home|building/i.test(`${piece.theme} ${piece.title}`)) || pieces[0];
    return (
        <SiteShell newsletter>
            <section className="lw-commission-hero">
                <div>
                    <span className="lw-eyebrow">Commissioned originals</span>
                    <h1>The place you can&apos;t stop thinking about becomes a painting you keep forever.</h1>
                    <p>Connect with Jill as she accepts a small number of commissions each season.</p>
                    <Link className="lw-button lw-button-brass" href="/contact?kind=commission">
                        Start a conversation <ArrowRight size={16} />
                    </Link>
                </div>
                {hero && (
                    <div>
                        <Image src={hero.image_path} alt={hero.title} fill sizes="(max-width: 760px) 100vw, 55vw" priority quality={90} />
                    </div>
                )}
            </section>
            <section className="lw-commission-process lw-band">
                <header>
                    <span className="lw-eyebrow">The process</span>
                    <h2>Clear steps, with room for conversation.</h2>
                </header>
                <ol>
                    <li>
                        <span>1</span>
                        <div>
                            <h3>Share the story</h3>
                            <p>Send photographs, dimensions, timing, and what you want the painting to hold.</p>
                        </div>
                    </li>
                    <li>
                        <span>2</span>
                        <div>
                            <h3>Agree on scope</h3>
                            <p>Jill confirms the composition, size, price, and estimated completion date before work begins.</p>
                        </div>
                    </li>
                    <li>
                        <span>3</span>
                        <div>
                            <h3>Paint and review</h3>
                            <p>You receive a progress update and a considered opportunity for feedback.</p>
                        </div>
                    </li>
                    <li>
                        <span>4</span>
                        <div>
                            <h3>Finish and deliver</h3>
                            <p>The work is signed, allowed to cure, carefully packed, and shipped insured.</p>
                        </div>
                    </li>
                </ol>
            </section>
            <section className="lw-commission-notes lw-band lw-band-raised">
                <div>
                    <span className="lw-eyebrow">Before we begin</span>
                    <h2>A few useful details.</h2>
                </div>
                <div className="lw-commission-notes-body">
                    <ul>
                        <li>
                            <Check size={16} /> Availability varies by season and requested size.
                        </li>
                        <li>
                            <Check size={16} /> Final pricing is confirmed before a deposit is requested.
                        </li>
                        <li>
                            <Check size={16} /> Strong reference images help preserve the character of the subject.
                        </li>
                    </ul>
                    <Link className="lw-button lw-button-brass" href="/contact?kind=commission">
                        Ask about a commission <ArrowRight size={16} />
                    </Link>
                </div>
            </section>
        </SiteShell>
    );
}
