'use client';

import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    Check,
    CircleAlert,
    Copy,
    Eye,
    Grip,
    Plus,
    Save,
    Search,
    Send,
    Settings2,
    Trash2,
    Undo2,
    Redo2,
    WandSparkles,
    X,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { FunctionReturnType } from 'convex/server';
import type { api } from '../../../convex/_generated/api';
import type { PiecesWithImages } from '@/types/artwork';
import { artworkScaleDimensions } from '@/lib/artwork';
import { ArtworkPresentationImage } from '@/components/lit-wall/ArtworkPresentationImage';
import {
    archiveGalleryWall,
    duplicateGalleryWall,
    moveGalleryWall,
    publishGalleryWall,
    saveGalleryWall,
    unpublishGalleryWall,
    type GalleryWallInput,
} from '@/app/admin/walls/actions';
import { galleryWallLayoutIssues } from '@shared/galleryWallLayout';
import { suggestGalleryWallLayout } from '@shared/galleryWallSuggestions';
import { normalizeGalleryWallLabelMode } from '@shared/galleryWallLabels';
import { ARTWORK_CATEGORIES, artworkCategoryLabel, type ArtworkCategoryId } from '@shared/artworkCategories';
import {
    GALLERY_WALL_PRESETS,
    galleryWallPlacementBounds,
    galleryWallPreset,
    galleryWallSceneAspectRatio,
    galleryWallSurfaceStyle,
    type GalleryWallPresetKey,
} from '@/lib/galleryWallPresets';

type OwnerWalls = FunctionReturnType<typeof api.galleryWalls.listOwner>;
type Placement = GalleryWallInput['placements'][number];
type ArtworkAvailabilityFilter = 'all' | 'available' | 'sold' | 'private';
type ArtworkSort = 'title' | 'size-asc' | 'size-desc' | 'price-asc' | 'price-desc';

const ARTWORK_LABEL_OPTIONS = [
    { value: 'hidden', label: 'Hidden', description: 'Artwork only' },
    { value: 'bottom-left', label: 'Below left', description: 'Aligned to the artwork’s left edge' },
    { value: 'bottom-right', label: 'Below right', description: 'Aligned to the artwork’s right edge' },
] as const;

const EMPTY_WALL: GalleryWallInput = {
    title: 'New gallery wall',
    narrative: '',
    widthInches: 144,
    heightInches: 96,
    background: { kind: 'preset', preset: 'white-oak' },
    floorStyle: 'oak',
    lighting: 'gallery',
    artworkLabelMode: 'hidden',
    placements: [],
};

function wallInput(wall: OwnerWalls[number]): GalleryWallInput {
    return {
        wallId: String(wall._id),
        expectedRevision: wall.draftRevision,
        title: wall.title,
        narrative: wall.narrative ?? '',
        widthInches: wall.widthInches,
        heightInches: wall.heightInches,
        background: wall.background.kind === 'preset' ? wall.background : { kind: 'preset', preset: 'white-oak' },
        floorStyle: wall.floorStyle,
        lighting: wall.lighting,
        artworkLabelMode: normalizeGalleryWallLabelMode(wall.artworkLabelMode),
        placements: wall.placements,
    };
}

function artworkLabelPrice(artwork: PiecesWithImages) {
    if (artwork.sold) return 'Sold';
    if (!artwork.available) return 'Private collection';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(artwork.price);
}

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}

function nearestSnap(value: number, candidates: number[], threshold = 1.5) {
    const nearest = candidates.reduce<{ value: number; distance: number } | null>((best, candidate) => {
        const distance = Math.abs(candidate - value);
        return !best || distance < best.distance ? { value: candidate, distance } : best;
    }, null);
    return nearest && nearest.distance <= threshold ? nearest.value : null;
}

function formattedWallDate(timestamp: number) {
    return new Intl.DateTimeFormat('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(
        new Date(timestamp),
    );
}

