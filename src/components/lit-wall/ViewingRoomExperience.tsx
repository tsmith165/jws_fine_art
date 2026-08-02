'use client';

import { ArrowLeft, ArrowRight, Info, MessageCircle, Minus, Plus, Ruler, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FunctionReturnType } from 'convex/server';
import type { api } from '../../../convex/_generated/api';
import { ResilientImage as Image } from './ResilientImage';
import { ArtworkPresentationImage } from './ArtworkPresentationImage';
import { captureAnalytics } from '@/lib/analytics';
import { galleryWallSurfaceStyle, type GalleryWallPresetKey } from '@/lib/galleryWallPresets';

type Walls = FunctionReturnType<typeof api.galleryWalls.listPublished>;
type Wall = Walls[number];
type Placement = Wall['placements'][number];

function money(cents: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100);
}

export function ViewingRoomExperience({ walls, initialSlug }: { walls: Walls; initialSlug: string }) {
    const initialIndex = Math.max(
        0,
        walls.findIndex((wall) => wall.slug === initialSlug),
    );
    const [index, setIndex] = useState(initialIndex);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const panelRef = useRef<HTMLElement>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const touchStart = useRef<number | null>(null);
    const wall = walls[index] ?? walls[0];
    const selected = useMemo(() => wall?.placements.find((item) => item.id === selectedId) ?? null, [selectedId, wall]);

    const closePanel = () => {
        setSelectedId(null);
        window.requestAnimationFrame(() => triggerRef.current?.focus());
    };

    const changeWall = (next: number) => {
        const target = (next + walls.length) % walls.length;
        setIndex(target);
        setSelectedId(null);
        setZoom(1);
        window.history.replaceState(null, '', `/viewing-room/${walls[target].slug}`);
        captureAnalytics('viewing_room_wall_changed', { wall_slug: walls[target].slug, wall_index: target + 1, wall_total: walls.length });
    };

    useEffect(() => {
        if (!wall) return;
        captureAnalytics('viewing_room_opened', { wall_slug: wall.slug, wall_index: index + 1, wall_total: walls.length });
        // Capture once for the initially rendered wall. Deliberate navigation has its own event.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const select = (placement: Placement) => {
        if (!wall) return;
        triggerRef.current = document.activeElement instanceof HTMLButtonElement ? document.activeElement : null;
        setSelectedId(placement.id);
        captureAnalytics('viewing_room_artwork_opened', {
            wall_slug: wall.slug,
            artwork_id: placement.artwork.legacyId,
            artwork_slug: placement.artwork.slug,
        });
    };

    useEffect(() => {
        const keydown = (event: KeyboardEvent) => {
            if (selectedId) {
                if (event.key === 'Escape') {
                    closePanel();
                    return;
                }
                if (event.key === 'Tab' && panelRef.current) {
                    const focusable = Array.from(
                        panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'),
                    );
                    const first = focusable[0];
                    const last = focusable.at(-1);
                    if (event.shiftKey && document.activeElement === first && last) {
                        event.preventDefault();
                        last.focus();
                    } else if (!event.shiftKey && document.activeElement === last && first) {
                        event.preventDefault();
                        first.focus();
                    }
                }
                return;
            }
            if (event.key === 'ArrowLeft') changeWall(index - 1);
            if (event.key === 'ArrowRight') changeWall(index + 1);
            if (event.key === 'Home') changeWall(0);
            if (event.key === 'End') changeWall(walls.length - 1);
        };
        window.addEventListener('keydown', keydown);
        return () => window.removeEventListener('keydown', keydown);
    });

    useEffect(() => {
        if (!selected) return;
        panelRef.current?.querySelector<HTMLButtonElement>('.lw-viewing-panel-close')?.focus();
    }, [selected]);

    if (!wall) return null;

    return (
        <div className="lw-viewing-room">
            <p className="lw-sr-only" aria-live="polite">
                Wall {index + 1} of {walls.length}: {wall.title}
            </p>
            <header className="lw-viewing-room-header">
                <div>
                    <h1>{wall.title}</h1>
                    {wall.narrative ? <p>{wall.narrative}</p> : <p>Explore Jill’s work together, arranged at true relative scale.</p>}
                </div>
                <div className="lw-viewing-room-navigation">
                    <span>
                        {index + 1} / {walls.length}
                    </span>
                    <button type="button" onClick={() => changeWall(index - 1)} aria-label="Previous gallery wall">
                        <ArrowLeft size={18} />
                    </button>
                    <button type="button" onClick={() => changeWall(index + 1)} aria-label="Next gallery wall">
                        <ArrowRight size={18} />
                    </button>
                </div>
            </header>

            <div className="lw-viewing-wall-shell">
                <div className="lw-viewing-wall-viewport">
                    <div
                        className={`lw-viewing-wall is-${wall.background.preset} has-${wall.lighting}-light floor-${wall.floorStyle}`}
                        style={{
                            ...galleryWallSurfaceStyle(wall.background.preset as GalleryWallPresetKey),
                            aspectRatio: `${wall.widthInches} / ${wall.heightInches}`,
                            transform: `scale(${zoom})`,
                        }}
                        aria-label={`${wall.title}, a gallery wall containing ${wall.placements.length} artworks`}
                        aria-roledescription="gallery wall"
                        onTouchStart={(event) => {
                            touchStart.current = event.changedTouches[0]?.clientX ?? null;
                        }}
                        onTouchEnd={(event) => {
                            if (touchStart.current === null) return;
                            const distance = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
                            touchStart.current = null;
                            if (Math.abs(distance) >= 55) changeWall(index + (distance < 0 ? 1 : -1));
                        }}
                    >
                        {wall.placements.map((placement, placementIndex) => {
                            const artwork = placement.artwork;
                            return (
                                <button
                                    key={placement.id}
                                    type="button"
                                    className={`lw-viewing-piece ${selectedId === placement.id ? 'is-selected' : ''}`}
                                    style={{
                                        left: `${(placement.centerXInches / wall.widthInches) * 100}%`,
                                        top: `${(placement.centerYInches / wall.heightInches) * 100}%`,
                                        width: `${(artwork.widthInches / wall.widthInches) * 100}%`,
                                        aspectRatio: `${artwork.widthInches} / ${artwork.heightInches}`,
                                    }}
                                    onClick={() => select(placement)}
                                    aria-label={`Open details for ${artwork.title}${artwork.sold ? ', sold' : ''}`}
                                >
                                    <ArtworkPresentationImage
                                        src={artwork.imageUrl}
                                        crop={artwork.presentationCrop}
                                        alt=""
                                        fill
                                        quality={95}
                                        sizes="30vw"
                                    />
                                    {wall.artworkLabelMode === 'hidden' ? (
                                        <span className="lw-viewing-piece-number">{placementIndex + 1}</span>
                                    ) : null}
                                    {wall.artworkLabelMode !== 'hidden' ? (
                                        <span className={`lw-viewing-piece-label is-${wall.artworkLabelMode}`} aria-hidden="true">
                                            <strong>{artwork.title}</strong>
                                            <small>
                                                {artwork.sold ? 'Sold' : artwork.available ? money(artwork.priceCents) : 'Private collection'}
                                            </small>
                                        </span>
                                    ) : null}
                                    {artwork.sold && wall.artworkLabelMode === 'hidden' ? <em>Sold</em> : null}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <footer>
                    <span>
                        <Info size={14} /> Select an artwork for details
                    </span>
                    <div className="lw-viewing-wall-footer-tools">
                        <span>
                            <Ruler size={14} /> Artwork sizes are shown at consistent relative scale; the gallery environment is illustrative
                            {wall.placements.some((item) => item.artwork.dimensionsEstimated) ? '; some framed sizes are estimated' : ''}
                        </span>
                        <div className="lw-viewing-zoom" aria-label="Gallery wall zoom controls">
                            <button
                                type="button"
                                onClick={() => setZoom((value) => Math.max(0.85, Number((value - 0.15).toFixed(2))))}
                                disabled={zoom <= 0.85}
                                aria-label="Zoom out"
                            >
                                <Minus size={13} />
                            </button>
                            <button type="button" onClick={() => setZoom(1)} disabled={zoom === 1} aria-label="Reset zoom to 100 percent">
                                {Math.round(zoom * 100)}%
                            </button>
                            <button
                                type="button"
                                onClick={() => setZoom((value) => Math.min(1.3, Number((value + 0.15).toFixed(2))))}
                                disabled={zoom >= 1.3}
                                aria-label="Zoom in"
                            >
                                <Plus size={13} />
                            </button>
                        </div>
                    </div>
                </footer>
            </div>

            <aside
                ref={panelRef}
                className={`lw-viewing-artwork-panel ${selected ? 'is-open' : ''}`}
                role={selected ? 'dialog' : undefined}
                aria-modal={selected ? 'true' : undefined}
                aria-live="polite"
                aria-label={selected ? `Details for ${selected.artwork.title}` : undefined}
            >
                {selected ? (
                    <>
                        <button type="button" className="lw-viewing-panel-close" onClick={closePanel} aria-label="Close artwork details">
                            <X size={18} />
                        </button>
                        <div className="lw-viewing-panel-image">
                            <ArtworkPresentationImage
                                src={selected.artwork.imageUrl}
                                crop={selected.artwork.presentationCrop}
                                alt={selected.artwork.title}
                                fill
                                quality={95}
                                sizes="(max-width: 760px) 88vw, 340px"
                            />
                        </div>
                        <span className="lw-eyebrow">Artwork {wall.placements.findIndex((item) => item.id === selected.id) + 1}</span>
                        <h2>{selected.artwork.title}</h2>
                        <p>
                            {selected.artwork.medium || 'Original artwork'} · {selected.artwork.widthInches} ×{' '}
                            {selected.artwork.heightInches} in{selected.artwork.dimensionsEstimated ? ' · Estimated framed size' : ''}
                        </p>
                        <div>
                            <strong>
                                {selected.artwork.sold
                                    ? 'Sold'
                                    : selected.artwork.available
                                      ? money(selected.artwork.priceCents)
                                      : 'Private collection'}
                            </strong>
                        </div>
                        <div className="lw-viewing-panel-actions">
                            <Link
                                className="lw-button lw-button-brass"
                                href={`/work/${selected.artwork.slug}`}
                                onClick={() =>
                                    captureAnalytics('viewing_room_artwork_page_clicked', {
                                        wall_slug: wall.slug,
                                        artwork_id: selected.artwork.legacyId,
                                        artwork_slug: selected.artwork.slug,
                                    })
                                }
                            >
                                View artwork <ArrowRight size={16} />
                            </Link>
                            <Link className="lw-button lw-button-ghost" href={`/contact?artwork=${selected.artwork.legacyId}`}>
                                <MessageCircle size={15} /> Ask Jill
                            </Link>
                            <Link className="lw-button lw-button-ghost" href={`/work/${selected.artwork.slug}#view-at-scale`}>
                                <Ruler size={15} /> View at scale
                            </Link>
                        </div>
                    </>
                ) : null}
            </aside>

            <section className="lw-viewing-room-list" aria-label="Artwork on this wall">
                <header>
                    <span className="lw-eyebrow">On this wall</span>
                    <h2>Explore every work.</h2>
                </header>
                <ol>
                    {wall.placements.map((placement, placementIndex) => (
                        <li key={placement.id}>
                            <button type="button" className="lw-viewing-card" onClick={() => select(placement)}>
                                <span className="lw-viewing-card-image">
                                    <ArtworkPresentationImage
                                        src={placement.artwork.imageUrl}
                                        crop={placement.artwork.presentationCrop}
                                        alt={placement.artwork.title}
                                        fill
                                        quality={95}
                                        sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw"
                                    />
                                    <span className="lw-viewing-card-number">{String(placementIndex + 1).padStart(2, '0')}</span>
                                    <span className="lw-viewing-card-open">
                                        View details <ArrowRight size={15} />
                                    </span>
                                </span>
                                <span className="lw-viewing-card-meta">
                                    <span>
                                        <strong>{placement.artwork.title}</strong>
                                        <em>
                                            {placement.artwork.sold
                                                ? 'Sold'
                                                : placement.artwork.available
                                                  ? money(placement.artwork.priceCents)
                                                  : 'Private collection'}
                                        </em>
                                    </span>
                                    <small>
                                        {placement.artwork.medium || 'Original artwork'} · {placement.artwork.widthInches} ×{' '}
                                        {placement.artwork.heightInches} in
                                    </small>
                                </span>
                            </button>
                        </li>
                    ))}
                </ol>
            </section>
        </div>
    );
}
