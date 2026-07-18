'use client';

import { Ruler, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { PiecesWithImages } from '@/db/schema';
import { dimensions } from '@/lib/artwork';

const rooms = [
    { id: 'living', label: 'Living room', width: 144, height: 96, reference: '84 in sofa', referenceWidth: 84 },
    { id: 'entry', label: 'Entry wall', width: 96, height: 96, reference: '60 in console', referenceWidth: 60 },
    { id: 'study', label: 'Study', width: 72, height: 84, reference: '48 in desk', referenceWidth: 48 },
] as const;

export function RoomVisualizer({ piece, open, onClose }: { piece: PiecesWithImages; open: boolean; onClose: () => void }) {
    const [roomId, setRoomId] = useState<(typeof rooms)[number]['id']>('living');
    const [position, setPosition] = useState(50);
    const room = rooms.find((item) => item.id === roomId) || rooms[0];
    const width = piece.real_width || 20;
    const height = piece.real_height || Math.round((width * piece.height) / piece.width);
    const artworkWidth = Math.max(6, Math.min(65, (width / room.width) * 100));
    const artworkHeight = Math.max(7, Math.min(62, (height / room.height) * 100));
    useEffect(() => {
        if (!open) return;
        const close = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
        window.addEventListener('keydown', close);
        return () => window.removeEventListener('keydown', close);
    }, [onClose, open]);
    if (!open) return null;
    return (
        <div className="lw-room-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
            <section className="lw-room-dialog" role="dialog" aria-modal="true" aria-labelledby="room-title">
                <header>
                    <div>
                        <span className="lw-eyebrow">View at scale</span>
                        <h2 id="room-title">Place {piece.title} in a room.</h2>
                        <p>
                            {piece.real_width && piece.real_height
                                ? 'Calibrated from the recorded physical dimensions.'
                                : 'Approximate scale because complete physical dimensions are unavailable.'}
                        </p>
                    </div>
                    <button aria-label="Close room visualization" onClick={onClose}>
                        <X size={21} />
                    </button>
                </header>
                <div className="lw-room-tabs" role="tablist" aria-label="Room preset">
                    {rooms.map((item) => (
                        <button
                            key={item.id}
                            role="tab"
                            aria-selected={room.id === item.id}
                            className={room.id === item.id ? 'is-active' : ''}
                            onClick={() => setRoomId(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
                <div className={`lw-room-scene is-${room.id}`}>
                    <div
                        className="lw-room-art"
                        style={{ left: `${10 + position * 0.8}%`, width: `${artworkWidth}%`, height: `${artworkHeight}%` }}
                    >
                        <Image src={piece.image_path} alt={piece.title} fill sizes="40vw" />
                    </div>
                    <div className="lw-room-furniture" style={{ width: `${(room.referenceWidth / room.width) * 100}%` }}>
                        <i />
                        <i />
                        <i />
                    </div>
                    <div className="lw-room-floor" />
                </div>
                <footer>
                    <label>
                        <span>Horizontal position</span>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={position}
                            onChange={(event) => setPosition(Number(event.target.value))}
                        />
                    </label>
                    <dl>
                        <div>
                            <dt>Artwork</dt>
                            <dd>{dimensions(piece)}</dd>
                        </div>
                        <div>
                            <dt>Wall</dt>
                            <dd>
                                {room.width} × {room.height} in
                            </dd>
                        </div>
                        <div>
                            <dt>Reference</dt>
                            <dd>{room.reference}</dd>
                        </div>
                    </dl>
                    <small>
                        <Ruler size={14} /> Relative scale · Screen size does not represent physical size.
                    </small>
                </footer>
            </section>
        </div>
    );
}
