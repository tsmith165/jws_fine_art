'use client';

import { Bookmark, Ruler } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type { PiecesWithImages } from '@/db/schema';
import { isPurchasable } from '@/lib/artwork';
import { useShortlist } from '@/stores/shortlist';
import { RoomVisualizer } from './RoomVisualizer';

export function ArtworkActions({ piece }: { piece: PiecesWithImages }) {
    const [roomOpen, setRoomOpen] = useState(false);
    const ids = useShortlist((state) => state.ids);
    const toggle = useShortlist((state) => state.toggle);
    const saved = ids.includes(piece.id);
    return (
        <>
            {isPurchasable(piece) ? (
                <Link className="lw-button lw-button-brass lw-wide-button" href={`/checkout/${piece.id}`}>
                    Acquire this painting
                </Link>
            ) : (
                <Link className="lw-button lw-button-brass lw-wide-button" href={`/contact?artwork=${piece.id}`}>
                    Ask about this work
                </Link>
            )}
            <Link className="lw-button lw-button-ghost lw-wide-button" href={`/contact?artwork=${piece.id}`}>
                Ask Jill about this work
            </Link>
            <div className="lw-action-pair">
                <button className="lw-button lw-button-ghost" onClick={() => setRoomOpen(true)}>
                    <Ruler size={16} /> View at scale
                </button>
                <button
                    className={`lw-button lw-button-ghost ${saved ? 'is-active' : ''}`}
                    aria-pressed={saved}
                    onClick={() => toggle(piece.id)}
                >
                    <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Save'}
                </button>
            </div>
            <RoomVisualizer piece={piece} open={roomOpen} onClose={() => setRoomOpen(false)} />
        </>
    );
}
