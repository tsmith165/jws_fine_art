'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { PiecesWithImages } from '@/types/artwork';

type Media = { id: string; url: string; smallUrl: string; width: number; height: number; alt: string };

export function ArtworkMedia({ piece }: { piece: PiecesWithImages }) {
    const media: Media[] = [
        {
            id: 'primary',
            url: piece.image_path,
            smallUrl: piece.small_image_path || piece.image_path,
            width: piece.width,
            height: piece.height,
            alt: piece.title,
        },
        ...piece.extraImages.map((image) => ({
            id: `extra-${image.id}`,
            url: image.image_path,
            smallUrl: image.small_image_path || image.image_path,
            width: image.width,
            height: image.height,
            alt: `${piece.title} detail`,
        })),
        ...piece.progressImages.map((image) => ({
            id: `progress-${image.id}`,
            url: image.image_path,
            smallUrl: image.small_image_path || image.image_path,
            width: image.width,
            height: image.height,
            alt: `${piece.title} in progress`,
        })),
    ];
    const [selected, setSelected] = useState(0);
    const refs = useRef<Array<HTMLButtonElement | null>>([]);
    const active = media[selected] || media[0];
    const move = (amount: number) => setSelected((value) => (value + amount + media.length) % media.length);
    useEffect(() => setSelected(0), [piece.id]);
    useEffect(() => {
        refs.current[selected]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }, [selected]);
    const keyboard = (event: React.KeyboardEvent, index: number) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next =
            event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? media.length - 1
                  : (index + (event.key === 'ArrowRight' ? 1 : -1) + media.length) % media.length;
        setSelected(next);
        requestAnimationFrame(() => refs.current[next]?.focus());
    };
    return (
        <div className="lw-artwork-media">
            <div className="lw-artwork-main">
                <Image
                    key={active.id}
                    src={active.url}
                    alt={active.alt}
                    width={active.width}
                    height={active.height}
                    sizes="(max-width: 900px) 92vw, 58vw"
                    quality={90}
                    priority
                />
                {media.length > 1 && (
                    <>
                        <button className="is-previous" aria-label="Previous image" onClick={() => move(-1)}>
                            <ArrowLeft size={20} />
                        </button>
                        <button className="is-next" aria-label="Next image" onClick={() => move(1)}>
                            <ArrowRight size={20} />
                        </button>
                        <span className="lw-media-count" aria-live="polite">
                            {selected + 1} / {media.length}
                        </span>
                    </>
                )}
            </div>
            {media.length > 1 && (
                <div className="lw-media-rail" role="tablist" aria-label="Artwork images">
                    {media.map((item, index) => (
                        <button
                            key={item.id}
                            ref={(node) => {
                                refs.current[index] = node;
                            }}
                            role="tab"
                            aria-selected={index === selected}
                            tabIndex={index === selected ? 0 : -1}
                            className={index === selected ? 'is-active' : ''}
                            aria-label={`View image ${index + 1} of ${media.length}`}
                            onKeyDown={(event) => keyboard(event, index)}
                            onClick={() => setSelected(index)}
                        >
                            <Image src={item.smallUrl} alt="" width={120} height={90} sizes="72px" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
