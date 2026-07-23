import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ArtworkCard } from '@/components/lit-wall/ArtworkCard';
import { CollectionBrowse } from '@/components/lit-wall/CollectionBrowse';
import { HeroCarousel } from '@/components/lit-wall/HeroCarousel';
import { SectionHeading } from '@/components/lit-wall/SectionHeading';
import { SiteShell } from '@/components/lit-wall/SiteShell';
import { readHomepageArtworks, readPublicArtworks } from '@/data/artworkReads';
import { compareArtworkReleasedNewest } from '@shared/artworkRelease';

export const metadata: Metadata = {
    title: 'Original paintings by Jill Weeks Smith',
    description:
        'Explore original oil paintings, pastels, and prints inspired by California light and the places Jill Weeks Smith returns to.',
    alternates: { canonical: '/' },
};

export default async function HomePage() {
    const [heroPieces, allPieces] = await Promise.all([readHomepageArtworks(), readPublicArtworks()]);
    const available = allPieces
        .filter((piece) => piece.available && !piece.sold)
        .sort(compareArtworkReleasedNewest)
        .slice(0, 6);

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
                    {available.map((piece) => (
                        <ArtworkCard key={piece.id} piece={piece} />
                    ))}
                </div>
                <Link className="lw-text-link" href="/work?availability=available">
                    See all available work <ArrowRight size={16} />
                </Link>
            </section>
            <CollectionBrowse pieces={allPieces} />
            <section className="lw-artist-intro lw-band">
                <div className="lw-artist-photo">
                    <Image
                        src="/bio/jill-weeks-smith-portrait.jpg"
                        alt="Jill Weeks Smith by the coast"
                        fill
                        sizes="(max-width: 760px) 92vw, 38vw"
                    />
                </div>
                <div>
                    <span className="lw-eyebrow">The artist</span>
                    <h2>Light, texture, and what is often overlooked.</h2>
                    <p>
                        Jill Weeks Smith paints in oils from observation and remembered places, drawn to the light, color, and atmosphere
                        that make a place worth returning to.
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

export const dynamic = 'force-dynamic';
