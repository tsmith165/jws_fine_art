'use client';

import {
    ArrowLeft,
    ArrowRight,
    Check,
    CircleAlert,
    CircleCheck,
    ExternalLink,
    GripVertical,
    Images,
    Save,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { PiecesWithImages } from '@/types/artwork';
import { handleImageDelete, handleMediaOrderUpdate, onSubmitEditForm } from '@/app/admin/edit/actions';
import ImageEditor from '@/app/admin/edit/images/[id]/ImageEditor';
import { reorderArtworkMedia } from '@/lib/ownerMediaOrdering';
import { ARTWORK_CATEGORIES, type ArtworkCategoryId } from '@shared/artworkCategories';
import { artworkAvailabilityForStatus, artworkListingStatus, type ArtworkListingStatus } from '@shared/artworkListingState';

type EditorForm = {
    piece_id: string;
    piece_title: string;
    description: string;
    piece_type: string;
    sold: boolean;
    price: string;
    instagram: string;
    width: string;
    height: string;
    real_width: string;
    real_height: string;
    theme: string;
    categories: ArtworkCategoryId[];
    available: boolean;
    framed: boolean;
    comments: string;
    image_path: string;
};

function initialForm(piece: PiecesWithImages): EditorForm {
    return {
        piece_id: String(piece.id),
        piece_title: piece.title,
        description: piece.description || '',
        piece_type: piece.piece_type || '',
        sold: Boolean(piece.sold),
        price: piece.price ? String(piece.price) : '',
        instagram: piece.instagram || '',
        width: String(piece.width),
        height: String(piece.height),
        real_width: piece.real_width ? String(piece.real_width) : '',
        real_height: piece.real_height ? String(piece.real_height) : '',
        theme: piece.theme || '',
        categories: piece.categories,
        available: Boolean(piece.available),
        framed: Boolean(piece.framed),
        comments: piece.comments || '',
        image_path: piece.image_path,
    };
}

const mediaOptions = ['Oil On Canvas', 'Oil On Panel', 'Oil On Cradled Panel', 'Intaglio On Paper', 'Linocut On Paper', 'Pastel On Paper'];

export function OwnerArtworkEditor({ piece, previousId, nextId }: { piece: PiecesWithImages; previousId: number; nextId: number }) {
    const [form, setForm] = useState(() => initialForm(piece));
    const [savedForm, setSavedForm] = useState(() => initialForm(piece));
    const [selectedImage, setSelectedImage] = useState(piece.image_path);
    const [removedImageUrls, setRemovedImageUrls] = useState(() => new Set<string>());
    const [removingImage, setRemovingImage] = useState(false);
    const [reorderingImage, setReorderingImage] = useState<number | null>(null);
    const [mediaOrderIds, setMediaOrderIds] = useState<{ extra: number[]; progress: number[] }>({ extra: [], progress: [] });
    const [draggedMediaId, setDraggedMediaId] = useState<string | null>(null);
    const [dragOverMediaId, setDragOverMediaId] = useState<string | null>(null);
    const [mediaMessage, setMediaMessage] = useState<{ tone: 'good' | 'warning'; text: string } | null>(null);
    const [mediaOpen, setMediaOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ tone: 'good' | 'warning'; text: string } | null>(null);
    const media = useMemo(() => {
        const orderByIds = <T extends { id: number }>(items: T[], ids: number[]) => {
            const positions = new Map(ids.map((id, index) => [id, index]));
            return [...items].sort((a, b) => {
                const aPosition = positions.get(a.id);
                const bPosition = positions.get(b.id);
                if (aPosition === undefined && bPosition === undefined) return 0;
                if (aPosition === undefined) return 1;
                if (bPosition === undefined) return -1;
                return aPosition - bPosition;
            });
        };
        const supporting = orderByIds(
            piece.extraImages.filter((image) => !removedImageUrls.has(image.image_path)),
            mediaOrderIds.extra,
        );
        const progress = orderByIds(
            piece.progressImages.filter((image) => !removedImageUrls.has(image.image_path)),
            mediaOrderIds.progress,
        );
        return [
            {
                id: `primary-${piece.id}`,
                url: piece.image_path,
                width: piece.width,
                height: piece.height,
                role: 'Primary',
                kind: 'primary' as const,
            },
            ...supporting.map((image, index) => ({
                ...image,
                url: image.image_path,
                role: `Supporting ${index + 1}`,
                kind: 'extra' as const,
            })),
            ...progress.map((image, index) => ({
                ...image,
                url: image.image_path,
                role: `Process ${index + 1}`,
                kind: 'progress' as const,
            })),
        ];
    }, [mediaOrderIds, piece, removedImageUrls]);
    const selected = media.find((image) => image.url === selectedImage) || media[0];
    const listingStatus = artworkListingStatus({ available: form.available, sold: form.sold });
    const checks = [
        {
            key: 'primary-image',
            label: 'Primary image',
            ready: Boolean(piece.image_path),
            detail: 'Add the main image collectors will see first.',
            actionLabel: 'Manage media',
            href: null,
        },
        {
            key: 'title-medium',
            label: 'Title and medium',
            ready: Boolean(form.piece_title && form.piece_type),
            detail: !form.piece_title ? 'Add an artwork title.' : 'Choose the material used for this artwork.',
            actionLabel: !form.piece_title ? 'Add title' : 'Choose medium',
            href: !form.piece_title ? '#artwork-title' : '#artwork-medium',
        },
        {
            key: 'dimensions',
            label: 'Physical dimensions',
            ready: Boolean(form.real_width && form.real_height),
            detail: 'Add both the finished width and height.',
            actionLabel: 'Add dimensions',
            href: '#artwork-width',
        },
        {
            key: 'price-status',
            label: 'Price or listing status',
            ready: Boolean(form.price || listingStatus !== 'available'),
            detail: 'Add a price before making this artwork available for purchase.',
            actionLabel: 'Add price',
            href: '#artwork-price',
        },
        {
            key: 'story',
            label: 'Artwork story',
            ready: Boolean(form.description),
            detail: 'Add a short story so collectors and search engines understand the piece.',
            actionLabel: 'Add story',
            href: '#artwork-story',
        },
    ] as const;
    const completedCount = checks.filter(({ ready }) => ready).length;
    const missingChecks = checks.filter(({ ready }) => !ready);
    const completeness = Math.round((completedCount / checks.length) * 100);
    const listingStatusLabel: Record<ArtworkListingStatus, string> = {
        available: 'Available',
        'private-collection': 'Private collection',
        'not-for-sale': 'Not for sale',
    };
    const searchDescription =
        form.description.trim() ||
        `${form.piece_type || 'Original artwork'} by Jill Weeks Smith.${
            form.real_width && form.real_height ? ` ${form.real_width} × ${form.real_height} in.` : ''
        }`;
    const hasUnsavedChanges = JSON.stringify(form) !== JSON.stringify(savedForm);

    useEffect(() => {
        if (!hasUnsavedChanges) return;
        const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
            event.preventDefault();
        };
        window.addEventListener('beforeunload', warnBeforeLeaving);
        return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
    }, [hasUnsavedChanges]);

    useEffect(() => {
        if (!mediaOpen) return;
        const previousOverflow = document.body.style.overflow;
        const ownerScroll = document.querySelector<HTMLElement>('.owner-scroll');
        const previousOwnerOverflow = ownerScroll?.style.overflow;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setMediaOpen(false);
        };
        document.body.style.overflow = 'hidden';
        if (ownerScroll) ownerScroll.style.overflow = 'hidden';
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.body.style.overflow = previousOverflow;
            if (ownerScroll) ownerScroll.style.overflow = previousOwnerOverflow || '';
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [mediaOpen]);

    useEffect(() => {
        if (!media.some((image) => image.url === selectedImage)) setSelectedImage(piece.image_path);
    }, [media, piece.image_path, selectedImage]);

    function update<K extends keyof EditorForm>(key: K, value: EditorForm[K]) {
        setForm((current) => ({ ...current, [key]: value }));
        setMessage(null);
    }

    function updateListingStatus(status: ArtworkListingStatus) {
        const listing = artworkAvailabilityForStatus(status);
        setForm((current) => ({ ...current, ...listing }));
        setMessage(null);
    }

    function openMediaManager() {
        setMediaMessage(null);
        setMediaOpen(true);
    }

    async function reorderMedia(currentImage: (typeof media)[number], targetImage: (typeof media)[number]) {
        if (
            currentImage.kind === 'primary' ||
            targetImage.kind === 'primary' ||
            currentImage.kind !== targetImage.kind ||
            typeof currentImage.id !== 'number'
        ) {
            return;
        }
        const group = media.filter((image) => image.kind === currentImage.kind);
        const reordered = reorderArtworkMedia(group, currentImage.id, targetImage.id);
        if (reordered === group) return;
        const nextIds = reordered.map((image) => Number(image.id));
        const previousIds = mediaOrderIds[currentImage.kind];
        setMediaOrderIds((current) => ({ ...current, [currentImage.kind]: nextIds }));
        setReorderingImage(currentImage.id);
        setMediaMessage(null);
        try {
            const result = await handleMediaOrderUpdate(piece.id, nextIds, currentImage.kind);
            if (!result.success) {
                setMediaOrderIds((current) => ({ ...current, [currentImage.kind]: previousIds }));
                setMediaMessage({ tone: 'warning', text: result.error || 'The image order could not be saved.' });
                return;
            }
            setMediaMessage({
                tone: 'good',
                text: `${currentImage.kind === 'extra' ? 'Supporting' : 'Process'} image order updated.`,
            });
        } catch {
            setMediaOrderIds((current) => ({ ...current, [currentImage.kind]: previousIds }));
            setMediaMessage({ tone: 'warning', text: 'The image order could not be saved. Check your connection and try again.' });
        } finally {
            setReorderingImage(null);
            setDraggedMediaId(null);
            setDragOverMediaId(null);
        }
    }

    async function removeMedia(image: (typeof media)[number]) {
        if (image.kind === 'primary') return;
        if (!window.confirm(`Remove ${image.role.toLowerCase()} from this artwork?`)) return;
        setRemovingImage(true);
        setMessage(null);
        setMediaMessage(null);
        try {
            const result = await handleImageDelete(piece.id, image.url, image.kind);
            if (!result.success) {
                setMessage({ tone: 'warning', text: result.error || 'The image could not be removed.' });
                setMediaMessage({ tone: 'warning', text: result.error || 'The image could not be removed.' });
                return;
            }
            setRemovedImageUrls((current) => new Set(current).add(image.url));
            if (selectedImage === image.url) setSelectedImage(piece.image_path);
            setMessage({ tone: 'good', text: 'Image removed from this artwork.' });
            setMediaMessage({ tone: 'good', text: 'Image removed from this artwork.' });
        } catch {
            setMessage({ tone: 'warning', text: 'The image could not be removed. Check your connection and try again.' });
            setMediaMessage({ tone: 'warning', text: 'The image could not be removed. Check your connection and try again.' });
        } finally {
            setRemovingImage(false);
        }
    }

    async function save() {
        if (!form.piece_title.trim()) {
            setMessage({ tone: 'warning', text: 'Add an artwork title before saving.' });
            return;
        }
        setSaving(true);
        setMessage(null);
        try {
            const result = await onSubmitEditForm(form);
            if (result.success) setSavedForm(form);
            setMessage({
                tone: result.success ? 'good' : 'warning',
                text: result.success ? 'Changes saved.' : result.error || 'The artwork could not be saved.',
            });
        } catch {
            setMessage({ tone: 'warning', text: 'The artwork could not be saved. Check your connection and try again.' });
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="owner-editor-layout">
            <section className="owner-editor-main">
                <header className="owner-editor-titlebar">
                    <div>
                        <span>Artwork record · #{piece.id}</span>
                        <h1>{form.piece_title || 'Untitled artwork'}</h1>
                    </div>
                    <div className="owner-editor-actions">
                        {hasUnsavedChanges ? <span className="owner-unsaved-indicator">Unsaved changes</span> : null}
                        <Link className="owner-button" href={`/admin/edit?id=${previousId}`} aria-label="Previous artwork">
                            <ArrowLeft size={16} /> Previous
                        </Link>
                        <Link className="owner-button" href={`/admin/edit?id=${nextId}`} aria-label="Next artwork">
                            Next <ArrowRight size={16} />
                        </Link>
                        <Link className="owner-button" href={`/work/${piece.slug || piece.id}`} target="_blank">
                            Preview <ExternalLink size={15} />
                        </Link>
                        <button className="owner-button is-primary" type="button" onClick={save} disabled={saving || !hasUnsavedChanges}>
                            <Save size={16} /> {saving ? 'Saving…' : 'Save changes'}
                        </button>
                    </div>
                </header>
                {message ? (
                    <p className={`owner-editor-message is-${message.tone}`} role="status">
                        {message.text}
                    </p>
                ) : null}
                <div className="owner-editor-media">
                    <div className="owner-editor-stage">
                        <div className="owner-editor-stage-content">
                            <Image
                                src={selected.url}
                                alt={form.piece_title}
                                width={selected.width}
                                height={selected.height}
                                quality={100}
                            />
                            {selected.kind !== 'primary' ? (
                                <button
                                    className="owner-button is-danger owner-editor-remove-media"
                                    type="button"
                                    onClick={() => removeMedia(selected)}
                                    disabled={removingImage}
                                >
                                    <Trash2 size={16} /> {removingImage ? 'Removing…' : 'Remove image'}
                                </button>
                            ) : null}
                        </div>
                    </div>
                    <div className="owner-editor-thumbs" aria-label="Artwork media">
                        {media.map((image) => (
                            <button
                                className={image.url === selected.url ? 'is-selected' : undefined}
                                type="button"
                                key={image.id}
                                onClick={() => setSelectedImage(image.url)}
                                aria-label={`Show ${image.role.toLowerCase()}`}
                            >
                                <Image src={image.url} alt="" width={image.width} height={image.height} />
                                <span>{image.role}</span>
                            </button>
                        ))}
                        <button className="owner-editor-add-media" type="button" onClick={openMediaManager}>
                            <Images size={20} /> Manage media
                        </button>
                    </div>
                </div>
                <section className="owner-editor-form owner-panel">
                    <header className="owner-panel-header">
                        <div>
                            <span className="owner-panel-eyebrow">Artwork facts</span>
                            <h2>What collectors need to know</h2>
                        </div>
                    </header>
                    <div className="owner-form-grid">
                        <label className="owner-field is-wide">
                            <span>Title</span>
                            <input
                                id="artwork-title"
                                value={form.piece_title}
                                onChange={(event) => update('piece_title', event.target.value)}
                                required
                            />
                        </label>
                        <label className="owner-field">
                            <span>Medium</span>
                            <select
                                id="artwork-medium"
                                value={form.piece_type}
                                onChange={(event) => update('piece_type', event.target.value)}
                            >
                                <option value="">Choose a medium</option>
                                {mediaOptions.map((medium) => (
                                    <option key={medium}>{medium}</option>
                                ))}
                            </select>
                        </label>
                        <fieldset className="owner-field is-wide owner-category-fieldset">
                            <legend>Categories</legend>
                            <div className="owner-category-options">
                                {ARTWORK_CATEGORIES.map((category) => (
                                    <label key={category.id}>
                                        <input
                                            type="checkbox"
                                            checked={form.categories.includes(category.id)}
                                            onChange={(event) =>
                                                update(
                                                    'categories',
                                                    event.target.checked
                                                        ? [...form.categories, category.id]
                                                        : form.categories.filter((id) => id !== category.id),
                                                )
                                            }
                                        />
                                        <span>{category.label}</span>
                                    </label>
                                ))}
                            </div>
                            <small>Choose every collection where this work belongs.</small>
                        </fieldset>
                        <label className="owner-field">
                            <span>Price (USD)</span>
                            <input
                                id="artwork-price"
                                type="number"
                                min="0"
                                step="1"
                                value={form.price}
                                onChange={(event) => update('price', event.target.value)}
                            />
                        </label>
                        <label className="owner-field">
                            <span>Framing</span>
                            <select
                                value={form.framed ? 'framed' : 'unframed'}
                                onChange={(event) => update('framed', event.target.value === 'framed')}
                            >
                                <option value="framed">Framed</option>
                                <option value="unframed">Unframed</option>
                            </select>
                        </label>
                        <label className="owner-field">
                            <span>Width (in)</span>
                            <input
                                id="artwork-width"
                                type="number"
                                min="0"
                                step="0.25"
                                value={form.real_width}
                                onChange={(event) => update('real_width', event.target.value)}
                            />
                        </label>
                        <label className="owner-field">
                            <span>Height (in)</span>
                            <input
                                type="number"
                                min="0"
                                step="0.25"
                                value={form.real_height}
                                onChange={(event) => update('real_height', event.target.value)}
                            />
                        </label>
                        <label className="owner-field is-wide">
                            <span>Artwork story</span>
                            <textarea
                                id="artwork-story"
                                value={form.description}
                                onChange={(event) => update('description', event.target.value)}
                            />
                        </label>
                        <label className="owner-field is-wide">
                            <span>Private studio notes</span>
                            <textarea value={form.comments} onChange={(event) => update('comments', event.target.value)} />
                        </label>
                        <label className="owner-field is-wide">
                            <span>Instagram post URL</span>
                            <input type="url" value={form.instagram} onChange={(event) => update('instagram', event.target.value)} />
                        </label>
                    </div>
                </section>
            </section>
            <aside className="owner-editor-aside">
                <section className="owner-panel owner-listing-panel">
                    <div className="owner-listing-panel-header">
                        <span className="owner-panel-eyebrow">Listing state</span>
                        <strong>{listingStatusLabel[listingStatus]}</strong>
                    </div>
                    <label className="owner-field owner-listing-state-field">
                        <span>Public status</span>
                        <select value={listingStatus} onChange={(event) => updateListingStatus(event.target.value as ArtworkListingStatus)}>
                            <option value="available">Available for purchase</option>
                            <option value="private-collection">Private collection</option>
                            <option value="not-for-sale">Not for sale</option>
                        </select>
                    </label>
                    <p className="owner-listing-note">Save changes to update the public gallery.</p>
                </section>
                <section className={`owner-panel owner-readiness-panel ${missingChecks.length ? 'has-missing' : 'is-ready'}`}>
                    <header className="owner-readiness-header">
                        <div>
                            <span className="owner-panel-eyebrow">Publish check</span>
                            <h2>{missingChecks.length ? `${missingChecks.length} details need attention` : 'Ready to publish'}</h2>
                        </div>
                        <span className="owner-readiness-status">
                            {missingChecks.length ? `${missingChecks.length} remaining` : 'Complete'}
                        </span>
                    </header>
                    <div className="owner-readiness-progress">
                        <div>
                            <span>
                                {completedCount} of {checks.length} essentials complete
                            </span>
                            <strong>{completeness}%</strong>
                        </div>
                        <div className="owner-completion" aria-label={`${completeness}% complete`}>
                            <span style={{ width: `${completeness}%` }} />
                        </div>
                    </div>
                    {missingChecks.length ? (
                        <ul className="owner-attention-list">
                            {missingChecks.map((check) => (
                                <li key={check.key}>
                                    <CircleAlert size={17} aria-hidden="true" />
                                    <div>
                                        <strong>{check.label}</strong>
                                        <p>{check.detail}</p>
                                        {check.href ? (
                                            <a href={check.href}>
                                                {check.actionLabel} <ArrowRight size={13} />
                                            </a>
                                        ) : (
                                            <button type="button" onClick={openMediaManager}>
                                                {check.actionLabel} <ArrowRight size={13} />
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="owner-ready-message">
                            <CircleCheck size={20} />
                            <div>
                                <strong>All essentials are covered</strong>
                                <p>This artwork has the core information collectors need.</p>
                            </div>
                        </div>
                    )}
                    {completedCount > 0 && missingChecks.length ? (
                        <p className="owner-complete-summary">
                            <Check size={14} /> {completedCount} {completedCount === 1 ? 'essential is' : 'essentials are'} already complete
                        </p>
                    ) : null}
                </section>
                <section className="owner-panel owner-search-preview">
                    <header className="owner-search-preview-header">
                        <div>
                            <span className="owner-panel-eyebrow">Search preview</span>
                            <h2>How collectors find it</h2>
                        </div>
                        <Search size={17} aria-hidden="true" />
                    </header>
                    <div className="owner-search-result">
                        <div className="owner-search-result-site">
                            <span>J</span>
                            <div>
                                <strong>Jill Weeks Smith Fine Art</strong>
                                <small>jwsfineart.com › work › {piece.slug || piece.id}</small>
                            </div>
                        </div>
                        <h3>{form.piece_title || 'Untitled artwork'} · Jill Weeks Smith</h3>
                        <p>{searchDescription}</p>
                    </div>
                    {!form.description.trim() ? (
                        <div className="owner-search-guidance">
                            <CircleAlert size={16} />
                            <div>
                                <strong>Artwork story missing</strong>
                                <p>The fallback works, but a short story creates a stronger search result.</p>
                                <a href="#artwork-story">
                                    Add artwork story <ArrowRight size={13} />
                                </a>
                            </div>
                        </div>
                    ) : null}
                </section>
            </aside>
            {mediaOpen ? (
                <div
                    className="owner-media-modal-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setMediaOpen(false);
                    }}
                >
                    <section className="owner-media-modal" role="dialog" aria-modal="true" aria-labelledby="owner-media-modal-title">
                        <header className="owner-media-modal-header">
                            <div>
                                <span className="owner-panel-eyebrow">Artwork media</span>
                                <h2 id="owner-media-modal-title">Manage {form.piece_title || 'artwork'} media</h2>
                                <p>Reorder current images or drag a new original anywhere onto this window.</p>
                            </div>
                            <button type="button" onClick={() => setMediaOpen(false)} aria-label="Close media manager" autoFocus>
                                <X size={20} />
                            </button>
                        </header>
                        <div className="owner-media-modal-body">
                            <section className="owner-media-library">
                                <header>
                                    <div>
                                        <span className="owner-panel-eyebrow">Current media</span>
                                        <strong>
                                            {media.length} {media.length === 1 ? 'image' : 'images'}
                                        </strong>
                                    </div>
                                    <p>
                                        Primary stays first. Drag supporting or process images within their group, or use the arrow buttons.
                                    </p>
                                </header>
                                {mediaMessage ? (
                                    <p className={`owner-editor-message is-${mediaMessage.tone}`} role="status">
                                        {mediaMessage.text}
                                    </p>
                                ) : null}
                                <div className="owner-media-library-grid">
                                    {media.map((image) => {
                                        const group = media.filter((candidate) => candidate.kind === image.kind);
                                        const groupIndex = group.findIndex((candidate) => candidate.id === image.id);
                                        const reorderable = image.kind !== 'primary' && group.length > 1;
                                        const imageId = String(image.id);
                                        return (
                                            <article
                                                key={image.id}
                                                className={[
                                                    reorderable ? 'is-reorderable' : '',
                                                    draggedMediaId === imageId ? 'is-dragging' : '',
                                                    dragOverMediaId === imageId ? 'is-drop-target' : '',
                                                ]
                                                    .filter(Boolean)
                                                    .join(' ')}
                                                draggable={reorderable && reorderingImage === null}
                                                title={reorderable ? `Drag to reorder ${image.role.toLowerCase()}` : undefined}
                                                onDragStart={(event) => {
                                                    if (!reorderable) return;
                                                    event.dataTransfer.effectAllowed = 'move';
                                                    event.dataTransfer.setData('text/plain', imageId);
                                                    setDraggedMediaId(imageId);
                                                }}
                                                onDragOver={(event) => {
                                                    if (!reorderable || event.dataTransfer.types.includes('Files')) return;
                                                    const currentId = event.dataTransfer.getData('text/plain') || draggedMediaId;
                                                    const current = media.find((candidate) => String(candidate.id) === currentId);
                                                    if (!current || current.kind !== image.kind || current.id === image.id) return;
                                                    event.preventDefault();
                                                    event.dataTransfer.dropEffect = 'move';
                                                    setDragOverMediaId(imageId);
                                                }}
                                                onDrop={(event) => {
                                                    if (event.dataTransfer.types.includes('Files')) return;
                                                    event.preventDefault();
                                                    const currentId = event.dataTransfer.getData('text/plain') || draggedMediaId;
                                                    const current = media.find((candidate) => String(candidate.id) === currentId);
                                                    if (current) void reorderMedia(current, image);
                                                }}
                                                onDragEnd={() => {
                                                    setDraggedMediaId(null);
                                                    setDragOverMediaId(null);
                                                }}
                                            >
                                                <div className="owner-media-card-heading">
                                                    <span>{image.role}</span>
                                                    {reorderable ? <GripVertical size={14} aria-hidden="true" /> : null}
                                                </div>
                                                <div className="owner-media-card-image">
                                                    <Image src={image.url} alt="" width={image.width} height={image.height} />
                                                </div>
                                                {image.kind !== 'primary' ? (
                                                    <div className="owner-media-card-actions">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const target = group[groupIndex - 1];
                                                                if (target) void reorderMedia(image, target);
                                                            }}
                                                            disabled={groupIndex === 0 || reorderingImage !== null}
                                                            aria-label={`Move ${image.role.toLowerCase()} earlier`}
                                                            title="Move earlier"
                                                        >
                                                            <ArrowLeft size={14} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const target = group[groupIndex + 1];
                                                                if (target) void reorderMedia(image, target);
                                                            }}
                                                            disabled={groupIndex === group.length - 1 || reorderingImage !== null}
                                                            aria-label={`Move ${image.role.toLowerCase()} later`}
                                                            title="Move later"
                                                        >
                                                            <ArrowRight size={14} />
                                                        </button>
                                                        <button
                                                            className="is-remove"
                                                            type="button"
                                                            onClick={() => removeMedia(image)}
                                                            disabled={removingImage || reorderingImage !== null}
                                                            aria-label={`Remove ${image.role.toLowerCase()}`}
                                                        >
                                                            <Trash2 size={14} /> Remove
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <small>Catalog image · fixed first</small>
                                                )}
                                            </article>
                                        );
                                    })}
                                </div>
                            </section>
                            <section className="owner-media-upload-panel">
                                <div>
                                    <span className="owner-panel-eyebrow">Add media</span>
                                    <h3>Upload another original</h3>
                                    <p>Drop an image anywhere in this window, or select a file below. Choose its role after upload.</p>
                                </div>
                                <ImageEditor pieceId={String(piece.id)} onClose={() => setMediaOpen(false)} />
                            </section>
                        </div>
                    </section>
                </div>
            ) : null}
        </div>
    );
}
