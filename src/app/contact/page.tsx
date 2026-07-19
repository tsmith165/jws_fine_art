import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Mail, MapPin } from 'lucide-react';
import { InquiryForm } from '@/components/lit-wall/InquiryForm';
import { SiteShell } from '@/components/lit-wall/SiteShell';
import { readPublicArtwork } from '@/data/artworkReads';

export const metadata: Metadata = {
    title: 'Contact & Collector Guide',
    description: 'Contact Jill Weeks Smith about artwork, commissions, shipping, or studio questions.',
    alternates: { canonical: '/contact' },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ artwork?: string; kind?: string }> }) {
    const params = await searchParams;
    const artworkId = Number(params.artwork);
    const piece = Number.isSafeInteger(artworkId) ? await readPublicArtwork(artworkId) : null;
    const kind = params.kind === 'commission' ? 'commission' : piece ? 'artwork' : 'general';
    return (
        <SiteShell>
            <section className="lw-contact-hero lw-band">
                <div>
                    <span className="lw-eyebrow">Contact the studio</span>
                    <h1>Start with what caught your eye.</h1>
                    <p>
                        Ask about an artwork, a commission, studio visits, shipping, or press requests. Jill usually replies within two
                        business days.
                    </p>
                    <ul>
                        <li>
                            <Mail size={16} />
                            <a href="mailto:jwsfineart@gmail.com">jwsfineart@gmail.com</a>
                        </li>
                        <li>
                            <MapPin size={16} /> San Diego, California
                        </li>
                        <li>
                            <Instagram size={16} />
                            <Link href="https://www.instagram.com/jws_fineart/" target="_blank">
                                @jws_fineart
                            </Link>
                        </li>
                    </ul>
                </div>
                <InquiryForm artworkId={piece?.id} artworkTitle={piece?.title} kind={kind} sourcePath="/contact" />
            </section>
            <section id="collector-guide" className="lw-collector-guide lw-band lw-band-raised">
                <div className="lw-guide-image">
                    <Image src="/bio/bio_pic_updated_small.jpg" alt="Jill Weeks Smith" fill sizes="(max-width: 760px) 92vw, 40vw" />
                </div>
                <div>
                    <span className="lw-eyebrow">Collector guide</span>
                    <h2>What happens after you find a work.</h2>
                    <details open>
                        <summary>Buying an available painting</summary>
                        <p>
                            Available priced works can be purchased securely through Stripe. The studio confirms packing and shipping after
                            payment.
                        </p>
                    </details>
                    <details id="shipping">
                        <summary>Shipping</summary>
                        <p>
                            Artwork is packed by the studio and shipped insured. Contact the studio before purchasing if you need a shipping
                            estimate or have specific delivery requirements.
                        </p>
                    </details>
                    <details>
                        <summary>Seeing more detail</summary>
                        <p>
                            Use the image gallery on each artwork page for close views, or ask Jill for any additional photographs you need.
                        </p>
                    </details>
                    <details>
                        <summary>Commissions</summary>
                        <p>Commission scope, timing, and price are agreed in writing before a deposit is requested.</p>
                    </details>
                </div>
            </section>
        </SiteShell>
    );
}
