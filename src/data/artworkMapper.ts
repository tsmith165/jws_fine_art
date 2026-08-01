import type { FunctionReturnType } from 'convex/server';
import type { api } from '../../convex/_generated/api';
import type { ExtraImages, PiecesWithImages, ProgressImages } from '@/types/artwork';
import { deriveArtworkCategories, normalizeArtworkCategories } from '@shared/artworkCategories';

export type ConvexPublicArtwork = FunctionReturnType<typeof api.artworks.getPublicByLegacyId>;
type ConvexArtwork = NonNullable<ConvexPublicArtwork>;
type ConvexMedia = ConvexArtwork['media'][number];

function legacyMedia(media: ConvexMedia): ExtraImages | ProgressImages {
    return {
        id: media.legacyId,
        piece_id: 0,
        title: media.title,
        image_path: media.sourceUrl,
        width: media.sourceWidth,
        height: media.sourceHeight,
        small_image_path: media.smallUrl,
        small_width: media.smallWidth,
        small_height: media.smallHeight,
        presentation_crop: media.presentationCrop,
    };
}

export function toLegacyArtwork(artwork: ConvexArtwork): PiecesWithImages {
    const primary = artwork.media.find((media) => media.role === 'primary');
    if (!primary) throw new Error(`Convex artwork ${artwork.legacyId} has no primary image.`);

    const extraImages = artwork.media
        .filter((media) => media.role === 'supporting')
        .map((media) => ({ ...legacyMedia(media), piece_id: artwork.legacyId }) as ExtraImages);
    const progressImages = artwork.media
        .filter((media) => media.role === 'progress')
        .map((media) => ({ ...legacyMedia(media), piece_id: artwork.legacyId }) as ProgressImages);
    const categories = normalizeArtworkCategories(artwork.categories ?? []);

    return {
        slug: artwork.slug,
        id: artwork.legacyId,
        o_id: artwork.legacyGalleryOrder,
        p_id: artwork.legacyHomepagePriority,
        class_name: artwork.className,
        title: artwork.title,
        image_path: primary.sourceUrl,
        primary_media_id: primary.legacyId,
        width: primary.sourceWidth,
        height: primary.sourceHeight,
        small_image_path: primary.smallUrl,
        small_width: primary.smallWidth,
        small_height: primary.smallHeight,
        presentation_crop: primary.presentationCrop,
        price: artwork.priceCents / 100,
        released_at: artwork.releasedAt,
        sold: artwork.sold,
        available: artwork.available,
        description: artwork.description,
        piece_type: artwork.medium,
        instagram: artwork.instagramUrl,
        real_width: artwork.widthInches,
        real_height: artwork.heightInches,
        framed_width: artwork.framedWidthInches ?? null,
        framed_height: artwork.framedHeightInches ?? null,
        framed_dimensions_verified: artwork.framedDimensionsVerified ?? false,
        framed_dimensions_verified_at: artwork.framedDimensionsVerifiedAt ?? null,
        framed_dimensions_estimate_version: artwork.framedDimensionsEstimateVersion ?? null,
        active: artwork.active,
        theme: artwork.theme,
        categories: categories.length ? categories : deriveArtworkCategories({ theme: artwork.theme, medium: artwork.medium }),
        framed: artwork.framed,
        comments: null,
        extraImages,
        progressImages,
    };
}