export function OwnerGalleryWallManager({ initialWalls, artworks }: { initialWalls: OwnerWalls; artworks: PiecesWithImages[] }) {
    const router = useRouter();
    const [selectedId, setSelectedId] = useState<string | 'new'>(initialWalls[0] ? String(initialWalls[0]._id) : 'new');
    const selectedWall = initialWalls.find((wall) => String(wall._id) === selectedId);
    const [draft, setDraft] = useState<GalleryWallInput>(() => (initialWalls[0] ? wallInput(initialWalls[0]) : { ...EMPTY_WALL }));
    const [history, setHistory] = useState<GalleryWallInput[]>([]);
    const [future, setFuture] = useState<GalleryWallInput[]>([]);
    const [artworkPickerOpen, setArtworkPickerOpen] = useState(false);
    const artworkPickerRef = useRef<HTMLElement>(null);
    const artworkPickerTriggerRef = useRef<HTMLButtonElement>(null);
    const [search, setSearch] = useState('');
    const [availabilityFilter, setAvailabilityFilter] = useState<ArtworkAvailabilityFilter>('all');
    const [categoryFilter, setCategoryFilter] = useState<'all' | ArtworkCategoryId>('all');
    const [mediumFilter, setMediumFilter] = useState('all');
    const [artworkSort, setArtworkSort] = useState<ArtworkSort>('title');
    const [nudgeStep, setNudgeStep] = useState<0.25 | 1>(1);
    const [selectedPlacements, setSelectedPlacements] = useState<string[]>([]);
    const [snapGuides, setSnapGuides] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
    const selectedPlacement = selectedPlacements.at(-1) ?? null;
    const [message, setMessage] = useState<{ tone: 'good' | 'warning'; text: string } | null>(null);
    const [suggestionSeed, setSuggestionSeed] = useState(() => Date.now());
    const [pending, startTransition] = useTransition();
    const artworkById = useMemo(() => new Map(artworks.map((artwork) => [artwork.id, artwork])), [artworks]);
    const mediums = useMemo(
        () => Array.from(new Set(artworks.map((artwork) => artwork.piece_type).filter((value): value is string => Boolean(value)))).sort(),
        [artworks],
    );
    const visibleArtworks = useMemo(() => {
        const needle = search.trim().toLowerCase();
        return artworks
            .filter((artwork) => {
                const categories = artwork.categories ?? [];
                const searchable =
                    `${artwork.title} ${artwork.piece_type ?? ''} ${categories.map(artworkCategoryLabel).join(' ')}`.toLowerCase();
                if (needle && !searchable.includes(needle)) return false;
                if (categoryFilter !== 'all' && !categories.includes(categoryFilter)) return false;
                if (mediumFilter !== 'all' && artwork.piece_type !== mediumFilter) return false;
                if (availabilityFilter === 'available' && (artwork.sold || !artwork.available)) return false;
                if (availabilityFilter === 'sold' && !artwork.sold) return false;
                if (availabilityFilter === 'private' && (artwork.sold || artwork.available)) return false;
                return true;
            })
            .sort((a, b) => {
                const aSize = artworkScaleDimensions(a);
                const bSize = artworkScaleDimensions(b);
                const aArea = aSize ? aSize.widthInches * aSize.heightInches : Number.POSITIVE_INFINITY;
                const bArea = bSize ? bSize.widthInches * bSize.heightInches : Number.POSITIVE_INFINITY;
                if (artworkSort === 'size-asc') return aArea - bArea || a.title.localeCompare(b.title);
                if (artworkSort === 'size-desc') return bArea - aArea || a.title.localeCompare(b.title);
                if (artworkSort === 'price-asc') return a.price - b.price || a.title.localeCompare(b.title);
                if (artworkSort === 'price-desc') return b.price - a.price || a.title.localeCompare(b.title);
                return a.title.localeCompare(b.title);
            });
    }, [artworks, search, availabilityFilter, categoryFilter, mediumFilter, artworkSort]);
    const unpublishable = draft.placements.filter((item) => !artworkById.get(item.artworkLegacyId));
    const placementGeometry = draft.placements.flatMap((item) => {
        const artwork = artworkById.get(item.artworkLegacyId);
        const size = artwork ? artworkScaleDimensions(artwork) : null;
        return size ? [{ ...item, widthInches: size.widthInches, heightInches: size.heightInches }] : [];
    });
    const layoutIssues = galleryWallLayoutIssues({ widthInches: draft.widthInches, heightInches: draft.heightInches }, placementGeometry);
    const draftChangedAfterPublish = Boolean(
        selectedWall?.publishedSnapshot && selectedWall.publishedSnapshot.revision !== draft.expectedRevision,
    );

    useEffect(() => {
        if (!artworkPickerOpen) return;
        const previousOverflow = document.body.style.overflow;
        const trigger = artworkPickerTriggerRef.current;
        document.body.style.overflow = 'hidden';
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setArtworkPickerOpen(false);
                return;
            }
            if (event.key !== 'Tab' || !artworkPickerRef.current) return;
            const focusable = Array.from(
                artworkPickerRef.current.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), input:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
                ),
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
        };
        window.addEventListener('keydown', closeOnEscape);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', closeOnEscape);
            window.requestAnimationFrame(() => trigger?.focus());
        };
    }, [artworkPickerOpen]);

    const change = (next: GalleryWallInput | ((current: GalleryWallInput) => GalleryWallInput), record = true) => {
        setDraft((current) => {
            const value = typeof next === 'function' ? next(current) : next;
            if (record) {
                setHistory((items) => [...items.slice(-29), current]);
                setFuture([]);
            }
            return value;
        });
        setMessage(null);
    };

    const selectWall = (id: string | 'new') => {
        const wall = initialWalls.find((item) => String(item._id) === id);
        setSelectedId(id);
        setDraft(wall ? wallInput(wall) : { ...EMPTY_WALL, placements: [] });
        setHistory([]);
        setFuture([]);
        setSelectedPlacements([]);
        setMessage(null);
    };

    const undo = () => {
        const previous = history.at(-1);
        if (!previous) return;
        setFuture((items) => [draft, ...items]);
        setHistory((items) => items.slice(0, -1));
        setDraft(previous);
    };
    const redo = () => {
        const next = future[0];
        if (!next) return;
        setHistory((items) => [...items, draft]);
        setFuture((items) => items.slice(1));
        setDraft(next);
    };

    const suggestLayout = () => {
        const suggested = suggestGalleryWallLayout(
            { widthInches: draft.widthInches, heightInches: draft.heightInches },
            placementGeometry,
            suggestionSeed,
            {
                bounds: galleryWallPlacementBounds(draft.background.preset as GalleryWallPresetKey, draft.widthInches, draft.heightInches),
            },
        );
        const byId = new Map(suggested.map((placement) => [placement.id, placement]));
        change((current) => ({
            ...current,
            placements: current.placements.map((placement) => {
                const next = byId.get(placement.id);
                return next ? { ...placement, centerXInches: next.centerXInches, centerYInches: next.centerYInches } : placement;
            }),
        }));
        setSuggestionSeed((current) => current + 1);
        setSelectedPlacements([]);
        setMessage({ tone: 'good', text: 'Suggested a starting layout. Every artwork remains draggable and this step can be undone.' });
    };

    const addArtwork = (artwork: PiecesWithImages) => {
        const size = artworkScaleDimensions(artwork);
        if (!size) return;
        const offset = draft.placements.length * 4;
        const placement: Placement = {
            id: `placement-${artwork.id}-${Date.now()}`,
            artworkLegacyId: artwork.id,
            centerXInches: clamp(draft.widthInches / 2 + offset, size.widthInches / 2, draft.widthInches - size.widthInches / 2),
            centerYInches: clamp(draft.heightInches / 2 + offset / 2, size.heightInches / 2, draft.heightInches - size.heightInches / 2),
        };
        change((current) => ({ ...current, placements: [...current.placements, placement] }));
        setSelectedPlacements([placement.id]);
    };

    const movePlacement = (id: string, centerXInches: number, centerYInches: number, record = false) => {
        change(
            (current) => ({
                ...current,
                placements: current.placements.map((item) => (item.id === id ? { ...item, centerXInches, centerYInches } : item)),
            }),
            record,
        );
    };

    const alignSelected = (axis: 'left' | 'center-x' | 'right' | 'top' | 'center-y' | 'bottom') => {
        if (!selectedPlacements.length) return;
        const bounds = galleryWallPlacementBounds(draft.background.preset as GalleryWallPresetKey, draft.widthInches, draft.heightInches);
        change((current) => ({
            ...current,
            placements: current.placements.map((item) => {
                if (!selectedPlacements.includes(item.id)) return item;
                const artwork = artworkById.get(item.artworkLegacyId);
                const size = artwork ? artworkScaleDimensions(artwork) : null;
                if (!size) return item;
                if (axis === 'left') return { ...item, centerXInches: bounds.left + size.widthInches / 2 };
                if (axis === 'center-x') return { ...item, centerXInches: (bounds.left + bounds.right) / 2 };
                if (axis === 'right') return { ...item, centerXInches: bounds.right - size.widthInches / 2 };
                if (axis === 'top') return { ...item, centerYInches: bounds.top + size.heightInches / 2 };
                if (axis === 'center-y') return { ...item, centerYInches: (bounds.top + bounds.bottom) / 2 };
                return { ...item, centerYInches: bounds.bottom - size.heightInches / 2 };
            }),
        }));
    };

    const nudgeSelected = (deltaX: number, deltaY: number) => {
        if (!selectedPlacements.length) return;
        change((current) => ({
            ...current,
            placements: current.placements.map((item) => {
                if (!selectedPlacements.includes(item.id)) return item;
                const artwork = artworkById.get(item.artworkLegacyId);
                const size = artwork ? artworkScaleDimensions(artwork) : null;
                if (!size) return item;
                return {
                    ...item,
                    centerXInches: clamp(item.centerXInches + deltaX, size.widthInches / 2, draft.widthInches - size.widthInches / 2),
                    centerYInches: clamp(item.centerYInches + deltaY, size.heightInches / 2, draft.heightInches - size.heightInches / 2),
                };
            }),
        }));
    };

    const distributeSelected = (axis: 'horizontal' | 'vertical') => {
        if (selectedPlacements.length < 3) return;
        const geometryById = new Map(placementGeometry.map((item) => [item.id, item]));
        const selected = draft.placements
            .filter((item) => selectedPlacements.includes(item.id) && geometryById.has(item.id))
            .sort((a, b) => (axis === 'horizontal' ? a.centerXInches - b.centerXInches : a.centerYInches - b.centerYInches));
        if (selected.length < 3) return;
        const sizeOf = (item: Placement) => {
            const geometry = geometryById.get(item.id)!;
            return axis === 'horizontal' ? geometry.widthInches : geometry.heightInches;
        };
        const startCenter = axis === 'horizontal' ? selected[0].centerXInches : selected[0].centerYInches;
        const endCenter = axis === 'horizontal' ? selected.at(-1)!.centerXInches : selected.at(-1)!.centerYInches;
        const startEdge = startCenter - sizeOf(selected[0]) / 2;
        const endEdge = endCenter + sizeOf(selected.at(-1)!) / 2;
        const totalSize = selected.reduce((sum, item) => sum + sizeOf(item), 0);
        const gap = (endEdge - startEdge - totalSize) / (selected.length - 1);
        let cursor = startEdge;
        const positions = new Map(
            selected.map((item) => {
                const size = sizeOf(item);
                const position = cursor + size / 2;
                cursor += size + gap;
                return [item.id, position];
            }),
        );
        change((current) => ({
            ...current,
            placements: current.placements.map((item) => {
                const position = positions.get(item.id);
                if (position === undefined) return item;
                return axis === 'horizontal' ? { ...item, centerXInches: position } : { ...item, centerYInches: position };
            }),
        }));
    };

    const persist = async () => {
        const result = await saveGalleryWall(draft);
        if (!result.success) {
            setMessage({ tone: 'warning', text: result.error });
            return null;
        }
        setDraft((current) => ({ ...current, wallId: String(result.wallId), expectedRevision: result.draftRevision }));
        setSelectedId(String(result.wallId));
        setHistory([]);
        setFuture([]);
        setMessage({ tone: 'good', text: 'Draft saved.' });
        router.refresh();
        return String(result.wallId);
    };

    const save = () => startTransition(() => void persist());
    const publish = () =>
        startTransition(async () => {
            const wallId = await persist();
            if (!wallId) return;
            const result = await publishGalleryWall(wallId);
            setMessage(result.success ? { tone: 'good', text: 'Gallery wall published.' } : { tone: 'warning', text: result.error });
            router.refresh();
        });

    return (
        <div className="owner-wall-manager">
            <aside className="owner-wall-list">
                <header>
                    <div>
                        <strong>Walls</strong>
                        <small>{initialWalls.length} saved</small>
                    </div>
                    <button type="button" onClick={() => selectWall('new')}>
                        <Plus size={15} /> New wall
                    </button>
                </header>
                <div>
                    {initialWalls.map((wall) => (
                        <div key={wall._id} className={selectedId === String(wall._id) ? 'is-active' : undefined}>
                            <button type="button" className="owner-wall-list-select" onClick={() => selectWall(String(wall._id))}>
                                <span>
                                    <strong>{wall.title}</strong>
                                    <small>
                                        {wall.placements.length} artwork{wall.placements.length === 1 ? '' : 's'} · updated{' '}
                                        {formattedWallDate(wall.updatedAt)}
                                    </small>
                                </span>
                                <em className={`is-${wall.status}`}>{wall.status}</em>
                            </button>
                            <span className="owner-wall-list-state">
                                <span>
                                    <button
                                        type="button"
                                        title="Move wall earlier"
                                        aria-label={`Move ${wall.title} earlier`}
                                        onClick={() => {
                                            startTransition(async () => {
                                                await moveGalleryWall(String(wall._id), 'up');
                                                router.refresh();
                                            });
                                        }}
                                    >
                                        <ArrowUp size={12} />
                                    </button>
                                    <button
                                        type="button"
                                        title="Move wall later"
                                        aria-label={`Move ${wall.title} later`}
                                        onClick={() => {
                                            startTransition(async () => {
                                                await moveGalleryWall(String(wall._id), 'down');
                                                router.refresh();
                                            });
                                        }}
                                    >
                                        <ArrowDown size={12} />
                                    </button>
                                </span>
                            </span>
                        </div>
                    ))}
                </div>
            </aside>

            <section className="owner-wall-workspace">
                <header className="owner-wall-toolbar">
                    <div>
                        <span>{draft.wallId ? 'Editing wall' : 'Unsaved wall'}</span>
                        <strong>{draft.title}</strong>
                    </div>
                    <div>
                        {selectedWall?.status === 'published' ? (
                            <Link href={`/viewing-room?wall=${encodeURIComponent(selectedWall.slug)}`} target="_blank">
                                <Eye size={15} /> Preview
                            </Link>
                        ) : null}
                        {draft.wallId ? (
                            <button
                                type="button"
                                onClick={() =>
                                    startTransition(async () => {
                                        const result = await duplicateGalleryWall(draft.wallId!);
                                        if (result.success) {
                                            router.refresh();
                                            setMessage({ tone: 'good', text: 'Wall duplicated as a new draft.' });
                                        } else setMessage({ tone: 'warning', text: result.error });
                                    })
                                }
                            >
                                <Copy size={15} /> Duplicate
                            </button>
                        ) : null}
                        {selectedWall?.status === 'published' ? (
                            <button
                                type="button"
                                onClick={() =>
                                    startTransition(async () => {
                                        const result = await unpublishGalleryWall(String(selectedWall._id));
                                        setMessage(
                                            result.success
                                                ? { tone: 'good', text: 'Wall moved back to draft.' }
                                                : { tone: 'warning', text: result.error },
                                        );
                                        router.refresh();
                                    })
                                }
                            >
                                Unpublish
                            </button>
                        ) : null}
                        <button type="button" onClick={save} disabled={pending}>
                            <Save size={15} /> Save draft
                        </button>
                        <button
                            className="is-primary"
                            type="button"
                            onClick={publish}
                            disabled={pending || !draft.placements.length || Boolean(unpublishable.length) || !layoutIssues.valid}
                        >
                            <Send size={15} /> Publish
                        </button>
                    </div>
                </header>
                {message ? <p className={`owner-wall-message is-${message.tone}`}>{message.text}</p> : null}
                {draftChangedAfterPublish ? (
                    <p className="owner-wall-message is-warning">
                        This draft differs from the published wall. Save, preview, and publish again when the revision is ready.
                    </p>
                ) : null}
                {!layoutIssues.valid ? (
                    <p className="owner-wall-message is-warning">
                        Resolve{' '}
                        {layoutIssues.overlappingPairs.length
                            ? `${layoutIssues.overlappingPairs.length} overlap${layoutIssues.overlappingPairs.length === 1 ? '' : 's'}`
                            : ''}
                        {layoutIssues.overlappingPairs.length && layoutIssues.outOfBoundsIds.length ? ' and ' : ''}
                        {layoutIssues.outOfBoundsIds.length
                            ? `${layoutIssues.outOfBoundsIds.length} out-of-bounds placement${layoutIssues.outOfBoundsIds.length === 1 ? '' : 's'}`
                            : ''}{' '}
                        before publishing.
                    </p>
                ) : null}
                <div className="owner-wall-settings">
                    <label>
                        <span>Wall title</span>
                        <input value={draft.title} onChange={(event) => change({ ...draft, title: event.target.value })} />
                    </label>
                    <fieldset className="owner-wall-environments">
                        <legend>Gallery environment</legend>
                        <p>Choose the room collectors will see behind this arrangement.</p>
                        <div>
                            {GALLERY_WALL_PRESETS.map((preset) => {
                                const selected = draft.background.preset === preset.key;
                                return (
                                    <button
                                        key={preset.key}
                                        type="button"
                                        className={selected ? 'is-selected' : undefined}
                                        aria-pressed={selected}
                                        onClick={() =>
                                            change({
                                                ...draft,
                                                background: { kind: 'preset', preset: preset.key },
                                                floorStyle: preset.floorStyle,
                                                lighting: preset.lighting,
                                            })
                                        }
                                    >
                                        <span
                                            className="owner-wall-environment-preview"
                                            style={{ ...galleryWallSurfaceStyle(preset.key), aspectRatio: preset.sceneAspectRatio }}
                                        />
                                        <span>
                                            <strong>{preset.label}</strong>
                                            <small>{preset.description}</small>
                                        </span>
                                        {selected ? <Check size={15} aria-hidden="true" /> : null}
                                    </button>
                                );
                            })}
                        </div>
                    </fieldset>
                    <fieldset className="owner-wall-labels">
                        <legend>Artwork labels</legend>
                        <p>Optionally show a museum-style title and price card below every work on this wall.</p>
                        <div>
                            {ARTWORK_LABEL_OPTIONS.map((option) => {
                                const selected = draft.artworkLabelMode === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={selected ? 'is-selected' : undefined}
                                        aria-pressed={selected}
                                        onClick={() => change({ ...draft, artworkLabelMode: option.value })}
                                    >
                                        <span className={`owner-wall-label-diagram is-${option.value}`} aria-hidden="true">
                                            <i />
                                            {option.value !== 'hidden' ? <b /> : null}
                                        </span>
                                        <span>
                                            <strong>{option.label}</strong>
                                            <small>{option.description}</small>
                                        </span>
                                        {selected ? <Check size={14} aria-hidden="true" /> : null}
                                    </button>
                                );
                            })}
                        </div>
                    </fieldset>
                    <label className="is-wide">
                        <span>Curator note</span>
                        <input
                            value={draft.narrative}
                            placeholder="Optional context for this arrangement"
                            onChange={(event) => change({ ...draft, narrative: event.target.value })}
                        />
                    </label>
                    <details className="owner-wall-advanced is-wide">
                        <summary>
                            <span>
                                <Settings2 size={15} />
                                <strong>Advanced wall calibration</strong>
                            </span>
                            <small>
                                {draft.widthInches} × {draft.heightInches} in
                            </small>
                        </summary>
                        <div>
                            <p>
                                Physical wall size controls the artwork’s relative scale. It does not crop or zoom the room photograph.
                                Change this only when the photographed wall has been measured.
                            </p>
                            <div>
                                <label>
                                    <span>Measured wall width (in)</span>
                                    <input
                                        type="number"
                                        min="48"
                                        step="1"
                                        value={draft.widthInches}
                                        onChange={(event) => change({ ...draft, widthInches: Number(event.target.value) })}
                                    />
                                </label>
                                <label>
                                    <span>Measured wall height (in)</span>
                                    <input
                                        type="number"
                                        min="48"
                                        step="1"
                                        value={draft.heightInches}
                                        onChange={(event) => change({ ...draft, heightInches: Number(event.target.value) })}
                                    />
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const recommended = galleryWallPreset(
                                            draft.background.preset as GalleryWallPresetKey,
                                        ).recommendedWallSize;
                                        change({
                                            ...draft,
                                            widthInches: recommended.widthInches,
                                            heightInches: recommended.heightInches,
                                        });
                                    }}
                                >
                                    Reset to recommended
                                </button>
                            </div>
                        </div>
                    </details>
                </div>

                <div className="owner-wall-canvas-shell">
                    <header className="owner-wall-canvas-tools">
                        <div>
                            <strong>Arrange the wall</strong>
                            <small>Drag pieces into place. Shift-click to select several.</small>
                        </div>
                        <div>
                            <button type="button" onClick={undo} disabled={!history.length} aria-label="Undo" title="Undo">
                                <Undo2 size={16} />
                            </button>
                            <button type="button" onClick={redo} disabled={!future.length} aria-label="Redo" title="Redo">
                                <Redo2 size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={suggestLayout}
                                disabled={!draft.placements.length || placementGeometry.length !== draft.placements.length}
                                title="Generate another editable starting arrangement"
                            >
                                <WandSparkles size={15} /> Suggest layout
                            </button>
                            {draft.placements.length ? (
                                <button type="button" onClick={() => setSelectedPlacements(draft.placements.map((item) => item.id))}>
                                    Select all
                                </button>
                            ) : null}
                            <button
                                ref={artworkPickerTriggerRef}
                                className="is-primary"
                                type="button"
                                onClick={() => setArtworkPickerOpen(true)}
                            >
                                <Plus size={15} /> Add artwork
                            </button>
                        </div>
                    </header>
                    <div
                        className={`owner-wall-canvas is-${draft.background.preset} has-${draft.lighting}-light floor-${draft.floorStyle}`}
                        style={{
                            ...galleryWallSurfaceStyle(draft.background.preset as GalleryWallPresetKey),
                            aspectRatio: galleryWallSceneAspectRatio(draft.background.preset as GalleryWallPresetKey),
                        }}
                        aria-label={`Arrangement canvas for ${draft.title}`}
                    >
                        {draft.placements.map((item) => {
                            const artwork = artworkById.get(item.artworkLegacyId);
                            const size = artwork ? artworkScaleDimensions(artwork) : null;
                            if (!artwork || !size) return null;
                            const left = (item.centerXInches / draft.widthInches) * 100;
                            const top = (item.centerYInches / draft.heightInches) * 100;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`owner-wall-piece ${selectedPlacements.includes(item.id) ? 'is-selected' : ''}`}
                                    style={{
                                        left: `${left}%`,
                                        top: `${top}%`,
                                        width: `${(size.widthInches / draft.widthInches) * 100}%`,
                                        aspectRatio: `${size.widthInches} / ${size.heightInches}`,
                                    }}
                                    onPointerDown={(event) => {
                                        event.currentTarget.setPointerCapture(event.pointerId);
                                        setSelectedPlacements((current) =>
                                            event.shiftKey
                                                ? current.includes(item.id)
                                                    ? current.filter((id) => id !== item.id)
                                                    : [...current, item.id]
                                                : [item.id],
                                        );
                                        setHistory((items) => [...items.slice(-29), draft]);
                                        setFuture([]);
                                    }}
                                    onPointerMove={(event) => {
                                        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
                                        const canvas = event.currentTarget.parentElement?.getBoundingClientRect();
                                        if (!canvas) return;
                                        const x = ((event.clientX - canvas.left) / canvas.width) * draft.widthInches;
                                        const y = ((event.clientY - canvas.top) / canvas.height) * draft.heightInches;
                                        const otherGeometry = placementGeometry.filter((candidate) => candidate.id !== item.id);
                                        const xCandidates = [
                                            draft.widthInches / 2,
                                            ...otherGeometry.flatMap((candidate) => [
                                                candidate.centerXInches,
                                                candidate.centerXInches - candidate.widthInches / 2 + size.widthInches / 2,
                                                candidate.centerXInches + candidate.widthInches / 2 - size.widthInches / 2,
                                            ]),
                                        ];
                                        const yCandidates = [
                                            draft.heightInches / 2,
                                            ...otherGeometry.flatMap((candidate) => [
                                                candidate.centerYInches,
                                                candidate.centerYInches - candidate.heightInches / 2 + size.heightInches / 2,
                                                candidate.centerYInches + candidate.heightInches / 2 - size.heightInches / 2,
                                            ]),
                                        ];
                                        for (let first = 0; first < otherGeometry.length; first += 1) {
                                            for (let second = first + 1; second < otherGeometry.length; second += 1) {
                                                xCandidates.push(
                                                    (otherGeometry[first].centerXInches + otherGeometry[second].centerXInches) / 2,
                                                );
                                                yCandidates.push(
                                                    (otherGeometry[first].centerYInches + otherGeometry[second].centerYInches) / 2,
                                                );
                                            }
                                        }
                                        const snappedX = nearestSnap(x, xCandidates);
                                        const snappedY = nearestSnap(y, yCandidates);
                                        setSnapGuides({ x: snappedX, y: snappedY });
                                        movePlacement(
                                            item.id,
                                            clamp(snappedX ?? x, size.widthInches / 2, draft.widthInches - size.widthInches / 2),
                                            clamp(snappedY ?? y, size.heightInches / 2, draft.heightInches - size.heightInches / 2),
                                        );
                                    }}
                                    onPointerUp={(event) => {
                                        if (event.currentTarget.hasPointerCapture(event.pointerId))
                                            event.currentTarget.releasePointerCapture(event.pointerId);
                                        setSnapGuides({ x: null, y: null });
                                    }}
                                    onPointerCancel={() => setSnapGuides({ x: null, y: null })}
                                    onKeyDown={(event) => {
                                        const amount = event.shiftKey ? 0.25 : 1;
                                        const delta =
                                            event.key === 'ArrowLeft'
                                                ? [-amount, 0]
                                                : event.key === 'ArrowRight'
                                                  ? [amount, 0]
                                                  : event.key === 'ArrowUp'
                                                    ? [0, -amount]
                                                    : event.key === 'ArrowDown'
                                                      ? [0, amount]
                                                      : null;
                                        if (!delta) return;
                                        event.preventDefault();
                                        movePlacement(
                                            item.id,
                                            clamp(
                                                item.centerXInches + delta[0],
                                                size.widthInches / 2,
                                                draft.widthInches - size.widthInches / 2,
                                            ),
                                            clamp(
                                                item.centerYInches + delta[1],
                                                size.heightInches / 2,
                                                draft.heightInches - size.heightInches / 2,
                                            ),
                                            true,
                                        );
                                    }}
                                    aria-label={`${artwork.title}. Drag or use arrow keys to position.`}
                                >
                                    <ArtworkPresentationImage
                                        src={artwork.image_path}
                                        crop={artwork.presentation_crop}
                                        alt=""
                                        fill
                                        quality={95}
                                        sizes="25vw"
                                    />
                                    <span className="owner-wall-piece-drag-label">
                                        <Grip size={12} /> {artwork.title}
                                    </span>
                                    {draft.artworkLabelMode !== 'hidden' ? (
                                        <span className={`owner-wall-piece-card is-${draft.artworkLabelMode}`} aria-hidden="true">
                                            <strong>{artwork.title}</strong>
                                            <small>{artworkLabelPrice(artwork)}</small>
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                        {snapGuides.x !== null ? (
                            <span
                                className="owner-wall-guide is-x"
                                style={{ left: `${(snapGuides.x / draft.widthInches) * 100}%` }}
                                aria-hidden="true"
                            />
                        ) : null}
                        {snapGuides.y !== null ? (
                            <span
                                className="owner-wall-guide is-y"
                                style={{ top: `${(snapGuides.y / draft.heightInches) * 100}%` }}
                                aria-hidden="true"
                            />
                        ) : null}
                        {!draft.placements.length ? (
                            <div className="owner-wall-empty">
                                <Grip size={22} />
                                <strong>Build the wall</strong>
                                <p>Add artwork from the library, then drag it into place.</p>
                            </div>
                        ) : null}
                    </div>
                    <footer>
                        <span>
                            {draft.widthInches} × {draft.heightInches} in wall
                        </span>
                        <span>Arrow keys move 1 in · Shift + arrow moves ¼ in · Shift-click selects several</span>
                    </footer>
                </div>

                <section className="owner-wall-selection">
                    <header>
                        <div>
                            <strong>Fine tune</strong>
                            <small>
                                {selectedPlacement
                                    ? `${selectedPlacements.length} artwork${selectedPlacements.length === 1 ? '' : 's'} selected`
                                    : 'Select artwork on the wall to reveal precise arrangement controls.'}
                            </small>
                        </div>
                        {selectedPlacement ? (
                            <button type="button" onClick={() => setSelectedPlacements([])}>
                                Clear selection
                            </button>
                        ) : null}
                    </header>
                    {selectedPlacement
                        ? (() => {
                              const placement = draft.placements.find((item) => item.id === selectedPlacement);
                              const artwork = placement ? artworkById.get(placement.artworkLegacyId) : null;
                              const size = artwork ? artworkScaleDimensions(artwork) : null;
                              if (!placement || !artwork || !size) return null;
                              return (
                                  <div className="owner-wall-fine-tune">
                                      <div className="owner-wall-selection-summary">
                                          <strong>
                                              {selectedPlacements.length > 1 ? `${selectedPlacements.length} artworks` : artwork.title}
                                          </strong>
                                          <small>
                                              {selectedPlacements.length > 1
                                                  ? 'These controls move every selected work as one deliberate arrangement.'
                                                  : `${size.widthInches} × ${size.heightInches} in · ${size.estimated ? 'estimated framed size' : 'verified/recorded size'}`}
                                          </small>
                                      </div>
                                      <fieldset>
                                          <legend>Align within the display area</legend>
                                          <div className="owner-wall-control-row">
                                              <button
                                                  type="button"
                                                  onClick={() => alignSelected('left')}
                                                  title="Align selected work to the left edge"
                                              >
                                                  Left
                                              </button>
                                              <button
                                                  type="button"
                                                  onClick={() => alignSelected('center-x')}
                                                  title="Center selected work horizontally"
                                              >
                                                  Center
                                              </button>
                                              <button
                                                  type="button"
                                                  onClick={() => alignSelected('right')}
                                                  title="Align selected work to the right edge"
                                              >
                                                  Right
                                              </button>
                                              <button
                                                  type="button"
                                                  onClick={() => alignSelected('top')}
                                                  title="Align selected work to the top edge"
                                              >
                                                  Top
                                              </button>
                                              <button
                                                  type="button"
                                                  onClick={() => alignSelected('center-y')}
                                                  title="Center selected work vertically"
                                              >
                                                  Middle
                                              </button>
                                              <button
                                                  type="button"
                                                  onClick={() => alignSelected('bottom')}
                                                  title="Align selected work to the bottom edge"
                                              >
                                                  Bottom
                                              </button>
                                          </div>
                                      </fieldset>
                                      <fieldset>
                                          <legend>Nudge precisely</legend>
                                          <div className="owner-wall-nudge-controls">
                                              <div className="owner-wall-nudge-pad" aria-label="Nudge selected artwork">
                                                  <button
                                                      type="button"
                                                      onClick={() => nudgeSelected(0, -nudgeStep)}
                                                      aria-label={`Move up ${nudgeStep} inches`}
                                                  >
                                                      <ArrowUp size={15} />
                                                  </button>
                                                  <button
                                                      type="button"
                                                      onClick={() => nudgeSelected(-nudgeStep, 0)}
                                                      aria-label={`Move left ${nudgeStep} inches`}
                                                  >
                                                      <ArrowLeft size={15} />
                                                  </button>
                                                  <span aria-hidden="true" />
                                                  <button
                                                      type="button"
                                                      onClick={() => nudgeSelected(nudgeStep, 0)}
                                                      aria-label={`Move right ${nudgeStep} inches`}
                                                  >
                                                      <ArrowRight size={15} />
                                                  </button>
                                                  <button
                                                      type="button"
                                                      onClick={() => nudgeSelected(0, nudgeStep)}
                                                      aria-label={`Move down ${nudgeStep} inches`}
                                                  >
                                                      <ArrowDown size={15} />
                                                  </button>
                                              </div>
                                              <div className="owner-wall-step-choice">
                                                  <span>Move by</span>
                                                  <button
                                                      type="button"
                                                      className={nudgeStep === 0.25 ? 'is-active' : undefined}
                                                      onClick={() => setNudgeStep(0.25)}
                                                  >
                                                      ¼ in
                                                  </button>
                                                  <button
                                                      type="button"
                                                      className={nudgeStep === 1 ? 'is-active' : undefined}
                                                      onClick={() => setNudgeStep(1)}
                                                  >
                                                      1 in
                                                  </button>
                                              </div>
                                          </div>
                                      </fieldset>
                                      <fieldset>
                                          <legend>Even spacing</legend>
                                          <div className="owner-wall-control-row">
                                              <button
                                                  type="button"
                                                  disabled={selectedPlacements.length < 3}
                                                  onClick={() => distributeSelected('horizontal')}
                                                  title="Space three or more selected works evenly from left to right"
                                              >
                                                  Across
                                              </button>
                                              <button
                                                  type="button"
                                                  disabled={selectedPlacements.length < 3}
                                                  onClick={() => distributeSelected('vertical')}
                                                  title="Space three or more selected works evenly from top to bottom"
                                              >
                                                  Down
                                              </button>
                                          </div>
                                          {selectedPlacements.length < 3 ? (
                                              <small>Select at least three works to distribute spacing.</small>
                                          ) : null}
                                      </fieldset>
                                      <button
                                          className="owner-wall-remove-selection"
                                          type="button"
                                          onClick={() => {
                                              change((current) => ({
                                                  ...current,
                                                  placements: current.placements.filter((item) => !selectedPlacements.includes(item.id)),
                                              }));
                                              setSelectedPlacements([]);
                                          }}
                                      >
                                          <Trash2 size={14} /> Remove {selectedPlacements.length > 1 ? 'selected artworks' : 'from wall'}
                                      </button>
                                  </div>
                              );
                          })()
                        : null}
                </section>

                {draft.wallId ? (
                    <button
                        className="owner-wall-archive"
                        type="button"
                        onClick={() =>
                            startTransition(async () => {
                                if (!window.confirm('Archive this wall? It will disappear from the public gallery.')) return;
                                await archiveGalleryWall(draft.wallId!);
                                router.refresh();
                                selectWall('new');
                            })
                        }
                    >
                        <Trash2 size={14} /> Archive wall
                    </button>
                ) : null}
            </section>
            {artworkPickerOpen ? (
                <div
                    className="owner-wall-picker-backdrop"
                    onMouseDown={(event) => {
                        if (event.currentTarget === event.target) setArtworkPickerOpen(false);
                    }}
                >
                    <section
                        ref={artworkPickerRef}
                        className="owner-wall-picker"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="owner-wall-picker-title"
                    >
                        <header>
                            <div>
                                <span>Artwork library</span>
                                <h2 id="owner-wall-picker-title">Choose work for {draft.title}</h2>
                                <p>
                                    Browse the active catalog with scale, status, medium, and collection context. You can add several works
                                    without closing this window.
                                </p>
                            </div>
                            <button type="button" onClick={() => setArtworkPickerOpen(false)} aria-label="Close artwork library">
                                <X size={22} />
                            </button>
                        </header>
                        <div className="owner-wall-picker-filters">
                            <label className="owner-wall-picker-search">
                                <span>Search</span>
                                <div>
                                    <Search size={16} aria-hidden="true" />
                                    <input
                                        autoFocus
                                        type="search"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Title, medium, or collection"
                                    />
                                </div>
                            </label>
                            <label>
                                <span>Status</span>
                                <select
                                    value={availabilityFilter}
                                    onChange={(event) => setAvailabilityFilter(event.target.value as ArtworkAvailabilityFilter)}
                                >
                                    <option value="all">All statuses</option>
                                    <option value="available">Available</option>
                                    <option value="sold">Sold</option>
                                    <option value="private">Private collection</option>
                                </select>
                            </label>
                            <label>
                                <span>Collection</span>
                                <select
                                    value={categoryFilter}
                                    onChange={(event) => setCategoryFilter(event.target.value as 'all' | ArtworkCategoryId)}
                                >
                                    <option value="all">All collections</option>
                                    {ARTWORK_CATEGORIES.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                <span>Medium</span>
                                <select value={mediumFilter} onChange={(event) => setMediumFilter(event.target.value)}>
                                    <option value="all">All media</option>
                                    {mediums.map((medium) => (
                                        <option key={medium} value={medium}>
                                            {medium}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                <span>Sort</span>
                                <select value={artworkSort} onChange={(event) => setArtworkSort(event.target.value as ArtworkSort)}>
                                    <option value="title">Title A–Z</option>
                                    <option value="size-asc">Size, small to large</option>
                                    <option value="size-desc">Size, large to small</option>
                                    <option value="price-asc">Price, low to high</option>
                                    <option value="price-desc">Price, high to low</option>
                                </select>
                            </label>
                        </div>
                        <div className="owner-wall-picker-results-summary">
                            <span>
                                <strong>{visibleArtworks.length}</strong> matching work{visibleArtworks.length === 1 ? '' : 's'}
                            </span>
                            <span>{draft.placements.length} currently on this wall</span>
                        </div>
                        <div className="owner-wall-picker-results">
                            {visibleArtworks.map((artwork) => {
                                const size = artworkScaleDimensions(artwork);
                                const categories = artwork.categories ?? [];
                                const alreadyPlaced = draft.placements.some((placement) => placement.artworkLegacyId === artwork.id);
                                return (
                                    <article key={artwork.id}>
                                        <div className="owner-wall-picker-image">
                                            <ArtworkPresentationImage
                                                src={artwork.small_image_path || artwork.image_path}
                                                crop={artwork.presentation_crop}
                                                alt={artwork.title}
                                                fill
                                                sizes="(max-width: 720px) 44vw, 220px"
                                            />
                                            <span className={`is-${artwork.sold ? 'sold' : artwork.available ? 'available' : 'private'}`}>
                                                {artwork.sold ? 'Sold' : artwork.available ? 'Available' : 'Private collection'}
                                            </span>
                                        </div>
                                        <div className="owner-wall-picker-card-body">
                                            <div>
                                                <h3 title={artwork.title}>{artwork.title}</h3>
                                                <strong>{artworkLabelPrice(artwork)}</strong>
                                            </div>
                                            <p>
                                                {artwork.piece_type || 'Medium needed'} ·{' '}
                                                {size ? `${size.widthInches} × ${size.heightInches} in` : 'Dimensions needed'}
                                            </p>
                                            <div className="owner-wall-picker-tags">
                                                {categories.length ? (
                                                    categories.map((category) => (
                                                        <span key={category}>{artworkCategoryLabel(category)}</span>
                                                    ))
                                                ) : (
                                                    <span>Uncategorized</span>
                                                )}
                                                {size?.estimated ? (
                                                    <span className="is-warning">
                                                        <CircleAlert size={10} /> Estimated frame
                                                    </span>
                                                ) : null}
                                            </div>
                                            <button type="button" disabled={!size} onClick={() => addArtwork(artwork)}>
                                                {size ? (
                                                    <>
                                                        <Plus size={14} /> {alreadyPlaced ? 'Add another' : 'Add to wall'}
                                                    </>
                                                ) : (
                                                    <>Fix dimensions first</>
                                                )}
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                            {!visibleArtworks.length ? (
                                <div className="owner-wall-picker-empty">
                                    <Search size={24} />
                                    <strong>No artwork matches these filters</strong>
                                    <p>Clear the filters to return to the full active catalog.</p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            setAvailabilityFilter('all');
                                            setCategoryFilter('all');
                                            setMediumFilter('all');
                                            setArtworkSort('title');
                                        }}
                                    >
                                        Clear filters
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </section>
                </div>
            ) : null}
        </div>
    );
}
