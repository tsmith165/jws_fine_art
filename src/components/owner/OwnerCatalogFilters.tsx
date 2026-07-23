'use client';

import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';

export function OwnerCatalogFilters({
    initialQuery,
    initialFilter,
    attentionCount,
}: {
    initialQuery: string;
    initialFilter: string;
    attentionCount: number;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(initialQuery);
    const [filter, setFilter] = useState(initialFilter);
    const [isPending, startTransition] = useTransition();
    const searchTimeout = useRef<number | undefined>(undefined);

    const navigate = useCallback(
        (nextQuery: string, nextFilter: string) => {
            const params = new URLSearchParams(searchParams.toString());
            const cleanQuery = nextQuery.trim();
            if (cleanQuery) params.set('q', cleanQuery);
            else params.delete('q');
            if (nextFilter === 'active') params.delete('filter');
            else params.set('filter', nextFilter);
            const nextUrl = params.size ? `${pathname}?${params.toString()}` : pathname;
            startTransition(() => router.replace(nextUrl, { scroll: false }));
        },
        [pathname, router, searchParams],
    );

    useEffect(() => () => window.clearTimeout(searchTimeout.current), []);

    return (
        <div className="owner-toolbar" aria-busy={isPending}>
            <label className="owner-search">
                <Search size={17} aria-hidden="true" />
                <span className="sr-only">Search artwork</span>
                <input
                    type="search"
                    value={query}
                    onChange={(event) => {
                        const nextQuery = event.target.value;
                        setQuery(nextQuery);
                        window.clearTimeout(searchTimeout.current);
                        searchTimeout.current = window.setTimeout(() => navigate(nextQuery, filter), 300);
                    }}
                    placeholder="Search title, medium, or collection"
                />
            </label>
            <div className="owner-filter-control">
                <label htmlFor="owner-catalog-view">Catalog view</label>
                <select
                    id="owner-catalog-view"
                    value={filter}
                    onChange={(event) => {
                        const nextFilter = event.target.value;
                        setFilter(nextFilter);
                        window.clearTimeout(searchTimeout.current);
                        navigate(query, nextFilter);
                    }}
                >
                    <option value="active">Active artwork</option>
                    <option value="all">All artwork</option>
                    <option value="needs-details">Needs details ({attentionCount})</option>
                    <option value="archive">Archive</option>
                </select>
                {isPending ? (
                    <span className="owner-filter-state" aria-live="polite">
                        Updating…
                    </span>
                ) : null}
            </div>
        </div>
    );
}
