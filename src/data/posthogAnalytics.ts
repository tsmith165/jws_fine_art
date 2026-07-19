import 'server-only';

import { unstable_cache } from 'next/cache';
import { analyticsPathLabel, isPublicAnalyticsPath, normalizedAnalyticsPath } from '@/lib/analyticsPolicy';
import { postHogRanges, type PostHogAnalytics, type PostHogRange } from './posthogAnalytics.types';

export { postHogRanges } from './posthogAnalytics.types';
export type { PostHogAnalytics, PostHogRange } from './posthogAnalytics.types';

type PostHogQueryResponse = { results?: unknown };

const rangeConfig: Record<PostHogRange, { label: string; sql: string }> = {
    '7d': { label: 'Last 7 days', sql: 'timestamp >= now() - INTERVAL 7 DAY' },
    '30d': { label: 'Last 30 days', sql: 'timestamp >= now() - INTERVAL 30 DAY' },
    '90d': { label: 'Last 90 days', sql: 'timestamp >= now() - INTERVAL 90 DAY' },
    '365d': { label: 'Last 12 months', sql: 'timestamp >= now() - INTERVAL 365 DAY' },
    all: { label: 'All time', sql: "timestamp >= toDateTime('2000-01-01 00:00:00')" },
};

export function parsePostHogRange(value: unknown): PostHogRange {
    return typeof value === 'string' && postHogRanges.includes(value as PostHogRange) ? (value as PostHogRange) : '30d';
}

function dashboardHost() {
    const configured = process.env.POSTHOG_API_HOST?.replace(/\/$/, '');
    if (configured) return configured;
    const captureHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || '';
    if (captureHost.includes('eu.i.posthog.com')) return 'https://eu.posthog.com';
    return 'https://us.posthog.com';
}

async function hogql(projectId: string, apiKey: string, query: string): Promise<unknown> {
    const response = await fetch(`${dashboardHost()}/api/projects/${encodeURIComponent(projectId)}/query/`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
        cache: 'no-store',
    });
    if (!response.ok) throw new Error(`PostHog query failed with HTTP ${response.status}`);
    return ((await response.json()) as PostHogQueryResponse).results;
}

function numberAt(row: unknown[], index: number) {
    const value = Number(row[index]);
    return Number.isFinite(value) ? value : 0;
}

function stringAt(row: unknown[], index: number) {
    const value = row[index];
    return typeof value === 'string' && value ? value : null;
}

function rows(value: unknown) {
    return Array.isArray(value) ? (value.filter(Array.isArray) as unknown[][]) : [];
}

function productionPageviewWhere(range: PostHogRange) {
    return `event = '$pageview'
        AND ${rangeConfig[range].sql}
        AND (
            properties.$current_url = 'https://jwsfineart.com'
            OR properties.$current_url LIKE 'https://jwsfineart.com/%'
            OR properties.$current_url = 'https://www.jwsfineart.com'
            OR properties.$current_url LIKE 'https://www.jwsfineart.com/%'
        )
        AND properties.$current_url NOT LIKE '%/admin%'
        AND properties.$current_url NOT LIKE '%/login%'
        AND properties.$current_url NOT LIKE '%/logout%'
        AND properties.$current_url NOT LIKE '%/signin%'
        AND properties.$current_url NOT LIKE '%/signout%'
        AND properties.$current_url NOT LIKE '%/sign-in%'
        AND properties.$current_url NOT LIKE '%/sign-out%'`;
}

function normalizedPages(pageResults: unknown) {
    const grouped = new Map<string, number>();
    for (const row of rows(pageResults)) {
        const path = normalizedAnalyticsPath(row[0]);
        if (!isPublicAnalyticsPath(path)) continue;
        grouped.set(path, (grouped.get(path) ?? 0) + numberAt(row, 1));
    }
    return [...grouped.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([path, value]) => ({ path, label: analyticsPathLabel(path), value }));
}

function sourceLabel(value: unknown) {
    const raw = String(value || '').trim();
    if (!raw || raw === '$direct' || raw.toLowerCase().includes('direct')) return 'Direct';
    const domain = raw.replace(/^(www\.|m\.|l\.)/, '').toLowerCase();
    if (domain.includes('instagram')) return 'Instagram';
    if (domain.includes('facebook')) return 'Facebook';
    if (domain.includes('google')) return 'Google';
    if (domain === 'californiaartclub.org') return 'California Art Club';
    return domain;
}

function normalizedSources(sourceResults: unknown) {
    const grouped = new Map<string, number>();
    for (const row of rows(sourceResults)) {
        const label = sourceLabel(row[0]);
        grouped.set(label, (grouped.get(label) ?? 0) + numberAt(row, 1));
    }
    return [...grouped.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([label, value]) => ({ label, value }));
}

async function readUncachedPostHogAnalytics(range: PostHogRange): Promise<PostHogAnalytics> {
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
    if (!projectId || !apiKey) {
        return {
            status: 'unconfigured',
            message: 'Add a read-only PostHog personal API key and project ID to show website analytics here.',
        };
    }

    const where = productionPageviewWhere(range);
    try {
        const [metricResults, trendResults, pageResults, sourceResults] = await Promise.all([
            hogql(
                projectId,
                apiKey,
                `SELECT
                    count(),
                    uniq(distinct_id),
                    countIf(
                        properties.$current_url LIKE '%/work/%'
                        OR properties.$current_url LIKE '%/details/%'
                    ),
                    min(timestamp),
                    max(timestamp)
                 FROM events
                 WHERE ${where}`,
            ),
            hogql(
                projectId,
                apiKey,
                `SELECT toDate(timestamp), count(), uniq(distinct_id)
                 FROM events
                 WHERE ${where}
                 GROUP BY toDate(timestamp)
                 ORDER BY toDate(timestamp) ASC`,
            ),
            hogql(
                projectId,
                apiKey,
                `SELECT properties.$current_url, count()
                 FROM events
                 WHERE ${where}
                 GROUP BY properties.$current_url
                 ORDER BY count() DESC
                 LIMIT 200`,
            ),
            hogql(
                projectId,
                apiKey,
                `SELECT coalesce(nullIf(properties.$referring_domain, ''), 'Direct / unknown'), count()
                 FROM events
                 WHERE ${where}
                 GROUP BY coalesce(nullIf(properties.$referring_domain, ''), 'Direct / unknown')
                 ORDER BY count() DESC
                 LIMIT 8`,
            ),
        ]);
        const metricRow = rows(metricResults)[0] ?? [];
        return {
            status: 'ready',
            range,
            rangeLabel: rangeConfig[range].label,
            pageviews: numberAt(metricRow, 0),
            visitors: numberAt(metricRow, 1),
            artworkViews: numberAt(metricRow, 2),
            firstEventAt: stringAt(metricRow, 3),
            lastEventAt: stringAt(metricRow, 4),
            trend: rows(trendResults).map((row) => ({
                date: String(row[0] || ''),
                pageviews: numberAt(row, 1),
                visitors: numberAt(row, 2),
            })),
            topPages: normalizedPages(pageResults),
            sources: normalizedSources(sourceResults),
        };
    } catch (error) {
        console.error('Unable to load PostHog analytics', error);
        return { status: 'error', message: 'PostHog is configured, but its aggregate analytics query could not be loaded.' };
    }
}

const readCachedPostHogAnalytics = unstable_cache(readUncachedPostHogAnalytics, ['posthog-owner-analytics-v3'], {
    revalidate: 300,
});

export async function readPostHogAnalytics(range: PostHogRange = '30d') {
    return readCachedPostHogAnalytics(range);
}
