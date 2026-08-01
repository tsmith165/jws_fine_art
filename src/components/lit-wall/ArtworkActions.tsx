'use client';

import { Bookmark, Ruler } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { RoomVisualizer } from '@/components/lit-wall/RoomVisualizer';
import type { PiecesWithImages } from '@/types/artwork';
import { isPurchasable } from '@/lib/artwork';
import { captureAnalytics } from '@/lib/analytics';
import { useShortlist } from '@/stores/shortlist';

export function ArtworkActions({ piece }: { piece: PiecesWithImages }) {
    const [roomOpen, setRoomOpen] = useState(false);
    const ids = useShortlist((state) => state.ids);
    const toggle = useShortlist((state) => state.toggle);
    const saved = ids.includes(piece.id);
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
            {piece.real_width && piece.real_height ? (
                <button
                    type="button"
                    className="lw-button lw-button-ghost lw-wide-button"
                    onClick={() => {
                        captureAnalytics('room_visualizer_opened', {
                            artwork_id: piece.id,
                            artwork_slug: piece.slug,
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
            <button
                className={`lw-button lw-button-ghost lw-wide-button ${saved ? 'is-active' : ''}`}
                aria-pressed={saved}
                onClick={() => {
                    captureAnalytics('shortlist_changed', {
                        artwork_id: piece.id,
                        artwork_slug: piece.slug,
                        action: saved ? 'removed' : 'saved',
                    });
                    toggle(piece.id);
                }}
            >
                <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Save'}
            </button>
            <RoomVisualizer piece={piece} open={roomOpen} onClose={() => setRoomOpen(false)} />
        </>
    );
}
