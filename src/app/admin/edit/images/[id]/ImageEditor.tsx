'use client';

import { Check, ImagePlus, Images, Paintbrush, Replace } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storeUploadedImageDetails } from '@/app/admin/edit/actions';
import ResizeUploader from '@/app/admin/edit/ResizeUploader';

export default function ImageEditor({
    pieceId,
    onClose,
    initialRole = 'extra',
}: {
    pieceId: string;
    onClose?: () => void;
    initialRole?: 'main' | 'extra' | 'progress';
}) {
    const router = useRouter();
    const [upload, setUpload] = useState({ url: '', title: '', width: 0, height: 0 });
    const [role, setRole] = useState<'main' | 'extra' | 'progress'>(initialRole);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string; tone: 'good' | 'warning' } | null>(null);
    const reset = useCallback(() => {
        setUpload({ url: '', title: '', width: 0, height: 0 });
        setMessage(null);
    }, []);
    const completed = useCallback((name: string, url: string, _small: string, width: number, height: number) => {
        setUpload({ url, title: name.replace(/\.[^.]+$/, ''), width, height });
        setMessage(null);
    }, []);

    async function save(addAnother: boolean) {
        if (!upload.url) {
            setMessage({ text: 'Choose an image before saving.', tone: 'warning' });
            return;
        }
        setSaving(true);
        setMessage(null);
        try {
            const result = await storeUploadedImageDetails({
                piece_id: pieceId,
                image_path: upload.url,
                title: upload.title,
                piece_type: role,
                width: String(upload.width),
                height: String(upload.height),
                small_image_path: '',
                small_width: '0',
                small_height: '0',
            });
            if (!result.success) {
                setMessage({ text: result.error || 'The image could not be saved.', tone: 'warning' });
                return;
            }
            if (addAnother) {
                reset();
                setMessage({ text: 'Image saved. Choose another original when ready.', tone: 'good' });
                router.refresh();
            } else if (onClose) {
                router.refresh();
                onClose();
            } else {
                router.push(`/admin/edit?id=${pieceId}`);
            }
        } catch {
            setMessage({ text: 'The image could not be saved. Check your connection and try again.', tone: 'warning' });
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="owner-upload-workspace">
            <ResizeUploader
                handleUploadComplete={completed}
                handleResetInputs={reset}
                backToEditLink={onClose ? undefined : `/admin/edit?id=${pieceId}`}
                dropAnywhere={Boolean(onClose)}
            />
            {upload.url ? (
                <div className="owner-upload-review">
                    <div className="owner-upload-preview">
                        <span className="owner-upload-preview-label">
                            Full image · {upload.width.toLocaleString()} × {upload.height.toLocaleString()} px
                        </span>
                        <Image
                            src={upload.url}
                            alt="Uploaded artwork"
                            width={upload.width}
                            height={upload.height}
                            sizes="(max-width: 1050px) 92vw, 58vw"
                        />
                    </div>
                    <section className="owner-panel owner-upload-review-panel">
                        <header>
                            <span className="owner-eyebrow">Review upload</span>
                            <h2>How should this image be used?</h2>
                            <p>The original is already uploaded. Choose its role, then save it to this artwork.</p>
                        </header>
                        <fieldset className="owner-upload-role-fieldset">
                            <legend>Image role</legend>
                            <div className="owner-upload-role-grid">
                                <button type="button" className={role === 'extra' ? 'is-selected' : ''} onClick={() => setRole('extra')}>
                                    <Images size={18} />
                                    <span>
                                        <strong>Supporting</strong>
                                        <small>Detail or alternate view</small>
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    className={role === 'progress' ? 'is-selected' : ''}
                                    onClick={() => setRole('progress')}
                                >
                                    <Paintbrush size={18} />
                                    <span>
                                        <strong>Process</strong>
                                        <small>Studio or work in progress</small>
                                    </span>
                                </button>
                                <button type="button" className={role === 'main' ? 'is-selected' : ''} onClick={() => setRole('main')}>
                                    <Replace size={18} />
                                    <span>
                                        <strong>Primary</strong>
                                        <small>Replace the catalog image</small>
                                    </span>
                                </button>
                            </div>
                        </fieldset>
                        {role === 'main' ? (
                            <p className="owner-editor-message is-warning">
                                Saving will replace the primary image shown throughout the public site.
                            </p>
                        ) : null}
                        <label className="owner-field">
                            <span>Internal title</span>
                            <input
                                value={upload.title}
                                onChange={(event) => setUpload((current) => ({ ...current, title: event.target.value }))}
                                placeholder="Optional label for the studio"
                            />
                        </label>
                        <div className="owner-upload-facts">
                            <span>
                                <Check size={15} /> Original retained
                            </span>
                            <span>
                                {upload.width.toLocaleString()} × {upload.height.toLocaleString()} pixels
                            </span>
                            <span>No destructive compression</span>
                        </div>
                        <div className="owner-upload-actions">
                            <button className="owner-button is-primary" type="button" onClick={() => save(false)} disabled={saving}>
                                {saving ? 'Saving…' : 'Save and return'}
                            </button>
                            <button className="owner-button" type="button" onClick={() => save(true)} disabled={saving}>
                                <ImagePlus size={16} /> Save and add another
                            </button>
                        </div>
                    </section>
                </div>
            ) : (
                <div className="owner-upload-empty">
                    <ImagePlus size={34} />
                    <h2>No image selected</h2>
                    <p>The uploaded original will appear here for review before it is added to the artwork.</p>
                </div>
            )}
            {message ? (
                <p className={`owner-editor-message is-${message.tone}`} role="status">
                    {message.text}
                </p>
            ) : null}
        </div>
    );
}
