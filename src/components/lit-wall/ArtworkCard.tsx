import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { PiecesWithImages } from '@/db/schema';
import { artworkHref, artworkStatus, dimensions, imageSource, money } from '@/lib/artwork';

export function ArtworkCard({ piece, priority = false }: { piece: PiecesWithImages; priority?: boolean }) {
    const status = artworkStatus(piece);
    return (
        <Link className="lw-art-card" href={artworkHref(piece)}>
            <span className="lw-art-card-image">
                <Image
                    src={imageSource(piece, true)}
                    alt={piece.title}
                    width={piece.small_width || piece.width}
                    height={piece.small_height || piece.height}
                    sizes="(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 31vw"
                    quality={90}
                    priority={priority}
                />
                <span className="lw-art-card-open">
                    <ArrowUpRight size={16} /> View work
                </span>
            </span>
            <span className="lw-art-card-meta">
                <span>
                    <strong>{piece.title}</strong>
                    <em>{piece.available && !piece.sold && piece.price > 0 ? money(piece.price) : status}</em>
                </span>
                <small>
                    {piece.piece_type || 'Original artwork'} · {dimensions(piece)}
                </small>
            </span>
        </Link>
    );
}
