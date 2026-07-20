import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { deriveArtworkCategories, type ArtworkCategoryId } from '@shared/artworkCategories';
import type { PiecesWithImages } from '@/types/artwork';
import { SectionHeading } from './SectionHeading';

const collectionDefinitions = [
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
];

function buildCollectionCards(pieces: PiecesWithImages[]) {
    const selectedIds = new Set<number>();
    const selectedImages = new Set<string>();

    return collectionDefinitions
        .map((definition) => {
            const isUnused = (candidate: PiecesWithImages) =>
                !selectedIds.has(candidate.id) && !selectedImages.has(candidate.image_path);
            const piece =
                pieces.find((candidate) => isUnused(candidate) && candidate.title === definition.preferredTitle) ||
                pieces.find((candidate) => {
                    const categories = candidate.categories.length
                        ? candidate.categories
                        : deriveArtworkCategories({ theme: candidate.theme, medium: candidate.piece_type });
                    return isUnused(candidate) && categories.includes(definition.category);
                }) ||
                pieces.find(isUnused);

            if (!piece) return null;
            selectedIds.add(piece.id);
            selectedImages.add(piece.image_path);
            return { ...definition, piece };
        })
        .filter((card): card is NonNullable<typeof card> => Boolean(card));
}

export function CollectionBrowse({ pieces }: { pieces: PiecesWithImages[] }) {
    const cards = buildCollectionCards(pieces);

    if (!cards.length) return null;

    return (
        <section className="lw-collections lw-band lw-band-raised">
            <SectionHeading
                eyebrow="Explore the collection"
                title="Explore the collection from the shoreline to the summit."
                copy="Browse the full studio catalog through the subjects Jill returns to most often."
            />
            <div className="lw-collection-grid">
                {cards.map(({ label, category, piece }) => (
                    <Link key={category} href={`/work?category=${category}`} className="lw-collection-card">
                        <Image src={piece.image_path} alt="" fill sizes="(max-width: 760px) 92vw, 31vw" quality={90} />
                        <span>
                            {label} <ArrowRight size={17} />
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
