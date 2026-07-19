import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, PackageCheck, ShieldCheck } from 'lucide-react';
import { notFound } from 'next/navigation';
import { ArtworkActions } from '@/components/lit-wall/ArtworkActions';
import { AnalyticsEventOnMount } from '@/components/lit-wall/AnalyticsEvent';
import { ArtworkCard } from '@/components/lit-wall/ArtworkCard';
import { ArtworkMedia } from '@/components/lit-wall/ArtworkMedia';
import { SiteShell } from '@/components/lit-wall/SiteShell';
import { readPublicArtworkBySlug, readPublicArtworks } from '@/data/artworkReads';
import { artworkHref, artworkStatus, dimensions, money, placeLabel } from '@/lib/artwork';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const piece = await readPublicArtworkBySlug((await params).slug);
    if (!piece) return { title: 'Artwork not found' };
    const description = piece.description || `${piece.piece_type || 'Original artwork'} by Jill Weeks Smith. ${dimensions(piece)}.`;
    return {
        title: piece.title,
        description,
        alternates: { canonical: artworkHref(piece) },
        openGraph: {
            title: piece.title,
            description,
            type: 'website',
            images: [{ url: piece.image_path, width: piece.width, height: piece.height, alt: piece.title }],
        },
    };
}

export default async function ArtworkPage({ params }: Props) {
    const piece = await readPublicArtworkBySlug((await params).slug);
    if (!piece) notFound();
    const all = await readPublicArtworks();
    const related = all
        .filter((item) => item.id !== piece.id && (item.theme === piece.theme || item.piece_type === piece.piece_type))
        .slice(0, 3);
    const status = artworkStatus(piece);
    const hasPrice = piece.price > 0 && !piece.sold;
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'VisualArtwork',
        name: piece.title,
        image: [piece.image_path, ...piece.extraImages.map((image) => image.image_path)],
        artMedium: piece.piece_type || undefined,
        width: piece.real_width ? { '@type': 'QuantitativeValue', value: piece.real_width, unitCode: 'INH' } : undefined,
        height: piece.real_height ? { '@type': 'QuantitativeValue', value: piece.real_height, unitCode: 'INH' } : undefined,
        creator: { '@type': 'Person', name: 'Jill Weeks Smith' },
        ...(piece.available && !piece.sold && piece.price > 0
            ? {
                  offers: {
                      '@type': 'Offer',
                      price: piece.price,
                      priceCurrency: 'USD',
                      availability: 'https://schema.org/InStock',
                      url: `https://www.jwsfineart.com${artworkHref(piece)}`,
                  },
              }
            : {}),
    };
    return (
        <SiteShell newsletter>
            <AnalyticsEventOnMount
                event="artwork_viewed"
                oncePerSession={`artwork-viewed:${piece.id}`}
                properties={{
                    artwork_id: piece.id,
                    artwork_slug: piece.slug,
                    availability: status,
                    medium: piece.piece_type,
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll('<', '\\u003c') }}
            />
            <nav className="lw-breadcrumbs" aria-label="Breadcrumb">
                <Link href="/work">
                    <ArrowLeft size={15} /> Work
                </Link>
                <span>/</span>
                <span>{placeLabel(piece)}</span>
                <span>/</span>
                <span aria-current="page">{piece.title}</span>
            </nav>
            <article className="lw-artwork-layout">
                <ArtworkMedia piece={piece} />
                <aside className="lw-artwork-panel">
                    <span className="lw-eyebrow">{placeLabel(piece)}</span>
                    <h1>{piece.title}</h1>
                    <p className="lw-artwork-facts">
                        {piece.piece_type || 'Original artwork'}
                        <br />
                        {dimensions(piece)}
                    </p>
                    {piece.description && <p className="lw-artwork-story">{piece.description}</p>}
                    <div className="lw-price-row">
                        <strong>{hasPrice ? money(piece.price) : status}</strong>
                        <span>{status}</span>
                    </div>
                    <ArtworkActions piece={piece} />
                    <ul className="lw-reassurance">
                        <li>
                            <ShieldCheck size={16} /> Insured shipping
                        </li>
                        <li>
                            <PackageCheck size={16} /> Carefully packed by the studio
                        </li>
                        <li>
                            <Check size={16} /> 30-day returns
                        </li>
                    </ul>
                    <details className="lw-artwork-details" open>
                        <summary>Artwork details</summary>
                        <dl>
                            <div>
                                <dt>Medium</dt>
                                <dd>{piece.piece_type || 'Not recorded'}</dd>
                            </div>
                            <div>
                                <dt>Dimensions</dt>
                                <dd>{dimensions(piece)}</dd>
                            </div>
                            <div>
                                <dt>Framing</dt>
                                <dd>{piece.framed ? 'Framed' : 'Unframed'}</dd>
                            </div>
                            <div>
                                <dt>Status</dt>
                                <dd>{status}</dd>
                            </div>
                        </dl>
                    </details>
                </aside>
            </article>
            {piece.progressImages.length > 0 && (
                <section className="lw-process lw-band">
                    <div>
                        <span className="lw-eyebrow">From the studio</span>
                        <h2>Process and close details.</h2>
                        <p>Supporting views preserve the surface, edges, and moments from the painting’s making.</p>
                    </div>
                    <div className="lw-process-grid">
                        {piece.progressImages.slice(0, 3).map((image, index) => (
                            <Image
                                key={image.id}
                                src={image.image_path}
                                alt={`${piece.title} process view ${index + 1}`}
                                width={image.width || 1}
                                height={image.height || 1}
                                sizes="(max-width: 760px) 92vw, 31vw"
                            />
                        ))}
                    </div>
                </section>
            )}
            {related.length > 0 && (
                <section className="lw-related lw-band lw-band-raised">
                    <header>
                        <div>
                            <span className="lw-eyebrow">Continue looking</span>
                            <h2>More from the studio.</h2>
                        </div>
                        <Link href="/work">
                            View the collection <ArrowRight size={16} />
                        </Link>
                    </header>
                    <div className="lw-art-grid">
                        {related.map((item) => (
                            <ArtworkCard key={item.id} piece={item} />
                        ))}
                    </div>
                </section>
            )}
        </SiteShell>
    );
}

export const revalidate = 300;
