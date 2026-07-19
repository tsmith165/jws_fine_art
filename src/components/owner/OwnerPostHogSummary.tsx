import { BarChart3, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { postHogRanges, type PostHogAnalytics, type PostHogRange } from '@/data/posthogAnalytics';
import { OwnerStatus } from './OwnerShell';

const number = new Intl.NumberFormat('en-US');
const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

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

function chartDate(value: string) {
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.valueOf()) ? value : shortDate.format(date);
}

function TrendChart({ items, compact }: { items: Array<{ date: string; pageviews: number; visitors: number }>; compact?: boolean }) {
    if (!items.length) return <p className="owner-chart-empty">Traffic will appear here after the first production visit.</p>;

    const width = 760;
    const height = compact ? 150 : 230;
    const inset = compact ? 12 : 28;
    const plotWidth = width - inset * 2;
    const plotHeight = height - inset * 2;
    const maximum = Math.max(1, ...items.flatMap((item) => [item.pageviews, item.visitors]));
    const x = (index: number) => inset + (items.length === 1 ? plotWidth / 2 : (index / (items.length - 1)) * plotWidth);
    const y = (value: number) => inset + plotHeight - (value / maximum) * plotHeight;
    const line = (key: 'pageviews' | 'visitors') =>
        items.map((item, index) => `${index ? 'L' : 'M'} ${x(index).toFixed(1)} ${y(item[key]).toFixed(1)}`).join(' ');
    const pageviewLine = line('pageviews');
    const visitorLine = line('visitors');
    const pageviewArea = `${pageviewLine} L ${x(items.length - 1).toFixed(1)} ${(height - inset).toFixed(1)} L ${x(0).toFixed(1)} ${(height - inset).toFixed(1)} Z`;
    const labelIndexes = [...new Set([0, Math.floor((items.length - 1) / 2), items.length - 1])];

    return (
        <figure className={`owner-trend-chart${compact ? 'is-compact' : ''}`}>
            {!compact ? (
                <div className="owner-chart-heading">
                    <div>
                        <h3>Attention over time</h3>
                        <p>Daily production traffic across the selected period.</p>
                    </div>
                    <div className="owner-chart-legend" aria-label="Chart legend">
                        <span className="is-pageviews">Page views</span>
                        <span className="is-visitors">Visitors</span>
                    </div>
                </div>
            ) : null}
            <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Daily page views and visitors">
                {[0, 0.25, 0.5, 0.75, 1].map((position) => (
                    <line
                        className="owner-chart-gridline"
                        key={position}
                        x1={inset}
                        x2={width - inset}
                        y1={inset + plotHeight * position}
                        y2={inset + plotHeight * position}
                    />
                ))}
                <path className="owner-trend-area" d={pageviewArea} />
                <path className="owner-trend-line is-pageviews" d={pageviewLine} />
                <path className="owner-trend-line is-visitors" d={visitorLine} />
                {items.length <= 31
                    ? items.flatMap((item, index) => [
                          <circle
                              className="owner-trend-point is-pageviews"
                              cx={x(index)}
                              cy={y(item.pageviews)}
                              key={`p-${item.date}`}
                              r="2.8"
                          >
                              <title>{`${chartDate(item.date)}: ${number.format(item.pageviews)} page views`}</title>
                          </circle>,
                          <circle
                              className="owner-trend-point is-visitors"
                              cx={x(index)}
                              cy={y(item.visitors)}
                              key={`v-${item.date}`}
                              r="2.8"
                          >
                              <title>{`${chartDate(item.date)}: ${number.format(item.visitors)} visitors`}</title>
                          </circle>,
                      ])
                    : null}
            </svg>
            {!compact ? (
                <div className="owner-chart-dates" aria-hidden="true">
                    {labelIndexes.map((index) => (
                        <span key={items[index].date}>{chartDate(items[index].date)}</span>
                    ))}
                </div>
            ) : null}
        </figure>
    );
}

const sourceColors = ['#9abdaa', '#d0aa66', '#769585', '#a9a28f', '#617168', '#474f49'];

