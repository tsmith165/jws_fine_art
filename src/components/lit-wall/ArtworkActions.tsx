'use client';

import { Bookmark } from 'lucide-react';
import Link from 'next/link';
import type { PiecesWithImages } from '@/types/artwork';
import { isPurchasable } from '@/lib/artwork';
import { captureAnalytics } from '@/lib/analytics';
import { useShortlist } from '@/stores/shortlist';

export function ArtworkActions({ piece }: { piece: PiecesWithImages }) {
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
            <Link
                className="lw-button lw-button-ghost lw-wide-button"
                href={`/contact?artwork=${piece.id}`}
                onClick={() => captureAnalytics('artwork_inquiry_started', { artwork_id: piece.id, artwork_slug: piece.slug })}
            >
                Ask Jill about this work
            </Link>
            {/* The View at scale room visualizer is paused; see RoomVisualizer.tsx when it returns. */}
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
        </>
    );
}
