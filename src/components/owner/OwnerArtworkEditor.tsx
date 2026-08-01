'use client';

import {
    ArrowLeft,
    ArrowRight,
    Check,
    CircleAlert,
    CircleCheck,
    Crop,
    ExternalLink,
    GripVertical,
    Images,
    Replace,
    RotateCcw,
    Save,
    ScanLine,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { ResilientImage as Image } from '@/components/lit-wall/ResilientImage';
import { ArtworkPresentationImage } from '@/components/lit-wall/ArtworkPresentationImage';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { ArtworkPresentationCrop, PiecesWithImages } from '@/types/artwork';
import { handleImageDelete, handleMediaOrderUpdate, onSubmitEditForm, repairStoredInstagramShareReference, saveMediaPresentationCrop } from '@/app/admin/edit/actions';
import ImageEditor from '@/app/admin/edit/images/[id]/ImageEditor';
import { normalizeInstagramShareReference, validateOwnerArtwork, type OwnerArtworkField } from '@/lib/ownerArtworkValidation';
import { artworkReleaseDateNeedsReview } from '@/lib/ownerArtworkAttention';
import { reorderArtworkMedia } from '@/lib/ownerMediaOrdering';
import { ARTWORK_CATEGORIES, type ArtworkCategoryId } from '@shared/artworkCategories';
import { artworkAvailabilityForStatus, type ArtworkListingStatus } from '@shared/artworkListingState';
import { releaseDateValue } from '@shared/artworkRelease';
import { estimateFramedDimensions } from '@shared/artworkDimensions';
import { OwnerDatePicker } from './OwnerDatePicker';
import { OwnerFieldFooter, OwnerFormRow } from './OwnerForm';

type EditorForm = {
    piece_id: string;
    piece_title: string;
    description: string;
    piece_type: string;
    released_at: string;
    sold: boolean;
    price: string;
    instagram: string;
    width: string;
    height: string;
    real_width: string;
    real_height: string;
    framed_width: string;
    framed_height: string;
    framed_dimensions_verified: boolean;
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
        released_at: releaseDateValue(piece.released_at),
        sold: Boolean(piece.sold),
        price: piece.price ? String(piece.price) : '',
        instagram: normalizeInstagramShareReference(piece.instagram || ''),
        width: String(piece.width),
        height: String(piece.height),
        real_width: piece.real_width ? String(piece.real_width) : '',
        real_height: piece.real_height ? String(piece.real_height) : '',
        framed_width: piece.framed_width ? String(piece.framed_width) : '',
        framed_height: piece.framed_height ? String(piece.framed_height) : '',
        framed_dimensions_verified: Boolean(piece.framed_dimensions_verified),
        theme: piece.theme || '',
        categories: piece.categories,
        available: Boolean(piece.available),
        framed: Boolean(piece.framed),
        comments: piece.comments || '',
        image_path: piece.image_path,
    };
}

const mediaOptions = ['Oil On Canvas', 'Oil On Panel', 'Oil On Cradled Panel', 'Intaglio On Paper', 'Linocut On Paper', 'Pastel On Paper'];

function FieldFeedback({
    field,
    issue,
}: {
    field: OwnerArtworkField;
    issue: ReturnType<typeof validateOwnerArtwork>['issues'][number] | undefined;
}) {
    if (!issue) return null;
    return (
        <OwnerFieldFooter id={`artwork-${field}-feedback`} className={`owner-field-feedback is-${issue.tone}`} aria-live="polite">
            <CircleAlert size={12} />
            {issue.message}
        </OwnerFieldFooter>
    );
}