function SourceChart({ items }: { items: Array<{ label: string; value: number }> }) {
    const primary = items.slice(0, 5);
    const other = items.slice(5).reduce((total, item) => total + item.value, 0);
    const segments = other ? [...primary, { label: 'Other', value: other }] : primary;
    const total = Math.max(
        1,
        segments.reduce((sum, item) => sum + item.value, 0),
    );
    let offset = 0;

    return (
        <div className="owner-source-chart">
            <div className="owner-chart-heading">
                <div>
                    <h3>How visitors arrived</h3>
                    <p>Referring sources for recorded page views.</p>
                </div>
            </div>
            <div className="owner-source-chart-body">
                <svg viewBox="0 0 120 120" role="img" aria-label="Traffic sources">
                    <circle className="owner-donut-track" cx="60" cy="60" r="45" />
                    {segments.map((item, index) => {
                        const share = (item.value / total) * 100;
                        const dashOffset = offset;
                        offset += share;
                        return (
                            <circle
                                className="owner-donut-segment"
                                cx="60"
                                cy="60"
                                key={item.label}
                                pathLength="100"
                                r="45"
                                style={
                                    {
                                        '--owner-donut-color': sourceColors[index % sourceColors.length],
                                        '--owner-donut-dash': `${share} ${100 - share}`,
                                        '--owner-donut-offset': -dashOffset,
                                    } as CSSProperties
                                }
                            >
                                <title>{`${item.label}: ${number.format(item.value)} page views`}</title>
                            </circle>
                        );
                    })}
                    <text className="owner-donut-value" x="60" y="57" textAnchor="middle">
                        {number.format(total)}
                    </text>
                    <text className="owner-donut-label" x="60" y="72" textAnchor="middle">
                        views
                    </text>
                </svg>
                <ol className="owner-source-legend">
                    {segments.map((item, index) => (
                        <li key={item.label}>
                            <i style={{ '--owner-source-color': sourceColors[index % sourceColors.length] } as CSSProperties} />
                            <span>{item.label}</span>
                            <strong>{Math.round((item.value / total) * 100)}%</strong>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}

function PageTable({ items }: { items: Array<{ label: string; path: string; value: number }> }) {
    return (
        <div className="owner-page-table-wrap">
            <div className="owner-chart-heading">
                <div>
                    <h3>Most viewed pages</h3>
                    <p>The places visitors spent time across the site.</p>
                </div>
            </div>
            <ol className="owner-page-table">
                {items.map((item, index) => (
                    <li key={item.path}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <div>
                            <strong>{item.label}</strong>
                            <small>{item.path}</small>
                        </div>
                        <b>{number.format(item.value)}</b>
                    </li>
                ))}
            </ol>
        </div>
    );
}

export function OwnerPostHogSummary({ analytics, compact = false }: { analytics: PostHogAnalytics; compact?: boolean }) {
    return (
        <section className={`owner-panel owner-posthog${compact ? ' is-compact' : ''}`}>
            <header className="owner-panel-header">
                <div>
                    <span className="owner-panel-eyebrow">Audience</span>
                    <h2>Website activity</h2>
                </div>
                <OwnerStatus tone={analytics.status === 'ready' ? 'good' : 'warning'}>
                    {analytics.status === 'ready'
                        ? analytics.rangeLabel
                        : analytics.status === 'error'
                          ? 'Connection issue'
                          : 'Setup needed'}
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
                            <span>Artwork views</span>
                            <strong>{number.format(analytics.artworkViews)}</strong>
                        </div>
                        <div className="owner-metric">
                            <span>Pages per visitor</span>
                            <strong>{analytics.visitors ? (analytics.pageviews / analytics.visitors).toFixed(1) : '0'}</strong>
                        </div>
                    </div>
                    <TrendChart items={analytics.trend} compact={compact} />
                    {!compact ? (
                        <>
                            <div className="owner-posthog-breakdown">
                                <PageTable items={analytics.topPages} />
                                <SourceChart items={analytics.sources} />
                            </div>
                            <p className="owner-analytics-coverage">
                                {analytics.range === 'all' && formatCoverage(analytics.firstEventAt)
                                    ? `History begins ${formatCoverage(analytics.firstEventAt)}. `
                                    : ''}
                                Production website traffic only. Studio-manager, preview, and local activity are excluded.
                            </p>
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
