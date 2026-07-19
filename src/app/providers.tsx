'use client';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { sanitizePostHogProperties, shouldCaptureAnalytics } from '@/lib/analyticsPolicy';

const capturePreviews = process.env.NEXT_PUBLIC_POSTHOG_CAPTURE_PREVIEWS === 'true';
if (
    typeof window !== 'undefined' &&
    shouldCaptureAnalytics(new URL(window.location.href), capturePreviews) &&
    process.env.NEXT_PUBLIC_POSTHOG_KEY
) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        disable_session_recording: true,
        persistence: 'localStorage',
        cross_subdomain_cookie: false,
        person_profiles: 'identified_only',
        sanitize_properties: (properties) => sanitizePostHogProperties(properties),
    });
}

export function PHProvider({ children }: { children: React.ReactNode }) {
    return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
