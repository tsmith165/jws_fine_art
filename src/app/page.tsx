import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ArtworkCard } from '@/components/lit-wall/ArtworkCard';
import { HeroCarousel } from '@/components/lit-wall/HeroCarousel';
import { SectionHeading } from '@/components/lit-wall/SectionHeading';
import { SiteShell } from '@/components/lit-wall/SiteShell';
import { readHomepageArtworks, readPublicArtworks } from '@/data/artworkReads';

export const metadata: Metadata = {
    title: 'Original paintings by Jill Weeks Smith',
    description:
        'Explore original oil paintings, pastels, and prints inspired by California light and the places Jill Weeks Smith returns to.',
    alternates: { canonical: '/' },
};

export default async function HomePage() {
    const [heroPieces, allPieces] = await Promise.all([readHomepageArtworks(5), readPublicArtworks()]);
    const available = allPieces.filter((piece) => piece.available && !piece.sold).slice(0, 6);
    const collectionPieces = [
        allPieces.find((piece) => /water|coast/i.test(piece.theme || '')) || allPieces[0],
        allPieces.find((piece) => /snow|mountain/i.test(piece.theme || '')) || allPieces[1],
        allPieces.find((piece) => piece.real_width && piece.real_width <= 10) || allPieces[2],
    ].filter(Boolean);

    return (
        <SiteShell newsletter>
            <HeroCarousel pieces={heroPieces} />
            <section className="lw-home-available lw-band">
                <SectionHeading
                    eyebrow="Available now"
                    title="A few moments from the wall."
                    copy="Small originals and considered works, ready to live with."
                />
                <div className="lw-art-grid lw-art-grid-featured">
                    {available.map((piece, index) => (
                        <ArtworkCard key={piece.id} piece={piece} priority={index < 3} />
                    ))}
                </div>
                <Link className="lw-text-link" href="/work">
                    See all available work <ArrowRight size={16} />
                </Link>
            </section>
            <section className="lw-collections lw-band lw-band-raised">
                <SectionHeading
                    eyebrow="Explore the collection"
                    title="Paintings gathered by place and scale."
                    copy="Browse the full studio catalog through the subjects Jill returns to most often."
                />
                <div className="lw-collection-grid">
                    {collectionPieces.map((piece, index) => {
                        const labels = ['California coast', 'Snow & mountain', 'Small originals'];
                        const themes = ['water', 'snow', 'small'];
                        return (
                            <Link key={piece.id} href={`/work?theme=${themes[index]}`} className="lw-collection-card">
                                <Image src={piece.image_path} alt="" fill sizes="(max-width: 760px) 92vw, 31vw" quality={90} />
                                <span>
                                    {labels[index]} <ArrowRight size={17} />
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </section>
            <section className="lw-artist-intro lw-band">
                <div className="lw-artist-photo">
                    <Image
                        src="/bio/bio_pic_updated_small.jpg"
                        alt="Jill Weeks Smith by the coast"
                        fill
                        sizes="(max-width: 760px) 92vw, 38vw"
                    />
                </div>
                <div>
                    <span className="lw-eyebrow">The artist</span>
                    <h2>Light, texture, and what is often overlooked.</h2>
                    <p>
                        Jill Weeks Smith paints from direct observation and remembered places, building color and atmosphere in oils and
                        answering with the tactile restraint of printmaking.
                    </p>
                    <blockquote>“My work captures moments I can’t let go of, so I can revisit often and bring others with me.”</blockquote>
                    <Link className="lw-button lw-button-ghost" href="/studio">
                        Meet Jill <ArrowRight size={16} />
                    </Link>
                </div>
            </section>
        </SiteShell>
    );
}

export const revalidate = 300;
