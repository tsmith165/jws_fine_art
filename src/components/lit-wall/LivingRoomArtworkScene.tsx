import { useMemo } from 'react';
import type { PiecesWithImages } from '@/types/artwork';
import { artworkScaleDimensions } from '@/lib/artwork';
import { getLivingRoomPlacement, LIVING_ROOM_SCALE } from '@/lib/roomScale';
import { ResilientImage } from './ResilientImage';
import { ArtworkPresentationImage } from './ArtworkPresentationImage';

export function LivingRoomArtworkScene({
    piece,
    className,
    priority = false,
    artworkSizes = '20vw',
}: {
    piece: PiecesWithImages;
    className?: string;
    priority?: boolean;
    artworkSizes?: string;
}) {
    const scale = artworkScaleDimensions(piece);
    const placement = useMemo(
        () => getLivingRoomPlacement(scale?.widthInches ?? 0, scale?.heightInches ?? 0),
        [scale?.heightInches, scale?.widthInches],
    );
    if (!scale) return null;
    return (
        <figure className={['lw-room-scene', className].filter(Boolean).join(' ')}>
            <ResilientImage
                className="lw-room-background"
                src={LIVING_ROOM_SCALE.image.src}
                alt="Living room wall above a navy sofa and beneath a brass picture light"
                fill
                priority={priority}
                unoptimized
                sizes="(max-width: 760px) 100vw, 980px"
            />
            <span
                className="lw-room-artwork"
                style={{
                    left: `${placement.centerXPercent}%`,
                    top: `${placement.centerYPercent}%`,
                    width: `${placement.widthPercent}%`,
                    height: `${placement.heightPercent}%`,
                }}
            >
                <ArtworkPresentationImage
                    src={piece.image_path}
                    crop={piece.presentation_crop}
                    alt={piece.title}
                    fill
                    quality={95}
                    sizes={artworkSizes}
                />
            </span>
        </figure>
    );
}
