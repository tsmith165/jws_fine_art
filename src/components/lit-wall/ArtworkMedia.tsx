'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import type { PiecesWithImages } from '@/types/artwork';
import { useImageTransition } from '@/hooks/useImageTransition';
import { captureAnalytics } from '@/lib/analytics';
import { adjacentImageIndexes } from '@/lib/imageLoading';
import { ImageWarmup, ProgressiveArtworkImage } from './ProgressiveArtworkImage';

const MEDIA_TRANSITION_MS = 520;

type Media = { id: string; url: string; smallUrl: string; alt: string };

export function ArtworkMedia({ piece }: { piece: PiecesWithImages }) {
    const media: Media[] = [
        {
            id: 'primary',
            url: piece.image_path,
            smallUrl: piece.small_image_path || piece.image_path,
            alt: piece.title,
        },
        ...piece.extraImages.map((image) => ({
            id: `extra-${image.id}`,
            url: image.image_path,
            smallUrl: image.small_image_path || image.image_path,
            alt: `${piece.title} detail`,
        })),
        ...piece.progressImages.map((image) => ({
            id: `progress-${image.id}`,
            url: image.image_path,
            smallUrl: image.small_image_path || image.image_path,
            alt: `${piece.title} in progress`,
        })),
    ];
    const refs = useRef<Array<HTMLButtonElement | null>>([]);
    const { activeIndex, incomingIndex, phase, displayIndex, targetIndex, select, ready, transitionEnd, reset } = useImageTransition(
        media.length,
        MEDIA_TRANSITION_MS,
    );
    const active = media[activeIndex] || media[0];
    const incoming = incomingIndex === null ? null : media[incomingIndex];
    const warmupSources = adjacentImageIndexes(media.length, targetIndex)
        .filter((index) => index !== activeIndex && index !== incomingIndex)
        .map((index) => media[index].url);
    const choose = (index: number, method: 'arrow' | 'thumbnail' | 'keyboard') => {
        captureAnalytics('artwork_media_navigated', {
            artwork_id: piece.id,
            artwork_slug: piece.slug,
            image_index: index + 1,
            image_total: media.length,
            method,
        });
        select(index);
    };
    const move = (amount: number) => choose((targetIndex + amount + media.length) % media.length, 'arrow');
    useEffect(() => reset(), [piece.id, reset]);
    useEffect(() => {
        refs.current[targetIndex]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }, [targetIndex]);
    const keyboard = (event: React.KeyboardEvent, index: number) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next =
            event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? media.length - 1
                  : (index + (event.key === 'ArrowRight' ? 1 : -1) + media.length) % media.length;
        choose(next, 'keyboard');
        requestAnimationFrame(() => refs.current[next]?.focus());
    };
    return (
        <div className="lw-artwork-media">
            <div className="lw-artwork-main">
                <div className="lw-artwork-image-stage">
                    <div className={`lw-artwork-image-layer is-current${phase === 'transitioning' ? 'is-exiting' : ''}`} key={active.id}>
                        <ProgressiveArtworkImage
                            src={active.url}
                            placeholderSrc={active.smallUrl}
                            alt={displayIndex === activeIndex ? active.alt : ''}
                            sizes="(max-width: 900px) 92vw, 58vw"
                            quality={92}
                            priority={activeIndex === 0}
                        />
                    </div>
                    {incoming && incomingIndex !== null ? (
                        <div
                            className={`lw-artwork-image-layer is-incoming${phase === 'transitioning' ? 'is-active' : ''}`}
                            key={incoming.id}
                            onTransitionEnd={(event) => transitionEnd(incomingIndex, event.propertyName)}
                        >
                            <ProgressiveArtworkImage
                                src={incoming.url}
                                placeholderSrc={incoming.smallUrl}
                                alt={displayIndex === incomingIndex ? incoming.alt : ''}
                                sizes="(max-width: 900px) 92vw, 58vw"
                                quality={92}
                                onReady={() => ready(incomingIndex)}
                            />
                        </div>
                    ) : null}
                </div>
                {media.length > 1 && (
                    <>
                        <button className="is-previous" aria-label="Previous image" onClick={() => move(-1)}>
                            <ArrowLeft size={20} />
                        </button>
                        <button className="is-next" aria-label="Next image" onClick={() => move(1)}>
                            <ArrowRight size={20} />
                        </button>
                        <span className="lw-media-count" aria-live="polite">
                            {displayIndex + 1} / {media.length}
                        </span>
                    </>
                )}
            </div>
            <ImageWarmup sources={warmupSources} sizes="(max-width: 900px) 92vw, 58vw" quality={92} />
            {media.length > 1 && (
                <div className="lw-media-rail" role="tablist" aria-label="Artwork images">
                    {media.map((item, index) => (
                        <button
                            key={item.id}
                            ref={(node) => {
                                refs.current[index] = node;
                            }}
                            role="tab"
                            aria-selected={index === targetIndex}
                            tabIndex={index === targetIndex ? 0 : -1}
                            className={index === targetIndex ? 'is-active' : ''}
                            aria-label={`View image ${index + 1} of ${media.length}`}
                            onKeyDown={(event) => keyboard(event, index)}
                            onClick={() => choose(index, 'thumbnail')}
                        >
                            <Image src={item.smallUrl} alt="" width={120} height={90} sizes="72px" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
