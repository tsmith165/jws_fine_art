'use client';

import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { PiecesWithImages } from '@/types/artwork';
import { artworkHref, dimensions } from '@/lib/artwork';
import { captureAnalytics } from '@/lib/analytics';
import { useImageTransition } from '@/hooks/useImageTransition';
import { adjacentImageIndexes } from '@/lib/imageLoading';
import { ImageWarmup, ProgressiveArtworkImage } from './ProgressiveArtworkImage';

const HERO_TRANSITION_MS = 1150;

export function HeroCarousel({ pieces }: { pieces: PiecesWithImages[] }) {
    const slides = pieces.slice(0, 5);
    const [paused, setPaused] = useState(false);
    const { activeIndex, incomingIndex, phase, displayIndex, targetIndex, select, ready, transitionEnd } = useImageTransition(
        slides.length,
        HERO_TRANSITION_MS,
    );
    useEffect(() => {
        if (paused || phase !== 'idle' || slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const timer = window.setTimeout(() => select(activeIndex + 1), 6200);
        return () => window.clearTimeout(timer);
    }, [activeIndex, paused, phase, select, slides.length]);
    if (!slides.length) return null;
    const current = slides[activeIndex];
    const incoming = incomingIndex === null ? null : slides[incomingIndex];
    const displayed = slides[displayIndex];
    const warmupSources = adjacentImageIndexes(slides.length, targetIndex)
        .filter((index) => index !== activeIndex && index !== incomingIndex)
        .map((index) => slides[index].image_path);
    const move = (amount: number) => {
        const next = (targetIndex + amount + slides.length) % slides.length;
        captureAnalytics('hero_artwork_changed', { artwork_id: slides[next]?.id, direction: amount < 0 ? 'previous' : 'next' });
        select(next);
    };
    return (
        <section className="lw-hero" aria-label="Featured artwork">
            <div className="lw-hero-slides" aria-hidden="true">
                <div className={`lw-hero-slide is-current${phase === 'transitioning' ? 'is-exiting' : ''}`} key={current.id}>
                    <ProgressiveArtworkImage
                        src={current.image_path}
                        placeholderSrc={current.small_image_path}
                        alt=""
                        sizes="100vw"
                        quality={88}
                        priority={activeIndex === 0}
                        fetchPriority={activeIndex === 0 ? 'high' : 'auto'}
                    />
                </div>
                {incoming && incomingIndex !== null ? (
                    <div
                        className={`lw-hero-slide is-incoming${phase === 'transitioning' ? 'is-active' : ''}`}
                        key={incoming.id}
                        onTransitionEnd={(event) => transitionEnd(incomingIndex, event.propertyName)}
                    >
                        <ProgressiveArtworkImage
                            src={incoming.image_path}
                            placeholderSrc={incoming.small_image_path}
                            alt=""
                            sizes="100vw"
                            quality={88}
                            onReady={() => ready(incomingIndex)}
                        />
                    </div>
                ) : null}
            </div>
            <ImageWarmup sources={warmupSources} sizes="100vw" quality={88} />
            <div className="lw-hero-scrim" aria-hidden="true" />
            <div className="lw-hero-copy">
                <span className="lw-eyebrow">California coast · Selected works</span>
                <h1>Where the coast stays with you.</h1>
                <p>Original paintings of familiar shores, shifting light, and the quiet details noticed along the way.</p>
                <div>
                    <Link className="lw-button lw-button-brass" href="/work">
                        Explore all paintings <ArrowRight size={16} />
                    </Link>
                    <Link className="lw-button lw-button-ghost" href="/studio">
                        Meet the artist
                    </Link>
                </div>
                <div className="lw-hero-dots" aria-label="Choose featured artwork">
                    {slides.map((piece, slideIndex) => (
                        <button
                            key={piece.id}
                            aria-label={`Show ${piece.title}`}
                            aria-current={slideIndex === targetIndex ? 'true' : undefined}
                            className={slideIndex === targetIndex ? 'is-active' : ''}
                            onClick={() => {
                                captureAnalytics('hero_artwork_changed', { artwork_id: piece.id, direction: 'direct' });
                                select(slideIndex);
                            }}
                        />
                    ))}
                </div>
            </div>
            <Link className="lw-art-credit" href={artworkHref(displayed)} aria-live="polite">
                <strong>{displayed.title}</strong>
                <small>
                    {displayed.piece_type || 'Original artwork'} · {dimensions(displayed)}
                </small>
            </Link>
            <div className="lw-hero-index" aria-hidden="true">
                <span>{String(displayIndex + 1).padStart(2, '0')}</span>
                <i />
                <span>{String(slides.length).padStart(2, '0')}</span>
            </div>
            {slides.length > 1 && (
                <div className="lw-hero-controls" aria-label="Featured artwork controls">
                    <button aria-label="Previous artwork" onClick={() => move(-1)}>
                        <ArrowLeft size={17} />
                    </button>
                    <button aria-label={paused ? 'Resume slideshow' : 'Pause slideshow'} onClick={() => setPaused(!paused)}>
                        {paused ? <Play size={15} /> : <Pause size={15} />}
                    </button>
                    <button aria-label="Next artwork" onClick={() => move(1)}>
                        <ArrowRight size={17} />
                    </button>
                </div>
            )}
        </section>
    );
}
