import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ArtworkCard } from '@/components/lit-wall/ArtworkCard';
import { HeroCarousel } from '@/components/lit-wall/HeroCarousel';
import { SectionHeading } from '@/components/lit-wall/SectionHeading';
import { SiteShell } from '@/components/lit-wall/SiteShell';
import { readHomepageArtworks, readPublicArtworks } from '@/data/artworkReads';
import { deriveArtworkCategories, type ArtworkCategoryId } from '@shared/artworkCategories';

export const metadata: Metadata = {
    title: 'Original paintings by Jill Weeks Smith',
    description:
        'Explore original oil paintings, pastels, and prints inspired by California light and the places Jill Weeks Smith returns to.',
    alternates: { canonical: '/' },
};

export default async function HomePage() {
    const [heroPieces, allPieces] = await Promise.all([readHomepageArtworks(5), readPublicArtworks()]);
    const available = allPieces.filter((piece) => piece.available && !piece.sold).slice(0, 6);
    const selectedCollectionIds = new Set<number>();
    const selectedCollectionImages = new Set<string>();
    const collectionCards = [
        {
            label: 'Coastal',
            category: 'coastal' as ArtworkCategoryId,
            preferredTitle: 'Solana Beach',
        },
        {
            label: 'Mountain',
            category: 'mountain' as ArtworkCategoryId,
            preferredTitle: 'Northstar Upper Main',
        },
        {
            label: 'Urban',
            category: 'urban' as ArtworkCategoryId,
            preferredTitle: 'Pacific Beach Nocturne',
        },
    ]
        .map((card) => {
            const isUnused = (candidate: (typeof allPieces)[number]) =>
                !selectedCollectionIds.has(candidate.id) && !selectedCollectionImages.has(candidate.image_path);
            const piece =
                allPieces.find((candidate) => isUnused(candidate) && candidate.title === card.preferredTitle) ||
                allPieces.find((candidate) => {
                    const categories = candidate.categories.length
                        ? candidate.categories
                        : deriveArtworkCategories({ theme: candidate.theme, medium: candidate.piece_type });
                    return isUnused(candidate) && categories.includes(card.category);
                }) ||
                allPieces.find(isUnused);
            if (piece) {
                selectedCollectionIds.add(piece.id);
                selectedCollectionImages.add(piece.image_path);
            }
            return piece ? { ...card, piece } : null;
        })
        .filter((card): card is NonNullable<typeof card> => Boolean(card));

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
                <Link className="lw-text-link" href="/work?availability=available">
                    See all available work <ArrowRight size={16} />
                </Link>
            </section>
            <section className="lw-collections lw-band lw-band-raised">
                <SectionHeading
                    eyebrow="Explore the collection"
                    title="Explore the collection from the shoreline to the summit."
                    copy="Browse the full studio catalog through the subjects Jill returns to most often."
                />
                <div className="lw-collection-grid">
                    {collectionCards.map(({ label, category, piece }) => {
                        return (
                            <Link key={category} href={`/work?category=${category}`} className="lw-collection-card">
                                <Image src={piece.image_path} alt="" fill sizes="(max-width: 760px) 92vw, 31vw" quality={90} />
                                <span>
                                    {label} <ArrowRight size={17} />
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </section>
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

export const revalidate = 300;
