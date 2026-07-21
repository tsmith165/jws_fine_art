'use client';

import { ArrowLeft, ArrowRight, Check, ChevronRight, ExternalLink, ImageIcon, Save, SkipForward } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { saveArtworkCategories } from '@/app/admin/categories/actions';
import { filterCategorizerArtworks } from '@/lib/ownerArtworkFilters';
import type { PiecesWithImages } from '@/types/artwork';
import { ARTWORK_CATEGORIES, type ArtworkCategoryId } from '@shared/artworkCategories';

type QueueMode = 'uncategorized' | 'all';

function imageSet(artwork: PiecesWithImages) {
    return [
        {
            id: `primary-${artwork.id}`,
            url: artwork.image_path,
            width: artwork.width,
            height: artwork.height,
            title: 'Primary image',
        },
        ...artwork.extraImages.map((image, index) => ({
            id: `supporting-${image.id}`,
            url: image.image_path,
            width: image.width,
            height: image.height,
            title: image.title || `Supporting image ${index + 1}`,
        })),
    ];
}

function statusLabel(artwork: PiecesWithImages) {
    if (!artwork.active) return 'Archived';
    if (artwork.sold) return 'Sold';
    if (artwork.available) return 'Available';
    return 'Not listed';
}

function isTypingTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false;
    return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export function OwnerQuickCategorizer({ initialArtworks }: { initialArtworks: PiecesWithImages[] }) {
    const [artworks, setArtworks] = useState(() => filterCategorizerArtworks(initialArtworks));
    const initialArtwork = artworks.find((artwork) => artwork.categories.length === 0) ?? artworks[0] ?? null;
    const [mode, setMode] = useState<QueueMode>('uncategorized');
    const [currentId, setCurrentId] = useState<number | null>(initialArtwork?.id ?? null);
    const [draftCategories, setDraftCategories] = useState<ArtworkCategoryId[]>(initialArtwork?.categories ?? []);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [message, setMessage] = useState('');
    const [isPending, startTransition] = useTransition();

    const queue = useMemo(
        () => (mode === 'uncategorized' ? artworks.filter((artwork) => artwork.categories.length === 0) : artworks),
        [artworks, mode],
    );
    const artwork = artworks.find((item) => item.id === currentId) ?? queue[0] ?? artworks[0] ?? null;
    const images = useMemo(() => (artwork ? imageSet(artwork) : []), [artwork]);
    const selectedImage = images[selectedImageIndex] ?? images[0];
    const categorizedCount = artworks.filter((item) => item.categories.length > 0).length;
    const queueIndex = artwork ? queue.findIndex((item) => item.id === artwork.id) : -1;
    const isDirty = artwork ? draftCategories.join('|') !== artwork.categories.join('|') : false;

    const selectArtwork = useCallback(
        (id: number) => {
            const next = artworks.find((item) => item.id === id);
            if (!next) return;
            setCurrentId(id);
            setDraftCategories(next.categories);
            setSelectedImageIndex(0);
            setMessage('');
        },
        [artworks],
    );

    const move = useCallback(
        (offset: number) => {
            if (!queue.length || !artwork) return;
            const index = Math.max(
                0,
                queue.findIndex((item) => item.id === artwork.id),
            );
            selectArtwork(queue[(index + offset + queue.length) % queue.length].id);
        },
        [artwork, queue, selectArtwork],
    );

    const toggleCategory = useCallback((category: ArtworkCategoryId) => {
        setDraftCategories((current) =>
            current.includes(category)
                ? current.filter((value) => value !== category)
                : ARTWORK_CATEGORIES.map((item) => item.id).filter((value) => [...current, category].includes(value)),
        );
        setMessage('');
    }, []);

    const saveAndContinue = useCallback(() => {
        if (!artwork || isPending) return;
        const currentQueue = queue;
        const currentIndex = Math.max(
            0,
            currentQueue.findIndex((item) => item.id === artwork.id),
        );
        const nextCandidate = currentQueue[currentIndex + 1] ?? currentQueue[currentIndex - 1] ?? null;
        const categories = draftCategories;
        setMessage('');
        startTransition(async () => {
            const result = await saveArtworkCategories(artwork.id, categories);
            if (!result.success || !result.categories) {
                setMessage(result.error || 'Unable to save categories.');
                return;
            }
            setArtworks((current) =>
                current.map((item) => (item.id === artwork.id ? { ...item, categories: result.categories ?? categories } : item)),
            );
            setMessage('Saved');
            if (nextCandidate && nextCandidate.id !== artwork.id) selectArtwork(nextCandidate.id);
        });
    }, [artwork, draftCategories, isPending, queue, selectArtwork]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (isTypingTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
            const category = ARTWORK_CATEGORIES[Number(event.key) - 1];
            if (category) {
                event.preventDefault();
                toggleCategory(category.id);
                return;
            }
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                move(-1);
            } else if (event.key === 'ArrowRight' || event.key.toLowerCase() === 's') {
                event.preventDefault();
                move(1);
            } else if (event.key === 'Enter') {
                event.preventDefault();
                saveAndContinue();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [move, saveAndContinue, toggleCategory]);

    const changeMode = (nextMode: QueueMode) => {
        setMode(nextMode);
        const nextQueue = nextMode === 'uncategorized' ? artworks.filter((item) => item.categories.length === 0) : artworks;
        if (nextQueue.length) selectArtwork(nextQueue[0].id);
    };

    if (!artwork) {
        return (
            <div className="owner-panel owner-categorizer-empty">
                <ImageIcon size={30} aria-hidden="true" />
                <h2>No artwork to categorize.</h2>
                <p>Add an artwork record to begin.</p>
            </div>
        );
    }

    return (
        <div className="owner-categorizer">
            <div className="owner-categorizer-toolbar">
                <div className="owner-categorizer-modes" aria-label="Artwork queue">
                    <button className={mode === 'uncategorized' ? 'is-active' : undefined} onClick={() => changeMode('uncategorized')}>
                        Uncategorized <span>{artworks.length - categorizedCount}</span>
                    </button>
                    <button className={mode === 'all' ? 'is-active' : undefined} onClick={() => changeMode('all')}>
                        All artwork <span>{artworks.length}</span>
                    </button>
                </div>
                <div className="owner-categorizer-progress">
                    <span>{categorizedCount} categorized</span>
                    <div aria-hidden="true">
                        <i style={{ width: `${artworks.length ? (categorizedCount / artworks.length) * 100 : 0}%` }} />
                    </div>
                    <strong>{artworks.length ? Math.round((categorizedCount / artworks.length) * 100) : 0}%</strong>
                </div>
            </div>

            <div className="owner-categorizer-workspace">
                <section className="owner-categorizer-stage" aria-label={`${artwork.title} images`}>
                    <div className="owner-categorizer-image">
                        {selectedImage ? (
                            <Image
                                key={selectedImage.id}
                                src={selectedImage.url}
                                alt={`${artwork.title}, ${selectedImage.title}`}
                                fill
                                sizes="(max-width: 1100px) 100vw, 65vw"
                                unoptimized
                            />
                        ) : null}
                        <span>{images.length > 1 ? `${selectedImageIndex + 1} / ${images.length}` : 'Primary image'}</span>
                    </div>
                    {images.length > 1 ? (
                        <div className="owner-categorizer-thumbnails" aria-label="Artwork images">
                            {images.map((image, index) => (
                                <button
                                    key={image.id}
                                    className={index === selectedImageIndex ? 'is-active' : undefined}
                                    onClick={() => setSelectedImageIndex(index)}
                                    aria-label={`View ${image.title}`}
                                    title={image.title}
                                >
                                    <Image src={image.url} alt="" fill sizes="72px" unoptimized />
                                </button>
                            ))}
                        </div>
                    ) : null}
                </section>

                <aside className="owner-categorizer-details">
                    <div className="owner-categorizer-position">
                        <span>{mode === 'uncategorized' ? 'Uncategorized queue' : 'All artwork'}</span>
                        <strong>{queueIndex >= 0 ? `${queueIndex + 1} of ${queue.length}` : 'Saved'}</strong>
                    </div>
                    <div className="owner-categorizer-title">
                        <div>
                            <span>{statusLabel(artwork)}</span>
                            <h2>{artwork.title}</h2>
                        </div>
                        <Link href={`/admin/edit?id=${artwork.id}`} aria-label={`Open ${artwork.title} in full editor`}>
                            <ExternalLink size={16} aria-hidden="true" />
                        </Link>
                    </div>
                    <dl className="owner-categorizer-facts">
                        <div>
                            <dt>Medium</dt>
                            <dd>{artwork.piece_type || 'Not set'}</dd>
                        </div>
                        <div>
                            <dt>Dimensions</dt>
                            <dd>
                                {artwork.real_width && artwork.real_height
                                    ? `${artwork.real_width} × ${artwork.real_height} in`
                                    : 'Not set'}
                            </dd>
                        </div>
                        <div>
                            <dt>Legacy theme</dt>
                            <dd>{artwork.theme || 'None'}</dd>
                        </div>
                        <div>
                            <dt>Gallery ID</dt>
                            <dd>{artwork.id}</dd>
                        </div>
                    </dl>
                    <fieldset className="owner-categorizer-categories">
                        <legend>Collection categories</legend>
                        {ARTWORK_CATEGORIES.map((category, index) => {
                            const selected = draftCategories.includes(category.id);
                            return (
                                <button
                                    type="button"
                                    key={category.id}
                                    className={selected ? 'is-selected' : undefined}
                                    aria-pressed={selected}
                                    onClick={() => toggleCategory(category.id)}
                                    title={`${category.label} (${index + 1})`}
                                >
                                    <span>{selected ? <Check size={16} aria-hidden="true" /> : null}</span>
                                    {category.label}
                                </button>
                            );
                        })}
                    </fieldset>
                    <div className="owner-categorizer-actions">
                        <button className="owner-button" type="button" onClick={() => move(-1)} aria-label="Previous artwork">
                            <ArrowLeft size={16} aria-hidden="true" /> Previous
                        </button>
                        <button className="owner-button" type="button" onClick={() => move(1)} aria-label="Skip artwork">
                            Skip <SkipForward size={16} aria-hidden="true" />
                        </button>
                        <button
                            className="owner-button is-primary"
                            type="button"
                            onClick={saveAndContinue}
                            disabled={isPending || !isDirty}
                        >
                            <Save size={16} aria-hidden="true" /> {isPending ? 'Saving…' : 'Save & next'}
                        </button>
                    </div>
                    <div className={`owner-categorizer-message${message && message !== 'Saved' ? 'is-error' : ''}`} aria-live="polite">
                        {message || (isDirty ? 'Unsaved category changes' : 'Categories are up to date')}
                    </div>
                </aside>
            </div>

            <section className="owner-categorizer-queue" aria-label="Artwork queue">
                <header>
                    <div>
                        <span>Review queue</span>
                        <strong>{queue.length} artwork records</strong>
                    </div>
                    <div>
                        <button type="button" onClick={() => move(-1)} aria-label="Previous artwork">
                            <ArrowLeft size={16} aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => move(1)} aria-label="Next artwork">
                            <ArrowRight size={16} aria-hidden="true" />
                        </button>
                    </div>
                </header>
                {queue.length ? (
                    <div className="owner-categorizer-queue-items">
                        {queue.map((item) => (
                            <button
                                type="button"
                                key={item.id}
                                className={item.id === artwork.id ? 'is-active' : undefined}
                                onClick={() => selectArtwork(item.id)}
                            >
                                <span>
                                    <Image src={item.small_image_path || item.image_path} alt="" fill sizes="88px" unoptimized />
                                </span>
                                <strong>{item.title}</strong>
                                <ChevronRight size={14} aria-hidden="true" />
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="owner-categorizer-complete">
                        <Check size={20} aria-hidden="true" /> All artwork has at least one category.
                    </div>
                )}
            </section>
        </div>
    );
}