export function OwnerArtworkEditor({
    piece,
    previousId,
    nextId,
    initialMediaOpen = false,
}: {
    piece: PiecesWithImages;
    previousId: number;
    nextId: number;
    initialMediaOpen?: boolean;
}) {
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
    const [mediaOpen, setMediaOpen] = useState(initialMediaOpen);
    const [mediaUploadRole, setMediaUploadRole] = useState<'main' | 'extra' | 'progress'>('extra');
    const [mediaUploadVersion, setMediaUploadVersion] = useState(0);
    const [cropOpen, setCropOpen] = useState(false);
    const [crop, setCrop] = useState<ArtworkPresentationCrop>(() => piece.presentation_crop ?? { top: 0, right: 0, bottom: 0, left: 0 });
    const [savedCrop, setSavedCrop] = useState<ArtworkPresentationCrop | null>(() => piece.presentation_crop ?? null);
    const [cropBusy, setCropBusy] = useState<'detect' | 'save' | null>(null);
    const [saving, setSaving] = useState(false);
    const [attemptedSave, setAttemptedSave] = useState(false);
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
                presentation_crop: crop,
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
    }, [crop, mediaOrderIds, piece, removedImageUrls]);
    const selected = media.find((image) => image.url === selectedImage) || media[0];
    const validation = useMemo(() => validateOwnerArtwork(form), [form]);
    const listingStatus = validation.listingStatus;
    const fieldIssue = (field: OwnerArtworkField) => validation.byField.get(field);
    const releaseDateNeedsReview =
        Boolean(form.released_at) &&
        artworkReleaseDateNeedsReview({
            completed_at: piece.completed_at,
            released_at: form.released_at ? Date.parse(`${form.released_at}T12:00:00.000Z`) : null,
        });
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
            ready: !fieldIssue('piece_title') && !fieldIssue('piece_type'),
            detail:
                fieldIssue('piece_title')?.message ??
                fieldIssue('piece_type')?.message ??
                'Title and material are ready for the public listing.',
            actionLabel: fieldIssue('piece_title') ? 'Review title' : 'Review medium',
            href: fieldIssue('piece_title') ? '#artwork-title' : '#artwork-medium',
        },
        {
            key: 'dimensions',
            label: 'Physical dimensions',
            ready: !fieldIssue('real_width') && !fieldIssue('real_height'),
            detail:
                fieldIssue('real_width')?.message ??
                fieldIssue('real_height')?.message ??
                'Finished width and height are ready for the public listing.',
            actionLabel: 'Review dimensions',
            href: '#artwork-width',
        },
        ...(form.framed
            ? [
                  {
                      key: 'framed-dimensions',
                      label: 'Outside-frame dimensions',
                      ready:
                          !fieldIssue('framed_width') &&
                          !fieldIssue('framed_height') &&
                          !fieldIssue('framed_dimensions_verified'),
                      detail:
                          fieldIssue('framed_width')?.message ??
                          fieldIssue('framed_height')?.message ??
                          fieldIssue('framed_dimensions_verified')?.message ??
                          'The measured outside-frame size is verified.',
                      actionLabel: 'Review frame measurements',
                      href: '#artwork-framed-width',
                  },
              ]
            : []),
        {
            key: 'release-date',
            label: 'Release date',
            ready: !fieldIssue('released_at') && !releaseDateNeedsReview,
            detail:
                fieldIssue('released_at')?.message ??
                (releaseDateNeedsReview
                    ? 'This still matches the provisional completion-date baseline. Confirm the public release date.'
                    : 'The public release date is ready for newest-first ordering.'),
            actionLabel: 'Review release date',
            href: '#artwork-release-date',
        },
        {
            key: 'price-status',
            label: 'Price or listing status',
            ready: listingStatus !== 'available' || !fieldIssue('price'),
            detail:
                listingStatus !== 'available'
                    ? 'This status does not require a checkout price.'
                    : (fieldIssue('price')?.message ?? 'Checkout price is ready.'),
            actionLabel: 'Review price',
            href: '#artwork-price',
        },
        {
            key: 'story',
            label: 'Artwork story',
            ready: fieldIssue('description')?.tone !== 'error',
            detail: fieldIssue('description')?.message ?? 'The collector-facing story is ready.',
            actionLabel: 'Review story',
            href: '#artwork-story',
        },
    ] as const;
    const completedCount = checks.filter(({ ready }) => ready).length;
    const missingChecks = checks.filter(({ ready }) => !ready);
    const completeness = Math.round((completedCount / checks.length) * 100);
    const searchDescription =
        form.description.trim() ||
        `${form.piece_type || 'Original artwork'} by Jill Weeks Smith.${
            form.real_width && form.real_height ? ` ${form.real_width} × ${form.real_height} in.` : ''
        }`;
    const hasUnsavedChanges = JSON.stringify(form) !== JSON.stringify(savedForm);
    const fieldClass = (field: OwnerArtworkField, base = 'owner-field') => {
        const issue = fieldIssue(field);
        return [base, issue ? `has-${issue.tone}` : 'is-complete'].filter(Boolean).join(' ');
    };
    const describedBy = (field: OwnerArtworkField) => (fieldIssue(field) ? `artwork-${field}-feedback` : undefined);

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
        const stored = piece.instagram?.trim() ?? '';
        const normalized = normalizeInstagramShareReference(stored);
        if (!stored || stored === normalized) return;
        void repairStoredInstagramShareReference(piece.id);
    }, [piece.id, piece.instagram]);

    useEffect(() => {
        if (!media.some((image) => image.url === selectedImage)) setSelectedImage(piece.image_path);
    }, [media, piece.image_path, selectedImage]);

    function update<K extends keyof EditorForm>(key: K, value: EditorForm[K]) {
        setForm((current) => {
            const next = { ...current, [key]: value };
            if ((key === 'framed_width' || key === 'framed_height') && value !== current[key]) {
                next.framed_dimensions_verified = false;
            }
            if (key === 'framed' && value === true && (!current.framed_width || !current.framed_height)) {
                const estimate = estimateFramedDimensions(Number(current.real_width), Number(current.real_height));
                if (estimate) {
                    next.framed_width = String(estimate.widthInches);
                    next.framed_height = String(estimate.heightInches);
                    next.framed_dimensions_verified = false;
                }
            }
            return next;
        });
        setMessage(null);
    }

    function updateListingStatus(status: ArtworkListingStatus) {
        const listing = artworkAvailabilityForStatus(status);
        setForm((current) => ({ ...current, ...listing }));
        setMessage(null);
    }

    function openMediaManager() {
        setMediaMessage(null);
        setMediaUploadRole('extra');
        setMediaUploadVersion((current) => current + 1);
        setMediaOpen(true);
    }

    function beginPrimaryReplacement() {
        setMediaUploadRole('main');
        setMediaUploadVersion((current) => current + 1);
        setMediaMessage({
            tone: 'warning',
            text: 'Primary replacement selected. Choose a new full-resolution original below, then review it before saving.',
        });
        requestAnimationFrame(() => {
            document.getElementById('owner-media-upload-panel')?.scrollIntoView({
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
                block: 'start',
            });
        });
    }

    function updateCrop(edge: keyof ArtworkPresentationCrop, percent: number) {
        setCrop((current) => ({ ...current, [edge]: Math.min(20, Math.max(0, percent)) / 100 }));
        setMediaMessage(null);
    }

    async function detectPrimaryCrop() {
        setCropBusy('detect');
        setMediaMessage(null);
        try {
            const response = await fetch('/api/admin/media/crop-analysis', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ imageUrl: piece.image_path }),
            });
            const result = (await response.json()) as {
                success: boolean;
                detected?: boolean;
                crop?: ArtworkPresentationCrop;
                message?: string;
                error?: string;
            };
            if (!response.ok || !result.success || !result.crop) throw new Error(result.error || 'The image could not be analyzed.');
            setCrop(result.crop);
            setMediaMessage({ tone: result.detected ? 'warning' : 'good', text: result.message || 'Analysis complete.' });
        } catch (error) {
            setMediaMessage({ tone: 'warning', text: error instanceof Error ? error.message : 'The image could not be analyzed.' });
        } finally {
            setCropBusy(null);
        }
    }

    async function persistPrimaryCrop(nextCrop: ArtworkPresentationCrop | null = crop) {
        if (!piece.primary_media_id) {
            setMediaMessage({ tone: 'warning', text: 'The primary image record could not be found. Refresh and try again.' });
            return;
        }
        setCropBusy('save');
        setMediaMessage(null);
        const normalized = nextCrop && Object.values(nextCrop).some((value) => value > 0) ? nextCrop : null;
        const result = await saveMediaPresentationCrop(piece.id, piece.primary_media_id, normalized);
        if (result.success) {
            setCrop(normalized ?? { top: 0, right: 0, bottom: 0, left: 0 });
            setSavedCrop(normalized);
            setMediaMessage({ tone: 'good', text: normalized ? 'Visible crop saved across public artwork views.' : 'Original image presentation restored.' });
        } else {
            setMediaMessage({ tone: 'warning', text: result.error || 'The visible crop could not be saved.' });
        }
        setCropBusy(null);
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
        setAttemptedSave(true);
        if (!validation.canSave) {
            const firstError = validation.errors[0];
            setMessage({
                tone: 'warning',
                text: `${validation.errors.length} ${validation.errors.length === 1 ? 'field needs' : 'fields need'} attention before saving.`,
            });
            if (firstError) {
                requestAnimationFrame(() => {
                    document
                        .querySelector<HTMLElement>(
                            `[data-owner-field="${firstError.field}"] input, [data-owner-field="${firstError.field}"] select, [data-owner-field="${firstError.field}"] textarea`,
                        )
                        ?.focus();
                });
            }
            return;
        }
        setSaving(true);
        setMessage(null);
        try {
            const result = await onSubmitEditForm(form);
            if (result.success) {
                setSavedForm(form);
                setAttemptedSave(false);
            }
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
                            <Image src={selected.url} alt={form.piece_title} width={selected.width} height={selected.height} quality={95} />
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
                            <p>Required fields protect the public listing and checkout. Optional studio details stay private.</p>
                        </div>
                        <div className="owner-form-key" aria-label="Field requirement key">
                            <span className="is-required">Required</span>
                            <span className="is-publish">Publish required</span>
                            <span className="is-optional">Optional</span>
                        </div>
                    </header>
                    <div
                        className={`owner-form-validation-summary ${
                            validation.errors.length ? 'has-errors' : validation.warnings.length ? 'has-warnings' : 'is-complete'
                        }`}
                        role={attemptedSave && validation.errors.length ? 'alert' : 'status'}
                    >
                        {validation.errors.length ? <CircleAlert size={18} /> : <CircleCheck size={18} />}
                        <div>
                            <strong>
                                {validation.errors.length
                                    ? `${validation.errors.length} ${validation.errors.length === 1 ? 'field needs' : 'fields need'} attention`
                                    : validation.warnings.length
                                      ? `${validation.warnings.length} recommendations remain`
                                      : 'Artwork facts are complete'}
                            </strong>
                            <span>
                                {validation.errors.length
                                    ? 'Resolve the highlighted errors before saving this listing.'
                                    : validation.warnings.length
                                      ? 'This record can be saved; highlighted guidance will strengthen the public listing.'
                                      : 'The collector-facing essentials are ready to save.'}
                            </span>
                        </div>
                    </div>
                    <div className="owner-form-grid">
                        <label className={`${fieldClass('piece_title')} is-wide`} data-owner-field="piece_title">
                            <span className="owner-field-label">
                                <span>Title</span>
                                <small className="is-required">Required</small>
                            </span>
                            <input
                                id="artwork-title"
                                value={form.piece_title}
                                onChange={(event) => update('piece_title', event.target.value)}
                                aria-invalid={fieldIssue('piece_title')?.tone === 'error'}
                                aria-describedby={describedBy('piece_title')}
                                maxLength={160}
                                required
                            />
                            <FieldFeedback field="piece_title" issue={fieldIssue('piece_title')} />
                        </label>
                        <OwnerFormRow columns={3} className="is-wide">
                            <label className={fieldClass('piece_type')} data-owner-field="piece_type">
                                <span className="owner-field-label">
                                    <span>Medium</span>
                                    <small className="is-publish">Publish required</small>
                                </span>
                                <select
                                    id="artwork-medium"
                                    value={form.piece_type}
                                    onChange={(event) => update('piece_type', event.target.value)}
                                    aria-invalid={fieldIssue('piece_type')?.tone === 'error'}
                                    aria-describedby={describedBy('piece_type')}
                                    required={listingStatus === 'available'}
                                >
                                    <option value="">Choose a medium</option>
                                    {mediaOptions.map((medium) => (
                                        <option key={medium}>{medium}</option>
                                    ))}
                                </select>
                                <FieldFeedback field="piece_type" issue={fieldIssue('piece_type')} />
                            </label>
                            <label className="owner-field is-complete" data-owner-field="public_status">
                                <span className="owner-field-label">
                                    <span>Public status</span>
                                    <small className="is-required">Required</small>
                                </span>
                                <select
                                    id="artwork-public-status"
                                    value={listingStatus}
                                    onChange={(event) => updateListingStatus(event.target.value as ArtworkListingStatus)}
                                    aria-describedby="artwork-public-status-help"
                                >
                                    <option value="available">Available for purchase</option>
                                    <option value="sold">Sold — manual or external sale</option>
                                    <option value="not-for-sale">Not for sale</option>
                                </select>
                                <OwnerFieldFooter id="artwork-public-status-help" className="owner-field-feedback is-info">
                                    {listingStatus === 'available'
                                        ? 'Visible publicly and eligible for checkout.'
                                        : listingStatus === 'sold'
                                          ? 'Marked sold without requiring a Stripe checkout.'
                                          : 'Kept in the catalog without a purchase option.'}
                                </OwnerFieldFooter>
                            </label>
                            <div
                                className={
                                    releaseDateNeedsReview && !fieldIssue('released_at')
                                        ? 'owner-field has-warning'
                                        : fieldClass('released_at')
                                }
                                data-owner-field="released_at"
                            >
                                <span className="owner-field-label">
                                    <span>Release date</span>
                                    <small className="is-publish">Publish required</small>
                                </span>
                                <OwnerDatePicker
                                    id="artwork-release-date"
                                    value={form.released_at}
                                    onChange={(value) => update('released_at', value)}
                                    invalid={fieldIssue('released_at')?.tone === 'error'}
                                    describedBy={
                                        describedBy('released_at') ?? (releaseDateNeedsReview ? 'artwork-release-date-review' : undefined)
                                    }
                                    required={listingStatus === 'available'}
                                />
                                <FieldFeedback field="released_at" issue={fieldIssue('released_at')} />
                                {releaseDateNeedsReview && !fieldIssue('released_at') ? (
                                    <OwnerFieldFooter
                                        id="artwork-release-date-review"
                                        className="owner-field-feedback is-warning"
                                        aria-live="polite"
                                    >
                                        <CircleAlert size={12} />
                                        This still matches the provisional completion date. Confirm when collectors first saw this work.
                                    </OwnerFieldFooter>
                                ) : null}
                            </div>
                        </OwnerFormRow>
                        <fieldset
                            className={`${fieldClass('categories')} is-wide owner-category-fieldset`}
                            data-owner-field="categories"
                            aria-describedby={describedBy('categories')}
                        >
                            <legend className="owner-field-label">
                                <span>Categories</span>
                                <small className="is-optional">Recommended</small>
                            </legend>
                            <div className="owner-category-surface">
                                <header>
                                    <div>
                                        <strong>Collection placement</strong>
                                        <p>Choose every collection where this work naturally belongs.</p>
                                    </div>
                                    <span className={form.categories.length ? undefined : 'is-empty'}>
                                        {form.categories.length ? `${form.categories.length} selected` : 'None selected'}
                                    </span>
                                </header>
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
                                <FieldFeedback field="categories" issue={fieldIssue('categories')} />
                            </div>
                        </fieldset>
                        <OwnerFormRow className="is-wide">
                            <label className={fieldClass('price')} data-owner-field="price">
                                <span className="owner-field-label">
                                    <span>Price (USD)</span>
                                    <small className="is-publish">Publish required</small>
                                </span>
                                <input
                                    id="artwork-price"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={form.price}
                                    onChange={(event) => update('price', event.target.value)}
                                    aria-invalid={fieldIssue('price')?.tone === 'error'}
                                    aria-describedby={describedBy('price')}
                                    required={listingStatus === 'available'}
                                />
                                <FieldFeedback field="price" issue={fieldIssue('price')} />
                            </label>
                            <label className="owner-field is-complete">
                                <span className="owner-field-label">
                                    <span>Framing</span>
                                    <small className="is-required">Required</small>
                                </span>
                                <select
                                    value={form.framed ? 'framed' : 'unframed'}
                                    onChange={(event) => update('framed', event.target.value === 'framed')}
                                    aria-describedby="artwork-framing-help"
                                >
                                    <option value="framed">Framed</option>
                                    <option value="unframed">Unframed</option>
                                </select>
                                <OwnerFieldFooter id="artwork-framing-help" className="owner-field-feedback is-info">
                                    Used for the public listing and shipping calculation.
                                </OwnerFieldFooter>
                            </label>
                        </OwnerFormRow>
                        <OwnerFormRow className="is-wide">
                            <label className={fieldClass('real_width')} data-owner-field="real_width">
                                <span className="owner-field-label">
                                    <span>Width (in)</span>
                                    <small className="is-publish">Publish required</small>
                                </span>
                                <input
                                    id="artwork-width"
                                    type="number"
                                    min="0"
                                    step="0.25"
                                    value={form.real_width}
                                    onChange={(event) => update('real_width', event.target.value)}
                                    aria-invalid={fieldIssue('real_width')?.tone === 'error'}
                                    aria-describedby={describedBy('real_width')}
                                    required={listingStatus === 'available'}
                                />
                                <FieldFeedback field="real_width" issue={fieldIssue('real_width')} />
                            </label>
                            <label className={fieldClass('real_height')} data-owner-field="real_height">
                                <span className="owner-field-label">
                                    <span>Height (in)</span>
                                    <small className="is-publish">Publish required</small>
                                </span>
                                <input
                                    id="artwork-height"
                                    type="number"
                                    min="0"
                                    step="0.25"
                                    value={form.real_height}
                                    onChange={(event) => update('real_height', event.target.value)}
                                    aria-invalid={fieldIssue('real_height')?.tone === 'error'}
                                    aria-describedby={describedBy('real_height')}
                                    required={listingStatus === 'available'}
                                />
                                <FieldFeedback field="real_height" issue={fieldIssue('real_height')} />
                            </label>
                        </OwnerFormRow>
                        {form.framed ? (
                            <fieldset className="owner-frame-dimensions is-wide">
                                <legend>
                                    <span>
                                        <strong>Outside-frame size</strong>
                                        <small>
                                            {form.framed_dimensions_verified ? 'Measured and verified' : 'Estimated until Jill measures it'}
                                        </small>
                                    </span>
                                    <small className={form.framed_dimensions_verified ? 'is-verified' : 'is-estimated'}>
                                        {form.framed_dimensions_verified ? 'Verified' : 'Estimate'}
                                    </small>
                                </legend>
                                <OwnerFormRow className="is-wide">
                                    <label className={fieldClass('framed_width')} data-owner-field="framed_width">
                                        <span className="owner-field-label">
                                            <span>Framed width (in)</span>
                                            <small className="is-optional">Outside edge</small>
                                        </span>
                                        <input
                                            id="artwork-framed-width"
                                            type="number"
                                            min="0"
                                            step="0.25"
                                            value={form.framed_width}
                                            onChange={(event) => update('framed_width', event.target.value)}
                                            aria-invalid={fieldIssue('framed_width')?.tone === 'error'}
                                            aria-describedby={describedBy('framed_width')}
                                        />
                                        <FieldFeedback field="framed_width" issue={fieldIssue('framed_width')} />
                                    </label>
                                    <label className={fieldClass('framed_height')} data-owner-field="framed_height">
                                        <span className="owner-field-label">
                                            <span>Framed height (in)</span>
                                            <small className="is-optional">Outside edge</small>
                                        </span>
                                        <input
                                            id="artwork-framed-height"
                                            type="number"
                                            min="0"
                                            step="0.25"
                                            value={form.framed_height}
                                            onChange={(event) => update('framed_height', event.target.value)}
                                            aria-invalid={fieldIssue('framed_height')?.tone === 'error'}
                                            aria-describedby={describedBy('framed_height')}
                                        />
                                        <FieldFeedback field="framed_height" issue={fieldIssue('framed_height')} />
                                    </label>
                                </OwnerFormRow>
                                <label
                                    id="artwork-framed-verification"
                                    className={`owner-frame-verification ${form.framed_dimensions_verified ? 'is-verified' : ''}`}
                                    data-owner-field="framed_dimensions_verified"
                                >
                                    <input
                                        type="checkbox"
                                        checked={form.framed_dimensions_verified}
                                        disabled={!form.framed_width || !form.framed_height}
                                        onChange={(event) => update('framed_dimensions_verified', event.target.checked)}
                                    />
                                    <span>
                                        <strong>I measured the outside frame and verified these dimensions.</strong>
                                        <small>
                                            Until checked, the estimate can still be shown at scale but remains clearly labeled.
                                        </small>
                                    </span>
                                </label>
                                <FieldFeedback
                                    field="framed_dimensions_verified"
                                    issue={fieldIssue('framed_dimensions_verified')}
                                />
                            </fieldset>
                        ) : null}
                        <label className={`${fieldClass('description')} is-wide`} data-owner-field="description">
                            <span className="owner-field-label">
                                <span>Artwork story</span>
                                <small className="is-optional">Optional</small>
                            </span>
                            <textarea
                                id="artwork-story"
                                value={form.description}
                                onChange={(event) => update('description', event.target.value)}
                                aria-invalid={fieldIssue('description')?.tone === 'error'}
                                aria-describedby={describedBy('description')}
                                maxLength={5000}
                            />
                            <div className="owner-field-meta">
                                <FieldFeedback field="description" issue={fieldIssue('description')} />
                                <small>{form.description.length.toLocaleString()} / 5,000</small>
                            </div>
                        </label>
                        <label className="owner-field is-wide">
                            <span className="owner-field-label">
                                <span>Private studio notes</span>
                                <small className="is-optional">Optional · private</small>
                            </span>
                            <textarea value={form.comments} onChange={(event) => update('comments', event.target.value)} maxLength={5000} />
                            <OwnerFieldFooter className="owner-field-feedback is-info">
                                Visible only in the studio manager.
                            </OwnerFieldFooter>
                        </label>
                        <label className={`${fieldClass('instagram')} is-wide`} data-owner-field="instagram">
                            <span className="owner-field-label">
                                <span>Instagram share reference</span>
                                <small className="is-optional">Optional</small>
                            </span>
                            <input
                                id="artwork-instagram"
                                type="text"
                                value={form.instagram}
                                onChange={(event) => update('instagram', normalizeInstagramShareReference(event.target.value))}
                                aria-invalid={fieldIssue('instagram')?.tone === 'error'}
                                aria-describedby={describedBy('instagram') || 'artwork-instagram-help'}
                                placeholder="Mzc3ZTVlOWMwZA%3D%3D"
                                maxLength={512}
                            />
                            {fieldIssue('instagram') ? (
                                <FieldFeedback field="instagram" issue={fieldIssue('instagram')} />
                            ) : (
                                <OwnerFieldFooter id="artwork-instagram-help" className="owner-field-feedback is-info">
                                    Paste only the token after “?igsh=”. If you paste the full shared link or include “?igsh=”, it is
                                    removed automatically.
                                </OwnerFieldFooter>
                            )}
                        </label>
                    </div>
                </section>
            </section>
            <aside className="owner-editor-aside">
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
                            <span className="owner-search-result-icon">
                                <Image src="/logo/JWS_ICON_260.png" alt="" width={28} height={28} />
                            </span>
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
                                                    <div className="owner-media-primary-actions">
                                                        <button
                                                            type="button"
                                                            onClick={beginPrimaryReplacement}
                                                            aria-describedby="owner-media-primary-guidance"
                                                            title="Upload a new full-resolution original to replace the image used across the public site"
                                                        >
                                                            <Replace size={14} aria-hidden="true" />
                                                            Replace primary
                                                        </button>
                                                        <small id="owner-media-primary-guidance">
                                                            Used on the homepage, catalog, and artwork page.
                                                        </small>
                                                        <button
                                                            type="button"
                                                            onClick={() => setCropOpen((current) => !current)}
                                                            aria-expanded={cropOpen}
                                                            aria-controls="owner-primary-crop-editor"
                                                            title="Hide uniform padding in public presentations without changing the original file"
                                                        >
                                                            <Crop size={14} aria-hidden="true" />
                                                            Adjust visible crop
                                                        </button>
                                                    </div>
                                                )}
                                            </article>
                                        );
                                    })}
                                </div>
                                {cropOpen ? (
                                    <section className="owner-crop-editor" id="owner-primary-crop-editor" aria-labelledby="owner-primary-crop-title">
                                        <header>
                                            <div>
                                                <span className="owner-panel-eyebrow">Non-destructive presentation</span>
                                                <h3 id="owner-primary-crop-title">Remove visible edge padding</h3>
                                                <p>The original upload stays untouched. This only changes how the primary image is framed in public artwork views.</p>
                                            </div>
                                            <button type="button" onClick={detectPrimaryCrop} disabled={cropBusy !== null}>
                                                <ScanLine size={15} /> {cropBusy === 'detect' ? 'Analyzing…' : 'Suggest crop'}
                                            </button>
                                        </header>
                                        <div className="owner-crop-previews">
                                            <figure>
                                                <figcaption>Original</figcaption>
                                                <div><Image src={piece.image_path} alt={`${piece.title} original presentation`} fill quality={95} sizes="360px" /></div>
                                            </figure>
                                            <figure>
                                                <figcaption>Rendered preview</figcaption>
                                                <div><ArtworkPresentationImage src={piece.image_path} crop={crop} alt={`${piece.title} cropped presentation preview`} fill quality={95} sizes="360px" /></div>
                                            </figure>
                                        </div>
                                        <div className="owner-crop-controls">
                                            {(['top', 'right', 'bottom', 'left'] as const).map((edge) => (
                                                <label key={edge}>
                                                    <span>{edge}</span>
                                                    <span><input type="number" min="0" max="20" step="0.1" value={Math.round(crop[edge] * 1000) / 10} onChange={(event) => updateCrop(edge, Number(event.target.value))} />%</span>
                                                </label>
                                            ))}
                                        </div>
                                        <footer>
                                            <small>Use the smallest inset that removes padding. Maximum 20% per edge.</small>
                                            <div>
                                                <button type="button" onClick={() => void persistPrimaryCrop(null)} disabled={cropBusy !== null || savedCrop === null}><RotateCcw size={14} /> Reset original</button>
                                                <button className="is-primary" type="button" onClick={() => void persistPrimaryCrop()} disabled={cropBusy !== null || JSON.stringify(crop) === JSON.stringify(savedCrop ?? { top: 0, right: 0, bottom: 0, left: 0 })}><Save size={14} /> {cropBusy === 'save' ? 'Saving…' : 'Save visible crop'}</button>
                                            </div>
                                        </footer>
                                    </section>
                                ) : null}
                            </section>
                            <section className="owner-media-upload-panel" id="owner-media-upload-panel">
                                <div>
                                    <span className="owner-panel-eyebrow">
                                        {mediaUploadRole === 'main' ? 'Replace primary' : 'Add media'}
                                    </span>
                                    <h3>{mediaUploadRole === 'main' ? 'Choose the new primary original' : 'Upload another original'}</h3>
                                    <p>
                                        {mediaUploadRole === 'main'
                                            ? 'Choose the highest-quality original. You will review it before the current public image changes.'
                                            : 'Drop an image anywhere in this window, or select a file below. Choose its role after upload.'}
                                    </p>
                                </div>
                                <ImageEditor
                                    key={`${piece.id}-${mediaUploadVersion}`}
                                    pieceId={String(piece.id)}
                                    onClose={() => setMediaOpen(false)}
                                    initialRole={mediaUploadRole}
                                />
                            </section>
                        </div>
                    </section>
                </div>
            ) : null}
        </div>
    );
}
