'use client';

import { Check, ImagePlus } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createNewPiece } from '@/app/admin/edit/actions';
import ResizeUploader from '@/app/admin/edit/ResizeUploader';

export default function CreatePiece() {
    const router = useRouter();
    const [upload, setUpload] = useState({ url: '', title: '', width: 0, height: 0 });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const reset = useCallback(() => {
        setUpload({ url: '', title: '', width: 0, height: 0 });
        setMessage(null);
    }, []);
    const completed = useCallback((name: string, url: string, _small: string, width: number, height: number) => {
        setUpload({ url, title: name.replace(/\.[^.]+$/, ''), width, height });
        setMessage(null);
    }, []);

    async function create(destination: 'edit' | 'media') {
        setSaving(true);
        const result = await createNewPiece({
            title: upload.title,
            imagePath: upload.url,
            width: upload.width,
            height: upload.height,
            smallImagePath: '',
            smallWidth: 0,
            smallHeight: 0,
        });
        setSaving(false);
        if (!result.success || !result.piece) {
            setMessage(result.error || 'The artwork could not be created.');
            return;
        }
        router.push(destination === 'media' ? `/admin/edit/images/${result.piece.id}` : `/admin/edit?id=${result.piece.id}`);
    }

    return (
        <div className="owner-upload-workspace">
            <ResizeUploader handleUploadComplete={completed} handleResetInputs={reset} backToEditLink="/admin/artwork" />
            {upload.url ? (
                <div className="owner-upload-review">
                    <div className="owner-upload-preview">
                        <Image src={upload.url} alt="New artwork" width={upload.width} height={upload.height} quality={100} />
                    </div>
                    <section className="owner-panel owner-form-grid">
                        <label className="owner-field is-wide">
                            <span>Artwork title</span>
                            <input
                                value={upload.title}
                                onChange={(event) => setUpload((current) => ({ ...current, title: event.target.value }))}
                                required
                            />
                        </label>
                        <div className="owner-upload-facts is-wide">
                            <span>
                                <Check size={15} /> Original retained
                            </span>
                            <span>
                                {upload.width.toLocaleString()} × {upload.height.toLocaleString()} pixels
                            </span>
                            <span>Starts unpublished until details are complete</span>
                        </div>
                        <div className="owner-inline-form is-wide">
                            <button
                                className="owner-button is-primary"
                                type="button"
                                onClick={() => create('edit')}
                                disabled={saving || !upload.title.trim()}
                            >
                                {saving ? 'Creating…' : 'Create and add details'}
                            </button>
                            <button
                                className="owner-button"
                                type="button"
                                onClick={() => create('media')}
                                disabled={saving || !upload.title.trim()}
                            >
                                <ImagePlus size={16} /> Create and add images
                            </button>
                        </div>
                    </section>
                </div>
            ) : (
                <div className="owner-upload-empty">
                    <ImagePlus size={34} />
                    <h2>Begin with the primary image</h2>
                    <p>The new artwork stays out of the public catalog until Jill completes its details and marks it available.</p>
                </div>
            )}
            {message ? <p className="owner-editor-message is-warning">{message}</p> : null}
        </div>
    );
}
