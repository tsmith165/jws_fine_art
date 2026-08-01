'use client';

import { ArrowLeft, ArrowRight, Expand, Ruler } from 'lucide-react';
import { ResilientImage as Image } from '@/components/lit-wall/ResilientImage';
import { useEffect, useRef, useState } from 'react';
import type { PiecesWithImages } from '@/types/artwork';
import { useImageTransition } from '@/hooks/useImageTransition';
import { captureAnalytics } from '@/lib/analytics';
import { adjacentImageIndexes } from '@/lib/imageLoading';
import { ImageWarmup, ProgressiveArtworkImage } from './ProgressiveArtworkImage';
import { artworkScaleDimensions } from '@/lib/artwork';
import { LIVING_ROOM_SCALE } from '@/lib/roomScale';
import { RoomVisualizer } from './RoomVisualizer';
import { LivingRoomArtworkScene } from './LivingRoomArtworkScene';

const MEDIA_TRANSITION_MS = 520;

type PhotoMedia = { kind: 'photo'; id: string; url: string; smallUrl: string; alt: string; crop?: PiecesWithImages['presentation_crop'] };
type RoomMedia = { kind: 'room'; id: 'room-scale'; url: string; smallUrl: string; alt: string };
type Media = PhotoMedia | RoomMedia;

function RoomScaleMedia({ piece, onOpen }: { piece: PiecesWithImages; onOpen: () => void }) {
    const scale = artworkScaleDimensions(piece);
    if (!scale) return null;
    return (
        <button type="button" className="lw-room-media-preview" onClick={onOpen} aria-label={`Open full scale view for ${piece.title}`}>
            <LivingRoomArtworkScene piece={piece} className="lw-room-media-scene" />
            <span className="lw-room-media-caption">
                <span><Ruler size={15} /> {scale.estimated ? 'Estimated scale' : 'View at scale'}</span>
                <small>Room rendering · open full view</small>
                <Expand size={17} />
            </span>
        </button>
    );
}

export function ArtworkMedia({ piece }: { piece: PiecesWithImages }) {
    const [roomOpen, setRoomOpen] = useState(false);
    const scale = artworkScaleDimensions(piece);
    const media: Media[] = [
        {
            kind: 'photo',
            id: 'primary',
            url: piece.image_path,
            smallUrl: piece.small_image_path || piece.image_path,
            alt: piece.title,
            crop: piece.presentation_crop,
        },
        ...piece.extraImages.map((image) => ({
            kind: 'photo' as const,
            id: `extra-${image.id}`,
            url: image.image_path,
            smallUrl: image.small_image_path || image.image_path,
            alt: `${piece.title} detail`,
            crop: image.presentation_crop,
        })),
        ...piece.progressImages.map((image) => ({
            kind: 'photo' as const,
            id: `progress-${image.id}`,
            url: image.image_path,
            smallUrl: image.small_image_path || image.image_path,
            alt: `${piece.title} in progress`,
            crop: image.presentation_crop,
        })),
        ...(scale
            ? [
                  {
                      kind: 'room' as const,
                      id: 'room-scale' as const,
                      url: LIVING_ROOM_SCALE.image.src,
                      smallUrl: LIVING_ROOM_SCALE.image.src,
                      alt: `${piece.title} shown to scale in a living room`,
                  },
              ]
            : []),
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
            media_kind: media[index]?.kind === 'room' ? 'room_visualization' : 'photo',
        });
        if (media[index]?.kind === 'room') {
            captureAnalytics('room_visualization_tile_viewed', { artwork_id: piece.id, artwork_slug: piece.slug });
        }
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
                        {active.kind === 'room' ? (
                            <RoomScaleMedia piece={piece} onOpen={() => {
                                captureAnalytics('room_visualizer_opened', { artwork_id: piece.id, artwork_slug: piece.slug, source: 'media_rail' });
                                setRoomOpen(true);
                            }} />
                        ) : (
                            <ProgressiveArtworkImage
                                src={active.url}
                                placeholderSrc={active.smallUrl}
                                alt={displayIndex === activeIndex ? active.alt : ''}
                                sizes="(max-width: 900px) 92vw, 58vw"
                                quality={95}
                                priority={activeIndex === 0}
                                crop={active.crop}
                            />
                        )}
                    </div>
                    {incoming && incomingIndex !== null ? (
                        <div
                            className={`lw-artwork-image-layer is-incoming${phase === 'transitioning' ? 'is-active' : ''}`}
                            key={incoming.id}
                            onTransitionEnd={(event) => transitionEnd(incomingIndex, event.propertyName)}
                        >
                            {incoming.kind === 'room' ? (
                                <div ref={() => ready(incomingIndex)} className="lw-room-media-transition">
                                    <RoomScaleMedia piece={piece} onOpen={() => {
                                        captureAnalytics('room_visualizer_opened', { artwork_id: piece.id, artwork_slug: piece.slug, source: 'media_rail' });
                                        setRoomOpen(true);
                                    }} />
                                </div>
                            ) : (
                                <ProgressiveArtworkImage
                                    src={incoming.url}
                                    placeholderSrc={incoming.smallUrl}
                                    alt={displayIndex === incomingIndex ? incoming.alt : ''}
                                    sizes="(max-width: 900px) 92vw, 58vw"
                                    quality={95}
                                    onReady={() => ready(incomingIndex)}
                                    crop={incoming.crop}
                                />
                            )}
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
                            {media[displayIndex]?.kind === 'room' ? 'Room visualization' : `${displayIndex + 1} / ${media.filter((item) => item.kind === 'photo').length}`}
                        </span>
                    </>
                )}
            </div>
            <ImageWarmup sources={warmupSources} sizes="(max-width: 900px) 92vw, 58vw" quality={95} />
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
                            aria-label={item.kind === 'room' ? 'View room visualization, rendered to relative scale' : `View artwork photo ${media.slice(0, index + 1).filter((candidate) => candidate.kind === 'photo').length} of ${media.filter((candidate) => candidate.kind === 'photo').length}`}
                            onKeyDown={(event) => keyboard(event, index)}
                            onClick={() => choose(index, 'thumbnail')}
                        >
                            <Image src={item.smallUrl} alt="" width={120} height={90} sizes="72px" />
                            {item.kind === 'room' ? <span className="lw-room-rail-label"><Ruler size={11} /> At scale</span> : null}
                        </button>
                    ))}
                </div>
            )}
            <RoomVisualizer piece={piece} open={roomOpen} onClose={() => setRoomOpen(false)} />
        </div>
    );
}
