export const postHogRanges = ['7d', '30d', '90d', '365d', 'all'] as const;
export type PostHogRange = (typeof postHogRanges)[number];

export type PostHogAnalytics =
    | {
          status: 'ready';
          range: PostHogRange;
          rangeLabel: string;
          visitors: number;
          pageviews: number;
          artworkViews: number;
          firstEventAt: string | null;
          lastEventAt: string | null;
          trend: Array<{ date: string; pageviews: number; visitors: number }>;
          topPages: Array<{ label: string; path: string; value: number }>;
          sources: Array<{ label: string; value: number }>;
      }
    | { status: 'unconfigured' | 'error'; message: string };
