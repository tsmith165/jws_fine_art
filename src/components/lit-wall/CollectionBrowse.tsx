import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { deriveArtworkCategories, type ArtworkCategoryId } from '@shared/artworkCategories';
import type { PiecesWithImages } from '@/types/artwork';
import { CATALOG_ARTWORK_IMAGE_POLICY } from '@/lib/imageLoading';
import { SectionHeading } from './SectionHeading';
import { ProgressiveArtworkImage } from './ProgressiveArtworkImage';

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
            const isUnused = (candidate: PiecesWithImages) => !selectedIds.has(candidate.id) && !selectedImages.has(candidate.image_path);
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
                        <ProgressiveArtworkImage
                            src={piece.image_path}
                            placeholderSrc={piece.small_image_path}
                            alt=""
                            sizes={CATALOG_ARTWORK_IMAGE_POLICY.sizes}
                            quality={CATALOG_ARTWORK_IMAGE_POLICY.quality}
                        />
                        <span className="lw-collection-card-label">
                            {label} <ArrowRight size={17} />
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
