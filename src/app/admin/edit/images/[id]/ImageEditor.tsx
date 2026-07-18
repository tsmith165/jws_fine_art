'use client';

import { Check, ImagePlus } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storeUploadedImageDetails } from '@/app/admin/edit/actions';
import ResizeUploader from '@/app/admin/edit/ResizeUploader';

export default function ImageEditor({ pieceId }: { pieceId: string }) {
    const router = useRouter();
    const [upload, setUpload] = useState({ url: '', title: '', width: 0, height: 0 });
    const [role, setRole] = useState('extra');
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

    async function save(addAnother: boolean) {
        setSaving(true);
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
        setSaving(false);
        if (!result.success) {
            setMessage(result.error || 'The image could not be saved.');
            return;
        }
        if (addAnother) {
            reset();
            setMessage('Image saved. Choose another original when ready.');
        } else {
            router.push(`/admin/edit?id=${pieceId}`);
        }
    }

    return (
        <div className="owner-upload-workspace">
            <ResizeUploader handleUploadComplete={completed} handleResetInputs={reset} backToEditLink={`/admin/edit?id=${pieceId}`} />
            {upload.url ? (
                <div className="owner-upload-review">
                    <div className="owner-upload-preview">
                        <Image src={upload.url} alt="Uploaded artwork" width={upload.width} height={upload.height} quality={100} />
                    </div>
                    <section className="owner-panel owner-form-grid">
                        <label className="owner-field">
                            <span>Image role</span>
                            <select value={role} onChange={(event) => setRole(event.target.value)}>
                                <option value="main">Replace primary image</option>
                                <option value="extra">Supporting image</option>
                                <option value="progress">Process image</option>
                            </select>
                        </label>
                        <label className="owner-field">
                            <span>Internal title</span>
                            <input
                                value={upload.title}
                                onChange={(event) => setUpload((current) => ({ ...current, title: event.target.value }))}
                            />
                        </label>
                        <div className="owner-upload-facts is-wide">
                            <span>
                                <Check size={15} /> Original retained
                            </span>
                            <span>
                                {upload.width.toLocaleString()} × {upload.height.toLocaleString()} pixels
                            </span>
                            <span>No destructive compression</span>
                        </div>
                        <div className="owner-inline-form is-wide">
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
            {message ? <p className="owner-editor-message">{message}</p> : null}
        </div>
    );
}
