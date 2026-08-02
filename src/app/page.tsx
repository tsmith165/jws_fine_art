import type { Metadata } from 'next';
import { ResilientImage as Image } from '@/components/lit-wall/ResilientImage';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ArtworkCard } from '@/components/lit-wall/ArtworkCard';
import { CollectionBrowse } from '@/components/lit-wall/CollectionBrowse';
import { HeroCarousel } from '@/components/lit-wall/HeroCarousel';
import { SectionHeading } from '@/components/lit-wall/SectionHeading';
import { SiteShell } from '@/components/lit-wall/SiteShell';
import { readHomepageArtworks, readPublicArtworks } from '@/data/artworkReads';
import { EDITORIAL_IMAGES } from '@/lib/editorialImages';
import { compareArtworkReleasedNewest } from '@shared/artworkRelease';
import { readPublishedGalleryWalls } from '@/data/galleryWallReads';
import { galleryWallSurfaceStyle, type GalleryWallPresetKey } from '@/lib/galleryWallPresets';

export const metadata: Metadata = {
    title: 'Original paintings by Jill Weeks Smith',
    description:
        'Explore original oil paintings, pastels, and prints inspired by California light and the places Jill Weeks Smith returns to.',
    alternates: { canonical: '/' },
};

export default async function HomePage() {
    const [heroPieces, allPieces, viewingRoomWalls] = await Promise.all([
        readHomepageArtworks(),
        readPublicArtworks(),
        readPublishedGalleryWalls(),
    ]);
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
            {viewingRoomWalls[0] ? (
                <section className={`lw-viewing-room-teaser is-${viewingRoomWalls[0].background.preset} lw-band`}>
                    <div>
                        <span className="lw-eyebrow">Curated gallery</span>
                        <h2>See the work in conversation.</h2>
                        <p>Step into {viewingRoomWalls[0].title}, where Jill’s paintings are arranged together at true relative scale.</p>
                        <Link
                            className="lw-button lw-button-brass"
                            href={`/viewing-room?wall=${encodeURIComponent(viewingRoomWalls[0].slug)}`}
                        >
                            Enter the gallery <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div
                        className="lw-viewing-room-teaser-wall"
                        style={{
                            ...galleryWallSurfaceStyle(viewingRoomWalls[0].background.preset as GalleryWallPresetKey),
                            aspectRatio: `${viewingRoomWalls[0].widthInches} / ${viewingRoomWalls[0].heightInches}`,
                        }}
                    >
                        {viewingRoomWalls[0].placements.slice(0, 6).map((placement) => (
                            <span
                                key={placement.id}
                                style={{
                                    left: `${(placement.centerXInches / viewingRoomWalls[0].widthInches) * 100}%`,
                                    top: `${(placement.centerYInches / viewingRoomWalls[0].heightInches) * 100}%`,
                                    width: `${(placement.artwork.widthInches / viewingRoomWalls[0].widthInches) * 100}%`,
                                    aspectRatio: `${placement.artwork.widthInches} / ${placement.artwork.heightInches}`,
                                }}
                            >
                                <Image src={placement.artwork.imageUrl} alt="" fill quality={95} sizes="20vw" />
                            </span>
                        ))}
                    </div>
                </section>
            ) : null}
            <section className="lw-artist-intro lw-band">
                <div className="lw-artist-photo">
                    <Image
                        src={EDITORIAL_IMAGES.coastalPortraitCamera.src}
                        alt={EDITORIAL_IMAGES.coastalPortraitCamera.alt}
                        fill
                        sizes="(max-width: 760px) 92vw, 38vw"
                        quality={95}
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
