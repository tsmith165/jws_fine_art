import { releaseDateValue } from '../../shared/artworkRelease';
import type { PiecesWithImages } from '../types/artwork';
import { artworkSourceQuality } from './imageLoading';
import { validateOwnerArtwork, type OwnerArtworkField } from './ownerArtworkValidation';

export type OwnerArtworkAttentionKind = 'image' | 'metadata' | 'category';

export type OwnerArtworkAttentionIssue = {
    id: string;
    kind: OwnerArtworkAttentionKind;
    tone: 'error' | 'warning';
    label: string;
    detail: string;
    editorAnchor?: string;
};

const fieldLabels: Record<OwnerArtworkField, string> = {
    piece_title: 'Artwork title',
    piece_type: 'Medium',
    released_at: 'Release date',
    price: 'Price',
    real_width: 'Artwork width',
    real_height: 'Artwork height',
    description: 'Artwork story',
    categories: 'Collection categories',
    instagram: 'Instagram share reference',
};

const editorAnchors: Partial<Record<OwnerArtworkField, string>> = {
    piece_title: 'artwork-title',
    piece_type: 'artwork-medium',
    released_at: 'artwork-release-date',
    price: 'artwork-price',
    real_width: 'artwork-width',
    real_height: 'artwork-height',
    description: 'artwork-story',
    instagram: 'artwork-instagram',
};

function mediaAttentionIssues(piece: PiecesWithImages): OwnerArtworkAttentionIssue[] {
    const media = [
        { id: `primary-${piece.id}`, label: 'Primary image', width: piece.width, height: piece.height },
        ...piece.extraImages.map((image, index) => ({
            id: `supporting-${image.id}`,
            label: image.title || `Supporting image ${index + 1}`,
            width: image.width,
            height: image.height,
        })),
        ...piece.progressImages.map((image, index) => ({
            id: `process-${image.id}`,
            label: image.title || `Process image ${index + 1}`,
            width: image.width,
            height: image.height,
        })),
    ];

    return media.flatMap((image) => {
        const quality = artworkSourceQuality(image.width, image.height);
        if (quality.ready) return [];
        return [
            {
                id: image.id,
                kind: 'image' as const,
                tone: 'warning' as const,
                label: `${image.label} needs a larger original`,
                detail: quality.detail,
            },
        ];
    });
}

export function artworkReleaseDateNeedsReview(piece: Pick<PiecesWithImages, 'completed_at' | 'released_at'>): boolean {
    const completedDate = releaseDateValue(piece.completed_at);
    return Boolean(completedDate && completedDate === releaseDateValue(piece.released_at));
}

export function ownerArtworkAttention(piece: PiecesWithImages): OwnerArtworkAttentionIssue[] {
    const validation = validateOwnerArtwork({
        piece_title: piece.title,
        piece_type: piece.piece_type ?? '',
        released_at: releaseDateValue(piece.released_at),
        price: piece.price > 0 ? String(piece.price) : '',
        real_width: piece.real_width ? String(piece.real_width) : '',
        real_height: piece.real_height ? String(piece.real_height) : '',
        description: piece.description ?? '',
        categories: piece.categories,
        instagram: piece.instagram ?? '',
        available: Boolean(piece.available),
        sold: Boolean(piece.sold),
    });

    const metadataIssues = validation.issues
        .filter((issue) => issue.field !== 'categories')
        .map((issue) => ({
            id: `metadata-${issue.field}`,
            kind: 'metadata' as const,
            tone: issue.tone,
            label: fieldLabels[issue.field],
            detail: issue.message,
            editorAnchor: editorAnchors[issue.field],
        }));
    if (artworkReleaseDateNeedsReview(piece) && !validation.byField.has('released_at')) {
        metadataIssues.push({
            id: 'metadata-released_at-unreviewed',
            kind: 'metadata',
            tone: 'warning',
            label: 'Release date needs review',
            detail: 'This date still matches the provisional completion-date baseline. Confirm when collectors first saw the work.',
            editorAnchor: 'artwork-release-date',
        });
    }

    const categoryIssues: OwnerArtworkAttentionIssue[] = piece.categories.length
        ? []
        : [
              {
                  id: 'category-missing',
                  kind: 'category',
                  tone: 'warning',
                  label: 'Collection category missing',
                  detail: 'Choose at least one collection so this artwork is easier to find.',
              },
          ];

    return [...mediaAttentionIssues(piece), ...metadataIssues, ...categoryIssues];
}
