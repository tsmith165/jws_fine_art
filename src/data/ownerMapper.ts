import type { FunctionReturnType } from 'convex/server';
import type { api } from '../../convex/_generated/api';
import type { ExtraImages, Pieces, PiecesWithImages, ProgressImages, VerifiedTransactions } from '@/db/schema';

export type ConvexOwnerArtwork = FunctionReturnType<typeof api.ownerReads.listArtworks>[number];
export type ConvexOwnerTransaction = FunctionReturnType<typeof api.ownerReads.listLegacyVerifiedTransactions>[number];

export function ownerArtworkToLegacy(artwork: ConvexOwnerArtwork): Pieces {
    const primary = artwork.media.find((media) => media.role === 'primary');
    if (!primary) throw new Error(`Convex artwork ${artwork.legacyId} has no primary image.`);
    return {
        id: artwork.legacyId,
        o_id: artwork.legacyGalleryOrder,
        p_id: artwork.legacyHomepagePriority,
        class_name: artwork.className,
        title: artwork.title,
        image_path: primary.sourceUrl,
        width: primary.sourceWidth,
        height: primary.sourceHeight,
        small_image_path: primary.smallUrl,
        small_width: primary.smallWidth,
        small_height: primary.smallHeight,
        price: artwork.priceCents / 100,
        sold: artwork.sold,
        available: artwork.available,
        description: artwork.description,
        piece_type: artwork.medium,
        instagram: artwork.instagramUrl,
        real_width: artwork.widthInches,
        real_height: artwork.heightInches,
        active: artwork.active,
        theme: artwork.theme,
        framed: artwork.framed,
        comments: artwork.ownerNotes,
    };
}

export function ownerArtworkWithMediaToLegacy(artwork: ConvexOwnerArtwork): PiecesWithImages {
    const piece = ownerArtworkToLegacy(artwork);
    const media = artwork.media.filter((item) => item.role !== 'primary');
    const legacyMedia = (item: (typeof media)[number]) => ({
        id: item.legacyId,
        piece_id: artwork.legacyId,
        title: item.title,
        image_path: item.sourceUrl,
        width: item.sourceWidth,
        height: item.sourceHeight,
        small_image_path: item.smallUrl,
        small_width: item.smallWidth,
        small_height: item.smallHeight,
    });
    return {
        ...piece,
        extraImages: media.filter((item) => item.role === 'supporting').map((item) => legacyMedia(item) as ExtraImages),
        progressImages: media.filter((item) => item.role === 'progress').map((item) => legacyMedia(item) as ProgressImages),
    };
}

export function ownerTransactionToLegacy(transaction: ConvexOwnerTransaction): VerifiedTransactions {
    return {
        id: transaction.legacyId,
        piece_db_id: transaction.pieceLegacyId,
        piece_title: transaction.pieceTitle,
        full_name: transaction.fullName,
        phone: transaction.phone,
        email: transaction.email,
        address: transaction.address,
        international: transaction.international,
        image_path: transaction.imagePath,
        image_width: transaction.imageWidth,
        image_height: transaction.imageHeight,
        date: transaction.purchasedOn,
        stripe_id: transaction.stripeId,
        price: transaction.price,
    };
}
