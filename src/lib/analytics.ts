'use client';

import posthog from 'posthog-js';
import { normalizedAnalyticsPath, sanitizedAnalyticsUrl, shouldCaptureAnalytics } from './analyticsPolicy';

export type AnalyticsEvent =
    | 'artwork_viewed'
    | 'artwork_media_navigated'
    | 'artwork_inquiry_started'
    | 'catalog_availability_changed'
    | 'catalog_filter_changed'
    | 'catalog_filters_cleared'
    | 'catalog_searched'
    | 'catalog_sort_changed'
    | 'checkout_payment_started'
    | 'checkout_started'
    | 'checkout_succeeded'
    | 'checkout_canceled'
    | 'collector_inquiry_submitted'
    | 'hero_artwork_changed'
    | 'newsletter_signup_submitted'
    | 'room_visualizer_opened'
    | 'room_visualizer_room_changed'
    | 'shortlist_changed';

export type AnalyticsProperties = Record<string, boolean | number | string | null | undefined>;

function previewsEnabled() {
    return process.env.NEXT_PUBLIC_POSTHOG_CAPTURE_PREVIEWS === 'true';
}

export function analyticsCaptureAllowed() {
    return typeof window !== 'undefined' && shouldCaptureAnalytics(new URL(window.location.href), previewsEnabled());
}

export function analyticsContext() {
    if (typeof window === 'undefined') return {};
    return {
        site_environment: 'production',
        pathname: normalizedAnalyticsPath(window.location.pathname),
    };
}

export function captureAnalytics(event: AnalyticsEvent, properties: AnalyticsProperties = {}) {
    if (!analyticsCaptureAllowed() || !posthog.__loaded) return;
    posthog.capture(event, { ...analyticsContext(), ...properties });
}

export function capturePageview() {
    if (!analyticsCaptureAllowed() || !posthog.__loaded) return;
    const url = new URL(window.location.href);
    posthog.capture('$pageview', {
        ...analyticsContext(),
        $current_url: sanitizedAnalyticsUrl(url),
    });
}
