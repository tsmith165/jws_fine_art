'use client';

import { useEffect, useRef } from 'react';
import { captureAnalytics, type AnalyticsEvent, type AnalyticsProperties } from '@/lib/analytics';

export function AnalyticsEventOnMount({
    event,
    properties,
    oncePerSession,
}: {
    event: AnalyticsEvent;
    properties?: AnalyticsProperties;
    oncePerSession?: string;
}) {
    const captured = useRef(false);
    useEffect(() => {
        if (captured.current) return;
        captured.current = true;
        if (oncePerSession) {
            const key = `jws-analytics:${oncePerSession}`;
            if (window.sessionStorage.getItem(key)) return;
            window.sessionStorage.setItem(key, '1');
        }
        captureAnalytics(event, properties);
    }, [event, oncePerSession, properties]);
    return null;
}
