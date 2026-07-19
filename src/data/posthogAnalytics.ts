import 'server-only';

type PostHogQueryResponse = { results?: unknown };

export type PostHogAnalytics =
    | {
          status: 'ready';
          visitors7d: number;
          visitors30d: number;
          pageviews7d: number;
          pageviews30d: number;
          artworkViews30d: number;
          topPages: Array<{ label: string; value: number }>;
          sources: Array<{ label: string; value: number }>;
      }
    | { status: 'unconfigured' | 'error'; message: string };

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
        next: { revalidate: 300 },
    });
    if (!response.ok) throw new Error(`PostHog query failed with HTTP ${response.status}`);
    return ((await response.json()) as PostHogQueryResponse).results;
}

function numberAt(row: unknown[], index: number) {
    const value = Number(row[index]);
    return Number.isFinite(value) ? value : 0;
}

function labelForUrl(value: unknown) {
    if (typeof value !== 'string' || !value) return 'Unknown page';
    try {
        const url = new URL(value);
        return `${url.pathname}${url.search}`;
    } catch {
        return value;
    }
}

export async function readPostHogAnalytics(): Promise<PostHogAnalytics> {
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
    if (!projectId || !apiKey) {
        return {
            status: 'unconfigured',
            message: 'Add a read-only PostHog personal API key and project ID to show website analytics here.',
        };
    }

    try {
        const [metricResults, pageResults, sourceResults] = await Promise.all([
            hogql(
                projectId,
                apiKey,
                `SELECT
                    countIf(timestamp >= now() - INTERVAL 7 DAY),
                    uniqIf(distinct_id, timestamp >= now() - INTERVAL 7 DAY),
                    count(),
                    uniq(distinct_id),
                    countIf(properties.$current_url LIKE '%/work/%')
                 FROM events
                 WHERE event = '$pageview' AND timestamp >= now() - INTERVAL 30 DAY`,
            ),
            hogql(
                projectId,
                apiKey,
                `SELECT properties.$current_url, count()
                 FROM events
                 WHERE event = '$pageview' AND timestamp >= now() - INTERVAL 30 DAY
                 GROUP BY properties.$current_url
                 ORDER BY count() DESC
                 LIMIT 5`,
            ),
            hogql(
                projectId,
                apiKey,
                `SELECT coalesce(nullIf(properties.$referring_domain, ''), 'Direct / unknown'), count()
                 FROM events
                 WHERE event = '$pageview' AND timestamp >= now() - INTERVAL 30 DAY
                 GROUP BY coalesce(nullIf(properties.$referring_domain, ''), 'Direct / unknown')
                 ORDER BY count() DESC
                 LIMIT 5`,
            ),
        ]);
        const metricRow = Array.isArray(metricResults) && Array.isArray(metricResults[0]) ? metricResults[0] : [];
        const rows = (value: unknown) => (Array.isArray(value) ? (value.filter(Array.isArray) as unknown[][]) : []);
        return {
            status: 'ready',
            pageviews7d: numberAt(metricRow, 0),
            visitors7d: numberAt(metricRow, 1),
            pageviews30d: numberAt(metricRow, 2),
            visitors30d: numberAt(metricRow, 3),
            artworkViews30d: numberAt(metricRow, 4),
            topPages: rows(pageResults).map((row) => ({ label: labelForUrl(row[0]), value: numberAt(row, 1) })),
            sources: rows(sourceResults).map((row) => ({ label: String(row[0] || 'Direct / unknown'), value: numberAt(row, 1) })),
        };
    } catch (error) {
        console.error('Unable to load PostHog analytics', error);
        return { status: 'error', message: 'PostHog is configured, but its aggregate analytics query could not be loaded.' };
    }
}
