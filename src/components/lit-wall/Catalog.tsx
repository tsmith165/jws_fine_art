'use client';

import { Check, ChevronDown, Filter, Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { PiecesWithImages } from '@/types/artwork';
import { captureAnalytics } from '@/lib/analytics';
import { ArtworkCard } from './ArtworkCard';

type Availability = 'available' | 'all' | 'sold';
type Sort = 'newest' | 'price-asc' | 'price-desc' | 'title';

function boolParam(params: URLSearchParams, key: string) {
    return params.get(key) === '1';
}

export function Catalog({ pieces }: { pieces: PiecesWithImages[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();
    const availability = (params.get('availability') as Availability) || 'available';
    const sort = (params.get('sort') as Sort) || 'newest';
    const query = params.get('q') || '';
    const theme = params.get('theme') || '';
    const framed = boolParam(new URLSearchParams(params.toString()), 'framed');
    const [searchOpen, setSearchOpen] = useState(Boolean(query));
    const [filterOpen, setFilterOpen] = useState(false);
    const [sortOpen, setSortOpen] = useState(false);

    const setParam = (key: string, value?: string) => {
        const next = new URLSearchParams(params.toString());
        if (!value) next.delete(key);
        else next.set(key, value);
        router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    };
    const clear = () => router.replace(pathname, { scroll: false });
    const list = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        return pieces
            .filter((piece) => {
                if (availability === 'available' && (!piece.available || piece.sold)) return false;
                if (availability === 'sold' && !piece.sold) return false;
                if (framed && !piece.framed) return false;
                if (theme && !(piece.theme || '').toLowerCase().includes(theme.toLowerCase())) return false;
                if (
                    normalized &&
                    ![piece.title, piece.description, piece.piece_type, piece.theme].join(' ').toLowerCase().includes(normalized)
                )
                    return false;
                return true;
            })
            .sort((a, b) => {
                if (sort === 'price-asc') return a.price - b.price;
                if (sort === 'price-desc') return b.price - a.price;
                if (sort === 'title') return a.title.localeCompare(b.title);
                return b.id - a.id;
            });
    }, [availability, framed, pieces, query, sort, theme]);
    const counts = {
        available: pieces.filter((piece) => piece.available && !piece.sold).length,
        all: pieces.length,
        sold: pieces.filter((piece) => piece.sold).length,
    };
    const sortLabels: Record<Sort, string> = {
        newest: 'Newest',
        'price-asc': 'Price: low to high',
        'price-desc': 'Price: high to low',
        title: 'Title: A–Z',
    };
    const filterCount = Number(framed) + Number(Boolean(theme));
    useEffect(() => {
        if (!query.trim()) return;
        const timer = window.setTimeout(
            () => captureAnalytics('catalog_searched', { query_length: query.trim().length, result_count: list.length }),
            700,
        );
        return () => window.clearTimeout(timer);
    }, [list.length, query]);
    return (
        <>
            <section className="lw-catalog-toolbar" aria-label="Catalog controls">
                <div className="lw-tabs" role="tablist" aria-label="Artwork availability">
                    {(['available', 'all', 'sold'] as Availability[]).map((value) => (
                        <button
                            key={value}
                            role="tab"
                            aria-selected={availability === value}
                            className={availability === value ? 'is-active' : ''}
                            onClick={() => {
                                captureAnalytics('catalog_availability_changed', { availability: value });
                                setParam('availability', value === 'available' ? undefined : value);
                            }}
                        >
                            {value === 'sold' ? 'Sold archive' : value === 'all' ? 'All work' : 'Available'} <span>{counts[value]}</span>
                        </button>
                    ))}
                </div>
                <div className="lw-catalog-actions">
                    <button
                        aria-expanded={searchOpen}
                        className={searchOpen ? 'is-active' : ''}
                        onClick={() => {
                            setSearchOpen(!searchOpen);
                            setFilterOpen(false);
                            setSortOpen(false);
                        }}
                    >
                        <Search size={16} /> Search
                    </button>
                    <div className="lw-menu-wrap">
                        <button
                            aria-expanded={filterOpen}
                            className={filterOpen ? 'is-active' : ''}
                            onClick={() => {
                                setFilterOpen(!filterOpen);
                                setSearchOpen(false);
                                setSortOpen(false);
                            }}
                        >
                            <Filter size={16} /> Filter {filterCount > 0 && <span>{filterCount}</span>}
                        </button>
                        {filterOpen && (
                            <div className="lw-popover lw-filter-popover">
                                <strong>Refine the collection</strong>
                                <label>
                                    Subject
                                    <select
                                        value={theme}
                                        onChange={(event) => {
                                            captureAnalytics('catalog_filter_changed', {
                                                filter: 'theme',
                                                value: event.target.value || 'all',
                                            });
                                            setParam('theme', event.target.value);
                                        }}
                                    >
                                        <option value="">All subjects</option>
                                        <option value="water">Water & coast</option>
                                        <option value="landscape">Landscape</option>
                                        <option value="snow">Snow & mountain</option>
                                    </select>
                                </label>
                                <label className="lw-check">
                                    <input
                                        type="checkbox"
                                        checked={framed}
                                        onChange={(event) => {
                                            captureAnalytics('catalog_filter_changed', {
                                                filter: 'framed',
                                                value: event.target.checked,
                                            });
                                            setParam('framed', event.target.checked ? '1' : undefined);
                                        }}
                                    />
                                    <span>
                                        <Check size={13} /> Framed work
                                    </span>
                                </label>
                                <button
                                    onClick={() => {
                                        captureAnalytics('catalog_filters_cleared');
                                        clear();
                                    }}
                                >
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="lw-menu-wrap">
                        <button
                            aria-expanded={sortOpen}
                            onClick={() => {
                                setSortOpen(!sortOpen);
                                setSearchOpen(false);
                                setFilterOpen(false);
                            }}
                        >
                            {sortLabels[sort]} <ChevronDown size={15} />
                        </button>
                        {sortOpen && (
                            <div className="lw-popover lw-sort-popover">
                                {(Object.entries(sortLabels) as [Sort, string][]).map(([value, label]) => (
                                    <button
                                        key={value}
                                        className={sort === value ? 'is-selected' : ''}
                                        onClick={() => {
                                            captureAnalytics('catalog_sort_changed', { sort: value });
                                            setParam('sort', value === 'newest' ? undefined : value);
                                            setSortOpen(false);
                                        }}
                                    >
                                        {sort === value ? <Check size={13} /> : <i />}
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
            {searchOpen && (
                <div className="lw-search">
                    <Search size={18} />
                    <input
                        autoFocus
                        aria-label="Search artwork"
                        placeholder="Search title, medium, or subject"
                        value={query}
                        onChange={(event) => setParam('q', event.target.value || undefined)}
                    />
                    {query && (
                        <button aria-label="Clear search" onClick={() => setParam('q')}>
                            <X size={16} />
                        </button>
                    )}
                </div>
            )}
            <div className="lw-results-meta">
                <span aria-live="polite">
                    {list.length} {list.length === 1 ? 'work' : 'works'}
                </span>
                {(theme || framed || query) && (
                    <button
                        onClick={() => {
                            captureAnalytics('catalog_filters_cleared');
                            clear();
                        }}
                    >
                        Clear filters <X size={13} />
                    </button>
                )}
            </div>
            {list.length ? (
                <section className="lw-art-grid">
                    {list.map((piece) => (
                        <ArtworkCard key={piece.id} piece={piece} />
                    ))}
                </section>
            ) : (
                <section className="lw-empty">
                    <Search size={30} />
                    <h2>No work matches these filters.</h2>
                    <p>Clear the filters or ask Jill about an upcoming piece.</p>
                    <button
                        className="lw-button lw-button-brass"
                        onClick={() => {
                            captureAnalytics('catalog_filters_cleared');
                            clear();
                        }}
                    >
                        Clear filters
                    </button>
                </section>
            )}
        </>
    );
}
