import { BarChart3, ExternalLink } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { PostHogAnalytics } from '@/data/posthogAnalytics';
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

export function OwnerPostHogSummary({ analytics, compact = false }: { analytics: PostHogAnalytics; compact?: boolean }) {
    return (
        <section className={`owner-panel owner-posthog${compact ? 'is-compact' : ''}`}>
            <header className="owner-panel-header">
                <div>
                    <span className="owner-panel-eyebrow">Website activity</span>
                    <h2>PostHog analytics</h2>
                </div>
                <OwnerStatus tone={analytics.status === 'ready' ? 'good' : 'warning'}>
                    {analytics.status === 'ready' ? 'Last 30 days' : analytics.status === 'error' ? 'Connection issue' : 'Setup needed'}
                </OwnerStatus>
            </header>
            {analytics.status === 'ready' ? (
                <>
                    <div className="owner-metrics owner-posthog-metrics" aria-label="Website analytics">
                        <div className="owner-metric">
                            <span>Visitors · 7 days</span>
                            <strong>{number.format(analytics.visitors7d)}</strong>
                        </div>
                        <div className="owner-metric">
                            <span>Page views · 7 days</span>
                            <strong>{number.format(analytics.pageviews7d)}</strong>
                        </div>
                        <div className="owner-metric">
                            <span>Visitors · 30 days</span>
                            <strong>{number.format(analytics.visitors30d)}</strong>
                        </div>
                        <div className="owner-metric">
                            <span>Artwork views · 30 days</span>
                            <strong>{number.format(analytics.artworkViews30d)}</strong>
                        </div>
                    </div>
                    {!compact ? (
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
                    ) : null}
                </>
            ) : (
                <div className="owner-analytics-empty">
                    <BarChart3 size={24} aria-hidden="true" />
                    <div>
                        <h3>Website analytics are not available yet.</h3>
                        <p>{analytics.message}</p>
                    </div>
                    <a className="owner-button" href="https://us.posthog.com" target="_blank" rel="noreferrer">
                        Open PostHog <ExternalLink size={15} />
                    </a>
                </div>
            )}
        </section>
    );
}
