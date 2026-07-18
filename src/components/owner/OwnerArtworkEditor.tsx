'use client';

import { ArrowLeft, ArrowRight, Check, ExternalLink, Images, Save } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { PiecesWithImages } from '@/db/schema';
import { onSubmitEditForm } from '@/app/admin/edit/actions';

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
        available: Boolean(piece.available),
        framed: Boolean(piece.framed),
        comments: piece.comments || '',
        image_path: piece.image_path,
    };
}

const mediaOptions = ['Oil On Canvas', 'Oil On Panel', 'Oil On Cradled Panel', 'Intaglio On Paper', 'Linocut On Paper', 'Pastel On Paper'];

export function OwnerArtworkEditor({ piece, previousId, nextId }: { piece: PiecesWithImages; previousId: number; nextId: number }) {
    const [form, setForm] = useState(() => initialForm(piece));
    const [selectedImage, setSelectedImage] = useState(piece.image_path);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ tone: 'good' | 'warning'; text: string } | null>(null);
    const media = useMemo(
        () => [
            { id: `primary-${piece.id}`, url: piece.image_path, width: piece.width, height: piece.height, role: 'Primary' },
            ...piece.extraImages.map((image, index) => ({ ...image, url: image.image_path, role: `Supporting ${index + 1}` })),
            ...piece.progressImages.map((image, index) => ({ ...image, url: image.image_path, role: `Process ${index + 1}` })),
        ],
        [piece],
    );
    const selected = media.find((image) => image.url === selectedImage) || media[0];
    const checks = [
        ['Primary image', Boolean(piece.image_path)],
        ['Title and medium', Boolean(form.piece_title && form.piece_type)],
        ['Physical dimensions', Boolean(form.real_width && form.real_height)],
        ['Price or sold status', Boolean(form.price || form.sold)],
        ['Artwork story', Boolean(form.description)],
    ] as const;
    const completeness = Math.round((checks.filter(([, ready]) => ready).length / checks.length) * 100);

    function update<K extends keyof EditorForm>(key: K, value: EditorForm[K]) {
        setForm((current) => ({ ...current, [key]: value }));
        setMessage(null);
    }

    async function save() {
        setSaving(true);
        const result = await onSubmitEditForm(form);
        setSaving(false);
        setMessage({
            tone: result.success ? 'good' : 'warning',
            text: result.success ? 'Changes saved.' : result.error || 'The artwork could not be saved.',
        });
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
                        <Link className="owner-button" href={`/admin/edit?id=${previousId}`} aria-label="Previous artwork">
                            <ArrowLeft size={16} /> Previous
                        </Link>
                        <Link className="owner-button" href={`/admin/edit?id=${nextId}`} aria-label="Next artwork">
                            Next <ArrowRight size={16} />
                        </Link>
                        <Link className="owner-button" href={`/work/${piece.slug || piece.id}`} target="_blank">
                            Preview <ExternalLink size={15} />
                        </Link>
                        <button className="owner-button is-primary" type="button" onClick={save} disabled={saving}>
                            <Save size={16} /> {saving ? 'Saving…' : 'Save changes'}
                        </button>
                    </div>
                </header>
                {message ? <p className={`owner-editor-message is-${message.tone}`}>{message.text}</p> : null}
                <div className="owner-editor-media">
                    <div className="owner-editor-stage">
                        <Image src={selected.url} alt={form.piece_title} width={selected.width} height={selected.height} quality={100} />
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
                        <Link className="owner-editor-add-media" href={`/admin/edit/images/${piece.id}`}>
                            <Images size={20} /> Manage media
                        </Link>
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
                            <input value={form.piece_title} onChange={(event) => update('piece_title', event.target.value)} required />
                        </label>
                        <label className="owner-field">
                            <span>Medium</span>
                            <select value={form.piece_type} onChange={(event) => update('piece_type', event.target.value)}>
                                <option value="">Choose a medium</option>
                                {mediaOptions.map((medium) => (
                                    <option key={medium}>{medium}</option>
                                ))}
                            </select>
                        </label>
                        <label className="owner-field">
                            <span>Collection tags</span>
                            <input
                                value={form.theme}
                                onChange={(event) => update('theme', event.target.value)}
                                placeholder="Water, Landscape"
                            />
                        </label>
                        <label className="owner-field">
                            <span>Price (USD)</span>
                            <input
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
                            <textarea value={form.description} onChange={(event) => update('description', event.target.value)} />
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
                <section className="owner-panel">
                    <span className="owner-panel-eyebrow">Publish check</span>
                    <h2>{completeness === 100 ? 'Ready' : 'Needs attention'}</h2>
                    <div className="owner-completion" aria-label={`${completeness}% complete`}>
                        <strong>{completeness}%</strong>
                        <span style={{ width: `${completeness}%` }} />
                    </div>
                    <ul className="owner-checklist">
                        {checks.map(([label, ready]) => (
                            <li className={ready ? 'is-ready' : undefined} key={label}>
                                <Check size={14} /> {label}
                            </li>
                        ))}
                    </ul>
                </section>
                <section className="owner-panel">
                    <span className="owner-panel-eyebrow">Listing state</span>
                    <div className="owner-toggle-list">
                        <label>
                            <input
                                type="checkbox"
                                checked={form.available}
                                onChange={(event) => update('available', event.target.checked)}
                            />{' '}
                            Available for purchase
                        </label>
                        <label>
                            <input type="checkbox" checked={form.sold} onChange={(event) => update('sold', event.target.checked)} /> Sold
                        </label>
                    </div>
                </section>
                <section className="owner-panel owner-search-preview">
                    <span className="owner-panel-eyebrow">Search preview</span>
                    <strong>{form.piece_title || 'Untitled artwork'} · Jill Weeks Smith</strong>
                    <small>jwsfineart.com/work/{piece.slug || piece.id}</small>
                    <p>{form.description || 'Add an artwork story to improve this search preview.'}</p>
                </section>
            </aside>
        </div>
    );
}
