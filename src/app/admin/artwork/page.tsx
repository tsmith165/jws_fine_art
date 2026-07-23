import { Archive, Edit3, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { OwnerHeading, OwnerShell, OwnerStatus } from '@/components/owner/OwnerShell';
import { OwnerCatalogFilters } from '@/components/owner/OwnerCatalogFilters';
import { readOwnerArtworksWithMedia } from '@/data/ownerReads';
import { setActive, setInactive } from '@/app/admin/manage/actions';
import { ownerArtworkAttention } from '@/lib/ownerArtworkAttention';
import { filterCategorizerArtworks } from '@/lib/ownerArtworkFilters';

export const dynamic = 'force-dynamic';

export default async function OwnerArtworkPage({ searchParams }: { searchParams: Promise<{ q?: string; filter?: string }> }) {
    const params = await searchParams;
    const all = (await readOwnerArtworksWithMedia()).sort((a, b) => a.o_id - b.o_id || a.id - b.id);
    const attentionById = new Map(all.map((piece) => [piece.id, ownerArtworkAttention(piece)]));
    const attentionCount = filterCategorizerArtworks(all).filter((piece) => (attentionById.get(piece.id)?.length ?? 0) > 0).length;
    const query = (params.q || '').trim().toLowerCase();
    const filter = params.filter || 'active';
    const pieces = all.filter((piece) => {
        if (filter === 'active' && !piece.active) return false;
        if (filter === 'archive' && piece.active) return false;
        if (filter === 'needs-details' && !piece.active) return false;
        if (filter === 'needs-details' && (attentionById.get(piece.id)?.length ?? 0) === 0) return false;
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
                <OwnerCatalogFilters initialQuery={params.q || ''} initialFilter={filter} attentionCount={attentionCount} />
                <div className="owner-catalog">
                    {pieces.length ? (
                        pieces.map((piece) => {
                            const issues = attentionById.get(piece.id) ?? [];
                            return (
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
                                        {filter === 'needs-details' ? (
                                            <>
                                                <strong>{issues[0]?.label}</strong>
                                                <small>{issues[0]?.detail}</small>
                                            </>
                                        ) : (
                                            <>
                                                <strong>{piece.price > 0 ? `$${piece.price.toLocaleString()}` : 'Price not set'}</strong>
                                                <small>
                                                    {piece.real_width && piece.real_height
                                                        ? `${piece.real_width} × ${piece.real_height} in`
                                                        : 'Dimensions not set'}
                                                </small>
                                            </>
                                        )}
                                    </div>
                                    <div>
                                        <OwnerStatus
                                            tone={
                                                filter === 'needs-details'
                                                    ? 'warning'
                                                    : !piece.active || piece.sold
                                                      ? 'neutral'
                                                      : piece.available
                                                        ? 'good'
                                                        : 'warning'
                                            }
                                        >
                                            {filter === 'needs-details'
                                                ? `${issues.length} ${issues.length === 1 ? 'issue' : 'issues'}`
                                                : !piece.active
                                                  ? 'Archived'
                                                  : piece.sold
                                                    ? 'Sold'
                                                    : piece.available
                                                      ? 'Available'
                                                      : 'Not listed'}
                                        </OwnerStatus>
                                    </div>
                                    <div className="owner-art-row-actions">
                                        <Link
                                            className="owner-button"
                                            href={`/admin/edit?id=${piece.id}`}
                                            aria-label={`Edit ${piece.title}`}
                                        >
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
                            );
                        })
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
