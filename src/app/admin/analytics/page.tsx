import type { CSSProperties } from 'react';
import { OwnerHeading, OwnerShell } from '@/components/owner/OwnerShell';
import { OwnerPostHogSummary } from '@/components/owner/OwnerPostHogSummary';
import { parsePostHogRange, readPostHogAnalytics } from '@/data/posthogAnalytics';
import { readOwnerDashboard } from '@/data/ownerWorkspaceReads';

export const dynamic = 'force-dynamic';

export default async function OwnerAnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
    const range = parsePostHogRange((await searchParams).range);
    const [dashboard, posthog] = await Promise.all([readOwnerDashboard(), readPostHogAnalytics(range)]);
    const funnel = [
        ['Active artwork', dashboard.artwork.active],
        ['Available now', dashboard.artwork.available],
        ['New inquiries', dashboard.newInquiries],
        ['Orders to fulfill', dashboard.ordersToFulfill],
    ] as const;
    const maximum = Math.max(1, ...funnel.map(([, value]) => value));
    return (
        <OwnerShell active="/admin/analytics" title="Analytics">
            <section className="owner-content">
                <OwnerHeading
                    eyebrow="Studio intelligence"
                    title="What is drawing attention"
                    description="See how people find the studio, which work holds their attention, and where interest becomes a collector conversation."
                />
                <div className="owner-analytics-grid">
                    <OwnerPostHogSummary analytics={posthog} />
                    <section className="owner-panel">
                        <header className="owner-panel-header">
                            <div>
                                <span className="owner-panel-eyebrow">Operational funnel</span>
                                <h2>From catalog to conversation</h2>
                            </div>
                        </header>
                        <div className="owner-chart">
                            {funnel.map(([label, value]) => (
                                <div className="owner-bar" key={label}>
                                    <span>{label}</span>
                                    <i style={{ '--bar-width': `${Math.max(2, (value / maximum) * 100)}%` } as CSSProperties} />
                                    <strong>{value}</strong>
                                </div>
                            ))}
                        </div>
                    </section>
                    <section className="owner-panel">
                        <header className="owner-panel-header">
                            <div>
                                <span className="owner-panel-eyebrow">Collectors</span>
                                <h2>Owned audience</h2>
                            </div>
                        </header>
                        <div className="owner-metrics" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 0 }}>
                            <div className="owner-metric">
                                <span>Subscribed</span>
                                <strong>{dashboard.subscribers}</strong>
                            </div>
                            <div className="owner-metric">
                                <span>Campaign drafts</span>
                                <strong>{dashboard.draftCampaigns}</strong>
                            </div>
                        </div>
                    </section>
                </div>
            </section>
        </OwnerShell>
    );
}
