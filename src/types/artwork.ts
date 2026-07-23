export interface ArtworkImage {
    id: number;
    piece_id: number;
    title: string | null;
    image_path: string;
    width: number;
    height: number;
    small_image_path: string | null;
    small_width: number | null;
    small_height: number | null;
}

export type ExtraImages = ArtworkImage;
export type ProgressImages = ArtworkImage;

export interface Pieces {
    id: number;
    o_id: number;
    p_id: number;
    class_name: string;
    title: string;
    image_path: string;
    width: number;
    height: number;
    small_image_path: string | null;
    small_width: number | null;
    small_height: number | null;
    price: number;
    released_at: number | null;
    sold: boolean | null;
    available: boolean | null;
    description: string | null;
    piece_type: string | null;
    instagram: string | null;
    real_width: number | null;
    real_height: number | null;
    active: boolean | null;
    theme: string | null;
    categories: ArtworkCategoryId[];
    framed: boolean | null;
    comments: string | null;
}

export interface VerifiedTransactions {
    id: number;
    piece_db_id: number;
    piece_title: string;
    full_name: string;
    phone: string;
    email: string;
    address: string;
    international: boolean | null;
    image_path: string;
    image_width: number;
    image_height: number;
    date: string;
    stripe_id: string;
    price: number;
}

export type PiecesWithImages = Pieces & {
    slug?: string;
    extraImages: ExtraImages[];
    progressImages: ProgressImages[];
    next_id?: number;
    last_id?: number;
};
import type { ArtworkCategoryId } from '@shared/artworkCategories';
