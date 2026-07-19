import { BarChart3, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { postHogRanges, type PostHogAnalytics, type PostHogRange } from '@/data/posthogAnalytics';
import { OwnerStatus } from './OwnerShell';

const number = new Intl.NumberFormat('en-US');

function RankedList({ items }: { items: Array<{ label: string; value: number }> }) {
    const maximum = Math.max(1, ...items.map((item) => item.value));
    return (
        <ol className="owner-ranked-list">
            {items.map((item) => (
                <li key={item.label}>
                    <span title={item.label}>{item.label}</span>
                    <i style={{ '--owner-rank-width': `${Math.max(3, (item.value / maximum) * 100)}%` } as CSSProperties} />
                    <strong>{number.format(item.value)}</strong>
                </li>
            ))}
        </ol>
    );
}

const rangeLabels: Record<PostHogRange, string> = {
    '7d': '7 days',
    '30d': '30 days',
    '90d': '90 days',
    '365d': '12 months',
    all: 'All time',
};

function formatCoverage(value: string | null) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.valueOf())
        ? null
        : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export function OwnerPostHogSummary({ analytics, compact = false }: { analytics: PostHogAnalytics; compact?: boolean }) {
    return (
        <section className={`owner-panel owner-posthog${compact ? ' is-compact' : ''}`}>
            <header className="owner-panel-header">
                <div>
                    <span className="owner-panel-eyebrow">Website activity</span>
                    <h2>PostHog analytics</h2>
                </div>
                <OwnerStatus tone={analytics.status === 'ready' ? 'good' : 'warning'}>
                    {analytics.status === 'ready' ? analytics.rangeLabel : analytics.status === 'error' ? 'Connection issue' : 'Setup needed'}
                </OwnerStatus>
            </header>
            {analytics.status === 'ready' ? (
                <>
                    {!compact ? (
                        <nav className="owner-analytics-ranges" aria-label="Analytics date range">
                            {postHogRanges.map((range) => (
                                <Link
                                    className={range === analytics.range ? 'is-active' : undefined}
                                    href={`/admin/analytics?range=${range}`}
                                    key={range}
                                    prefetch={false}
                                >
                                    {rangeLabels[range]}
                                </Link>
                            ))}
                        </nav>
                    ) : null}
                    <div className="owner-metrics owner-posthog-metrics" aria-label="Website analytics">
                        <div className="owner-metric">
                            <span>Visitors</span>
                            <strong>{number.format(analytics.visitors)}</strong>
                        </div>
                        <div className="owner-metric">
                            <span>Page views</span>
                            <strong>{number.format(analytics.pageviews)}</strong>
                        </div>
                        <div className="owner-metric">
                            <span>Artwork detail views</span>
                            <strong>{number.format(analytics.artworkViews)}</strong>
                        </div>
                    </div>
                    {!compact ? (
                        <>
                            <p className="owner-analytics-coverage">
                                {analytics.range === 'all' && formatCoverage(analytics.firstEventAt)
                                    ? `History begins ${formatCoverage(analytics.firstEventAt)}. `
                                    : ''}
                                Anonymous production traffic only. Admin, sign-in, preview, and local activity are excluded.
                            </p>
                            <div className="owner-posthog-breakdown">
                                <div>
                                    <h3>Most viewed pages</h3>
                                    <RankedList items={analytics.topPages} />
                                </div>
                                <div>
                                    <h3>How visitors arrived</h3>
                                    <RankedList items={analytics.sources} />
                                </div>
                            </div>
                        </>
                    ) : null}
                </>
            ) : (
                <div className="owner-analytics-empty">
                    <BarChart3 size={24} aria-hidden="true" />
                    <div>
                        <h3>Website analytics are not available yet.</h3>
                        <p>{analytics.message}</p>
                    </div>
                    <a className="owner-button" href="https://us.posthog.com/project/77162/web" target="_blank" rel="noreferrer">
                        Open PostHog <ExternalLink size={15} />
                    </a>
                </div>
            )}
        </section>
    );
}
