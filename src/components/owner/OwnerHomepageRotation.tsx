'use client';

import { ArrowDown, ArrowUp, Check, Plus, Search, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState, useTransition } from 'react';
import type { Pieces } from '@/types/artwork';
import { saveHomepageRotation } from '@/app/admin/homepage/actions';

function ArtworkImage({ artwork }: { artwork: Pieces }) {
    return (
        <Image
            src={artwork.small_image_path || artwork.image_path}
            alt={artwork.title}
            width={artwork.small_width || artwork.width}
            height={artwork.small_height || artwork.height}
            sizes="96px"
        />
    );
}

export function OwnerHomepageRotation({ artworks, initialSelectedIds }: { artworks: Pieces[]; initialSelectedIds: number[] }) {
    const artworkById = useMemo(() => new Map(artworks.map((artwork) => [artwork.id, artwork])), [artworks]);
    const initialIds = initialSelectedIds.filter((id) => artworkById.has(id));
    const [selectedIds, setSelectedIds] = useState(initialIds);
    const [savedIds, setSavedIds] = useState(initialIds);
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const selected = selectedIds.map((id) => artworkById.get(id)).filter((artwork): artwork is Pieces => Boolean(artwork));
    const available = artworks.filter((artwork) => {
        if (selectedIds.includes(artwork.id)) return false;
        const needle = search.trim().toLowerCase();
        if (!needle) return true;
        return [artwork.title, artwork.piece_type, artwork.theme, ...(artwork.categories ?? [])]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(needle));
    });
    const hasChanges = selectedIds.join('|') !== savedIds.join('|');

    function move(index: number, offset: -1 | 1) {
        const target = index + offset;
        if (target < 0 || target >= selectedIds.length) return;
        setSelectedIds((current) => {
            const next = [...current];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
        setMessage(null);
    }

    function save() {
        if (selectedIds.length === 0) {
            setMessage('Choose at least one artwork before saving.');
            return;
        }
        startTransition(async () => {
            const result = await saveHomepageRotation(selectedIds);
            if (result.success) {
                setSavedIds(selectedIds);
                setMessage('Homepage rotation published.');
            } else {
                setMessage(result.error || 'Unable to publish the homepage rotation.');
            }
        });
    }

    return (
        <div className="owner-homepage-editor">
            <section className="owner-panel owner-homepage-selected" aria-labelledby="homepage-selected-title">
                <div className="owner-panel-header owner-homepage-panel-header">
                    <div>
                        <span>Opening slideshow</span>
                        <h2 id="homepage-selected-title">Selected artwork</h2>
                        <p>The first artwork loads first. Use the arrows to set the sequence.</p>
                    </div>
                    <strong>{selected.length} selected</strong>
                </div>
                <div className="owner-homepage-selected-list">
                    {selected.map((artwork, index) => (
                        <article className="owner-homepage-selected-row" key={artwork.id}>
                            <span className="owner-homepage-order">{String(index + 1).padStart(2, '0')}</span>
                            <ArtworkImage artwork={artwork} />
                            <div>
                                <strong>{artwork.title}</strong>
                                <small>{artwork.piece_type || 'Medium not set'}</small>
                            </div>
                            <div className="owner-homepage-row-actions">
                                <button
                                    type="button"
                                    onClick={() => move(index, -1)}
                                    disabled={index === 0}
                                    aria-label={`Move ${artwork.title} earlier`}
                                    title="Move earlier"
                                >
                                    <ArrowUp size={17} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => move(index, 1)}
                                    disabled={index === selected.length - 1}
                                    aria-label={`Move ${artwork.title} later`}
                                    title="Move later"
                                >
                                    <ArrowDown size={17} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedIds((current) => current.filter((id) => id !== artwork.id))}
                                    aria-label={`Remove ${artwork.title} from homepage`}
                                    title="Remove from homepage"
                                >
                                    <Trash2 size={17} />
                                </button>
                            </div>
                        </article>
                    ))}
                    {selected.length === 0 ? (
                        <p className="owner-homepage-empty">Choose at least one artwork from the library below.</p>
                    ) : null}
                </div>
                <div className="owner-homepage-save-row">
                    <p role="status" aria-live="polite">
                        {message}
                    </p>
                    <button
                        className="owner-button"
                        type="button"
                        onClick={save}
                        disabled={!hasChanges || isPending || selected.length === 0}
                    >
                        <Check size={17} aria-hidden="true" /> {isPending ? 'Publishing...' : 'Publish rotation'}
                    </button>
                </div>
            </section>

            <section className="owner-panel owner-homepage-library" aria-labelledby="homepage-library-title">
                <div className="owner-panel-header owner-homepage-panel-header">
                    <div>
                        <span>Active catalog</span>
                        <h2 id="homepage-library-title">Artwork library</h2>
                        <p>Adding or removing a piece here does not change its gallery status.</p>
                    </div>
                    <label className="owner-homepage-search">
                        <Search size={17} aria-hidden="true" />
                        <span className="sr-only">Search artwork</span>
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search title, medium, or category"
                        />
                    </label>
                </div>
                <div className="owner-homepage-library-grid">
                    {available.map((artwork) => (
                        <article key={artwork.id}>
                            <ArtworkImage artwork={artwork} />
                            <div className="owner-homepage-library-copy">
                                <strong title={artwork.title}>{artwork.title}</strong>
                                <small title={artwork.piece_type || 'Medium not set'}>{artwork.piece_type || 'Medium not set'}</small>
                            </div>
                            <button
                                className="owner-homepage-library-add"
                                type="button"
                                onClick={() => setSelectedIds((current) => [...current, artwork.id])}
                                aria-label={`Add ${artwork.title} to homepage`}
                            >
                                <Plus size={17} aria-hidden="true" /> Add
                            </button>
                        </article>
                    ))}
                    {available.length === 0 ? <p className="owner-homepage-empty">No artwork matches this search.</p> : null}
                </div>
            </section>
        </div>
    );
}
