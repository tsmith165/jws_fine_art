import { Archive, Edit3, Plus, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { OwnerHeading, OwnerShell, OwnerStatus } from '@/components/owner/OwnerShell';
import { readOwnerArtworks } from '@/data/ownerReads';
import { setActive, setInactive } from '@/app/admin/manage/actions';

export const dynamic = 'force-dynamic';

export default async function OwnerArtworkPage({ searchParams }: { searchParams: Promise<{ q?: string; filter?: string }> }) {
    const params = await searchParams;
    const all = [...(await readOwnerArtworks('gallery')), ...(await readOwnerArtworks('archive'))];
    const query = (params.q || '').trim().toLowerCase();
    const filter = params.filter || 'active';
    const pieces = all.filter((piece) => {
        if (filter === 'active' && !piece.active) return false;
        if (filter === 'archive' && piece.active) return false;
        if (
            filter === 'needs-details' &&
            piece.title &&
            piece.piece_type &&
            piece.real_width &&
            piece.real_height &&
            (piece.sold || piece.price > 0)
        )
            return false;
        return !query || `${piece.title} ${piece.piece_type || ''} ${piece.theme || ''}`.toLowerCase().includes(query);
    });
    async function archive(formData: FormData) {
        'use server';
        await setInactive(Number(formData.get('id')));
    }
    async function restore(formData: FormData) {
        'use server';
        await setActive(Number(formData.get('id')));
    }
    return (
        <OwnerShell active="/admin/artwork" title="Artwork workspace">
            <section className="owner-content">
                <OwnerHeading
                    eyebrow="Catalog"
                    title="Artwork"
                    description={`${all.filter((piece) => piece.active).length} active pieces · ${all.filter((piece) => !piece.active).length} archived`}
                    action={
                        <Link className="owner-button is-primary" href="/admin/edit/new">
                            <Plus size={16} /> New piece
                        </Link>
                    }
                />
                <form className="owner-toolbar" action="/admin/artwork">
                    <label className="owner-search">
                        <Search size={17} aria-hidden="true" />
                        <span className="sr-only">Search artwork</span>
                        <input name="q" defaultValue={params.q} placeholder="Search title, medium, or collection" />
                    </label>
                    <div className="owner-inline-form">
                        <select name="filter" defaultValue={filter} aria-label="Catalog view">
                            <option value="active">Active artwork</option>
                            <option value="all">All artwork</option>
                            <option value="needs-details">Needs details</option>
                            <option value="archive">Archive</option>
                        </select>
                        <button className="owner-button" type="submit">
                            Apply
                        </button>
                    </div>
                </form>
                <div className="owner-catalog">
                    {pieces.length ? (
                        pieces.map((piece) => (
                            <article className="owner-art-row" key={piece.id}>
                                <Image
                                    src={piece.small_image_path || piece.image_path}
                                    alt=""
                                    width={piece.small_width || piece.width}
                                    height={piece.small_height || piece.height}
                                />
                                <div>
                                    <strong>{piece.title}</strong>
                                    <p>{piece.piece_type || 'Medium not set'}</p>
                                </div>
                                <div>
                                    <strong>{piece.price > 0 ? `$${piece.price.toLocaleString()}` : 'Price not set'}</strong>
                                    <small>
                                        {piece.real_width && piece.real_height
                                            ? `${piece.real_width} × ${piece.real_height} in`
                                            : 'Dimensions not set'}
                                    </small>
                                </div>
                                <div>
                                    <OwnerStatus tone={!piece.active || piece.sold ? 'neutral' : piece.available ? 'good' : 'warning'}>
                                        {!piece.active ? 'Archived' : piece.sold ? 'Sold' : piece.available ? 'Available' : 'Not listed'}
                                    </OwnerStatus>
                                </div>
                                <div className="owner-art-row-actions">
                                    <Link className="owner-button" href={`/admin/edit?id=${piece.id}`} aria-label={`Edit ${piece.title}`}>
                                        <Edit3 size={15} /> Edit
                                    </Link>
                                    <form action={piece.active ? archive : restore}>
                                        <input type="hidden" name="id" value={piece.id} />
                                        <button
                                            className="owner-button"
                                            type="submit"
                                            aria-label={`${piece.active ? 'Archive' : 'Restore'} ${piece.title}`}
                                        >
                                            <Archive size={15} /> {piece.active ? 'Archive' : 'Restore'}
                                        </button>
                                    </form>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="owner-panel" style={{ textAlign: 'center', padding: '80px 24px' }}>
                            <h2>No artwork in this view.</h2>
                            <p>Change the search or filter, or add a new piece.</p>
                        </div>
                    )}
                </div>
            </section>
        </OwnerShell>
    );
}
