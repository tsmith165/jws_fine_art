'use client';

import { Ruler } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { RoomVisualizer } from '@/components/lit-wall/RoomVisualizer';
import type { PiecesWithImages } from '@/types/artwork';
import { artworkScaleDimensions, isPurchasable } from '@/lib/artwork';
import { captureAnalytics } from '@/lib/analytics';

export function ArtworkActions({ piece }: { piece: PiecesWithImages }) {
    const [roomOpen, setRoomOpen] = useState(false);
    return (
        <>
            {isPurchasable(piece) ? (
                <Link
                    className="lw-button lw-button-brass lw-wide-button"
                    href={`/checkout/${piece.id}`}
                    onClick={() => captureAnalytics('checkout_started', { artwork_id: piece.id, artwork_slug: piece.slug })}
                >
                    Acquire this painting
                </Link>
            ) : (
                <Link
                    className="lw-button lw-button-brass lw-wide-button"
                    href={`/contact?artwork=${piece.id}`}
                    onClick={() => captureAnalytics('artwork_inquiry_started', { artwork_id: piece.id, artwork_slug: piece.slug })}
                >
                    Ask about this work
                </Link>
            )}
            {artworkScaleDimensions(piece) ? (
                <button
                    id="view-at-scale"
                    type="button"
                    className="lw-button lw-button-ghost lw-wide-button"
                    onClick={() => {
                        captureAnalytics('room_visualizer_opened', {
                            artwork_id: piece.id,
                            artwork_slug: piece.slug,
                            source: 'actions_button',
                        });
                        setRoomOpen(true);
                    }}
                >
                    <Ruler size={16} /> View at scale
                </button>
            ) : null}
            <Link
                className="lw-button lw-button-ghost lw-wide-button"
                href={`/contact?artwork=${piece.id}`}
                onClick={() => captureAnalytics('artwork_inquiry_started', { artwork_id: piece.id, artwork_slug: piece.slug })}
            >
                Ask Jill about this work
            </Link>
            <RoomVisualizer piece={piece} open={roomOpen} onClose={() => setRoomOpen(false)} />
        </>
    );
}
