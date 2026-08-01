'use client';

import { Check, Ruler, TriangleAlert, X } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import type { PiecesWithImages } from '@/types/artwork';
import { artworkScaleDimensions, scaleDimensionsLabel } from '@/lib/artwork';
import { getLivingRoomPlacement, LIVING_ROOM_SCALE } from '@/lib/roomScale';
import { LivingRoomArtworkScene } from './LivingRoomArtworkScene';

interface RoomVisualizerProps {
    piece: PiecesWithImages;
    open: boolean;
    onClose: () => void;
}

export function RoomVisualizer({ piece, open, onClose }: RoomVisualizerProps) {
    const dialogRef = useRef<HTMLElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const scaleDimensions = artworkScaleDimensions(piece);
    const width = scaleDimensions?.widthInches || 0;
    const height = scaleDimensions?.heightInches || 0;
    const placement = useMemo(() => getLivingRoomPlacement(width, height), [height, width]);

    useEffect(() => {
        if (!open) return;
        const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const priorOverflow = document.body.style.overflow;
        const priorRootOverflow = document.documentElement.style.overflow;
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        closeButtonRef.current?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
                return;
            }
            if (event.key !== 'Tab' || !dialogRef.current) return;
            const focusable = Array.from(
                dialogRef.current.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
                ),
            );
            if (!focusable.length) {
                event.preventDefault();
                dialogRef.current.focus();
                return;
            }
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = priorOverflow;
            document.documentElement.style.overflow = priorRootOverflow;
            previouslyFocused?.focus();
        };
    }, [onClose, open]);

    if (!open || !width || !height) return null;

    return (
        <div className="lw-room-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
            <section
                ref={dialogRef}
                className="lw-room-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="room-title"
                aria-describedby="room-description"
                tabIndex={-1}
            >
                <header>
                    <div>
                        <span className="lw-eyebrow">View at scale</span>
                        <h2 id="room-title">See {piece.title} at home.</h2>
                        <p id="room-description">
                            Shown in a real living room using {scaleDimensions?.estimated ? 'estimated outside-frame' : 'recorded finished'} dimensions.
                        </p>
                    </div>
                    <button ref={closeButtonRef} type="button" aria-label="Close scale view" onClick={onClose}>
                        <X size={21} />
                    </button>
                </header>

                <div className="lw-room-stage">
                    <LivingRoomArtworkScene
                        piece={piece}
                        priority
                        artworkSizes={`(max-width: 760px) ${Math.min(100, Math.max(12, Math.ceil(placement.widthPercent)))}vw, ${Math.min(70, Math.max(8, Math.ceil(placement.widthPercent * 0.7)))}vw`}
                    />
                </div>

                <footer>
                    <div className={`lw-room-fit ${placement.fitsClearWall ? 'is-fit' : 'is-oversized'}`}>
                        <span>
                            {placement.fitsClearWall ? <Check size={15} /> : <TriangleAlert size={15} />}
                            {placement.fitsClearWall ? 'Fits within the wall shown' : 'Larger than the clear wall shown'}
                        </span>
                        <p>
                            {placement.fitsClearWall
                                ? `The photographed clear area is approximately ${LIVING_ROOM_SCALE.clearWall.widthInches} × ${LIVING_ROOM_SCALE.clearWall.heightInches} in.`
                                : 'The work remains at true relative scale so the overlap is visible.'}
                        </p>
                    </div>
                    <dl>
                        <div>
                            <dt>Artwork</dt>
                            <dd>{scaleDimensionsLabel(piece)}</dd>
                        </div>
                        <div>
                            <dt>Placement</dt>
                            <dd>Centered above the sofa</dd>
                        </div>
                    </dl>
                    <small>
                        <Ruler size={14} /> {scaleDimensions?.estimated ? 'Estimated scale is calibrated from the recorded artwork size.' : 'Relative size is calibrated.'} Screen dimensions vary.
                    </small>
                </footer>
            </section>
        </div>
    );
}
