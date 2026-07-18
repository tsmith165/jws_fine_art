'use client';

import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { PiecesWithImages } from '@/types/artwork';
import { artworkHref, dimensions } from '@/lib/artwork';

export function HeroCarousel({ pieces }: { pieces: PiecesWithImages[] }) {
    const slides = pieces.slice(0, 5);
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    useEffect(() => {
        if (paused || slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const timer = window.setInterval(() => setIndex((current) => (current + 1) % slides.length), 6200);
        return () => window.clearInterval(timer);
    }, [paused, slides.length]);
    if (!slides.length) return null;
    const current = slides[index];
    const move = (amount: number) => setIndex((value) => (value + amount + slides.length) % slides.length);
    return (
        <section className="lw-hero" aria-label="Featured artwork">
            <div className="lw-hero-slides" aria-live="polite">
                <Image
                    key={current.id}
                    className="is-active"
                    src={current.image_path}
                    alt={current.title}
                    fill
                    sizes="100vw"
                    quality={90}
                    priority={index === 0}
                />
            </div>
            <div className="lw-hero-scrim" aria-hidden="true" />
            <div className="lw-hero-copy">
                <span className="lw-eyebrow">California coast · Selected works</span>
                <h1>Where the coast stays with you.</h1>
                <p>Original paintings of familiar shores, fleeting weather, and the quiet details Jill notices along the way.</p>
                <div>
                    <Link className="lw-button lw-button-brass" href="/work?theme=water">
                        View coastal paintings <ArrowRight size={16} />
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
                            aria-current={slideIndex === index ? 'true' : undefined}
                            className={slideIndex === index ? 'is-active' : ''}
                            onClick={() => setIndex(slideIndex)}
                        />
                    ))}
                </div>
            </div>
            <Link className="lw-art-credit" href={artworkHref(current)}>
                <strong>{current.title}</strong>
                <small>
                    {current.piece_type || 'Original artwork'} · {dimensions(current)}
                </small>
            </Link>
            <div className="lw-hero-index" aria-hidden="true">
                <span>{String(index + 1).padStart(2, '0')}</span>
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
