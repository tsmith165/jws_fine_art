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
    Send,
    Trash2,
    Undo2,
    Redo2,
    WandSparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
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
import { GALLERY_WALL_PRESETS, galleryWallSurfaceStyle, type GalleryWallPresetKey } from '@/lib/galleryWallPresets';

type OwnerWalls = FunctionReturnType<typeof api.galleryWalls.listOwner>;
type Placement = GalleryWallInput['placements'][number];

const ARTWORK_LABEL_OPTIONS = [
    { value: 'hidden', label: 'Hidden', description: 'Artwork only' },
    { value: 'left', label: 'Left', description: 'Beside the artwork' },
    { value: 'right', label: 'Right', description: 'Beside the artwork' },
    { value: 'bottom-left', label: 'Bottom left', description: 'Below the artwork' },
    { value: 'bottom-right', label: 'Bottom right', description: 'Below the artwork' },
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
        artworkLabelMode: wall.artworkLabelMode ?? 'hidden',
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

export function OwnerGalleryWallManager({ initialWalls, artworks }: { initialWalls: OwnerWalls; artworks: PiecesWithImages[] }) {
    const router = useRouter();
    const [selectedId, setSelectedId] = useState<string | 'new'>(initialWalls[0] ? String(initialWalls[0]._id) : 'new');
    const selectedWall = initialWalls.find((wall) => String(wall._id) === selectedId);
    const [draft, setDraft] = useState<GalleryWallInput>(() => (initialWalls[0] ? wallInput(initialWalls[0]) : { ...EMPTY_WALL }));
    const [history, setHistory] = useState<GalleryWallInput[]>([]);
    const [future, setFuture] = useState<GalleryWallInput[]>([]);
    const [search, setSearch] = useState('');
    const [selectedPlacements, setSelectedPlacements] = useState<string[]>([]);
    const [snapGuides, setSnapGuides] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
    const selectedPlacement = selectedPlacements.at(-1) ?? null;
    const [message, setMessage] = useState<{ tone: 'good' | 'warning'; text: string } | null>(null);
    const [suggestionSeed, setSuggestionSeed] = useState(() => Date.now());
    const [pending, startTransition] = useTransition();
    const artworkById = useMemo(() => new Map(artworks.map((artwork) => [artwork.id, artwork])), [artworks]);
    const visibleArtworks = useMemo(() => {
        const needle = search.trim().toLowerCase();
        return artworks
            .filter((artwork) => !needle || `${artwork.title} ${artwork.piece_type ?? ''}`.toLowerCase().includes(needle))
            .sort((a, b) => Number(Boolean(a.sold)) - Number(Boolean(b.sold)) || a.title.localeCompare(b.title));
    }, [artworks, search]);
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
        change((current) => ({
            ...current,
            placements: current.placements.map((item) => {
                if (!selectedPlacements.includes(item.id)) return item;
                const artwork = artworkById.get(item.artworkLegacyId);
                const size = artwork ? artworkScaleDimensions(artwork) : null;
                if (!size) return item;
                if (axis === 'left') return { ...item, centerXInches: size.widthInches / 2 };
                if (axis === 'center-x') return { ...item, centerXInches: draft.widthInches / 2 };
                if (axis === 'right') return { ...item, centerXInches: draft.widthInches - size.widthInches / 2 };
                if (axis === 'top') return { ...item, centerYInches: size.heightInches / 2 };
                if (axis === 'center-y') return { ...item, centerYInches: draft.heightInches / 2 };
                return { ...item, centerYInches: draft.heightInches - size.heightInches / 2 };
            }),
        }));
    };

    const distributeSelected = (axis: 'horizontal' | 'vertical') => {
        if (selectedPlacements.length < 3) return;
        const selected = draft.placements
            .filter((item) => selectedPlacements.includes(item.id))
            .sort((a, b) => (axis === 'horizontal' ? a.centerXInches - b.centerXInches : a.centerYInches - b.centerYInches));
        const start = axis === 'horizontal' ? selected[0].centerXInches : selected[0].centerYInches;
        const end = axis === 'horizontal' ? selected.at(-1)!.centerXInches : selected.at(-1)!.centerYInches;
        const step = (end - start) / (selected.length - 1);
        const positions = new Map(selected.map((item, index) => [item.id, start + step * index]));
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
                                        {new Date(wall.updatedAt).toLocaleDateString()}
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
                        <button type="button" onClick={undo} disabled={!history.length} aria-label="Undo">
                            <Undo2 size={16} />
                        </button>
                        <button type="button" onClick={redo} disabled={!future.length} aria-label="Redo">
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
                        {selectedWall?.status === 'published' ? (
                            <Link href={`/viewing-room/${selectedWall.slug}`} target="_blank">
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
                    <label>
                        <span>Wall width</span>
                        <input
                            type="number"
                            min="48"
                            step="1"
                            value={draft.widthInches}
                            onChange={(event) => change({ ...draft, widthInches: Number(event.target.value) })}
                        />
                    </label>
                    <label>
                        <span>Wall height</span>
                        <input
                            type="number"
                            min="48"
                            step="1"
                            value={draft.heightInches}
                            onChange={(event) => change({ ...draft, heightInches: Number(event.target.value) })}
                        />
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
                                        <span className="owner-wall-environment-preview" style={galleryWallSurfaceStyle(preset.key)} />
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
                        <p>Optionally show a museum-style title and price card beside every work on this wall.</p>
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
                </div>

                <div className="owner-wall-canvas-shell">
                    <div
                        className={`owner-wall-canvas is-${draft.background.preset} has-${draft.lighting}-light floor-${draft.floorStyle}`}
                        style={{
                            ...galleryWallSurfaceStyle(draft.background.preset as GalleryWallPresetKey),
                            aspectRatio: `${draft.widthInches} / ${draft.heightInches}`,
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
                            <strong>
                                {selectedPlacements.length > 1 ? `${selectedPlacements.length} selected placements` : 'Selected placement'}
                            </strong>
                            <small>
                                {selectedPlacement
                                    ? 'Align, distribute, or remove the selected artwork.'
                                    : 'Choose an artwork on the wall.'}
                            </small>
                        </div>
                        {selectedPlacement ? (
                            <button
                                type="button"
                                onClick={() => {
                                    change((current) => ({
                                        ...current,
                                        placements: current.placements.filter((item) => !selectedPlacements.includes(item.id)),
                                    }));
                                    setSelectedPlacements([]);
                                }}
                            >
                                <Trash2 size={14} /> Remove {selectedPlacements.length > 1 ? 'selected' : ''}
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
                                  <div className="owner-wall-selection-fields">
                                      <span>
                                          <strong>
                                              {selectedPlacements.length > 1 ? `${selectedPlacements.length} artworks` : artwork.title}
                                          </strong>
                                          <small>
                                              {selectedPlacements.length > 1
                                                  ? 'Alignment applies to every selected work.'
                                                  : `${size.widthInches} × ${size.heightInches} in · ${size.estimated ? 'estimated framed size' : 'verified/recorded size'}`}
                                          </small>
                                      </span>
                                      <button type="button" onClick={() => alignSelected('left')}>
                                          Align left
                                      </button>
                                      <button type="button" onClick={() => alignSelected('center-x')}>
                                          Center horizontal
                                      </button>
                                      <button type="button" onClick={() => alignSelected('right')}>
                                          Align right
                                      </button>
                                      <button type="button" onClick={() => alignSelected('top')}>
                                          Align top
                                      </button>
                                      <button type="button" onClick={() => alignSelected('center-y')}>
                                          Center vertical
                                      </button>
                                      <button type="button" onClick={() => alignSelected('bottom')}>
                                          Align bottom
                                      </button>
                                      <button
                                          type="button"
                                          disabled={selectedPlacements.length < 3}
                                          onClick={() => distributeSelected('horizontal')}
                                      >
                                          Distribute across
                                      </button>
                                      <button
                                          type="button"
                                          disabled={selectedPlacements.length < 3}
                                          onClick={() => distributeSelected('vertical')}
                                      >
                                          Distribute down
                                      </button>
                                  </div>
                              );
                          })()
                        : null}
                </section>

                <section className="owner-wall-library">
                    <header>
                        <div>
                            <strong>Artwork library</strong>
                            <small>Only active catalog work can be placed. Sold work remains clearly marked.</small>
                        </div>
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search title or medium"
                        />
                    </header>
                    <div>
                        {visibleArtworks.map((artwork) => {
                            const size = artworkScaleDimensions(artwork);
                            return (
                                <article key={artwork.id}>
                                    <div>
                                        <ArtworkPresentationImage
                                            src={artwork.small_image_path || artwork.image_path}
                                            crop={artwork.presentation_crop}
                                            alt=""
                                            fill
                                            sizes="80px"
                                        />
                                    </div>
                                    <span>
                                        <strong>{artwork.title}</strong>
                                        <small>
                                            {size ? `${size.widthInches} × ${size.heightInches} in` : 'Dimensions needed'}
                                            {artwork.sold ? ' · Sold' : ''}
                                        </small>
                                        {size?.estimated ? (
                                            <em>
                                                <CircleAlert size={11} /> Estimated frame
                                            </em>
                                        ) : null}
                                    </span>
                                    <button type="button" disabled={!size} onClick={() => addArtwork(artwork)}>
                                        {size ? (
                                            <>
                                                <Plus size={14} /> Add
                                            </>
                                        ) : (
                                            <>Fix dimensions</>
                                        )}
                                    </button>
                                </article>
                            );
                        })}
                    </div>
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
        </div>
    );
}
