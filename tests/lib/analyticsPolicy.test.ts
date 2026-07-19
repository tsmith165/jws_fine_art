import { describe, expect, it } from 'vitest';
import {
    analyticsPathLabel,
    isPublicAnalyticsPath,
    normalizedAnalyticsPath,
    sanitizePostHogProperties,
    sanitizedAnalyticsUrl,
    shouldCaptureAnalytics,
} from '../../src/lib/analyticsPolicy';

describe('analytics policy', () => {
    it('captures only canonical production hosts by default', () => {
        expect(shouldCaptureAnalytics(new URL('https://jwsfineart.com/work'))).toBe(true);
        expect(shouldCaptureAnalytics(new URL('https://www.jwsfineart.com/work'))).toBe(true);
        expect(shouldCaptureAnalytics(new URL('https://preview.vercel.app/work'))).toBe(false);
        expect(shouldCaptureAnalytics(new URL('http://localhost:3000/work'))).toBe(false);
    });

    it('supports an explicit preview override without allowing private paths', () => {
        expect(shouldCaptureAnalytics(new URL('https://preview.vercel.app/work'), true)).toBe(true);
        expect(shouldCaptureAnalytics(new URL('https://preview.vercel.app/admin'), true)).toBe(false);
    });

    it.each(['/admin', '/admin/artwork', '/login', '/logout', '/signin', '/signout', '/sign-in', '/sign-out'])(
        'excludes %s',
        (pathname) => expect(isPublicAnalyticsPath(pathname)).toBe(false),
    );

    it('removes every query parameter from captured page URLs', () => {
        expect(sanitizedAnalyticsUrl(new URL('https://jwsfineart.com/unsubscribe?token=secret&utm_source=email'))).toBe(
            'https://jwsfineart.com/unsubscribe',
        );
    });

    it('scrubs query strings from every URL-valued automatic property', () => {
        expect(
            sanitizePostHogProperties({
                $current_url: 'https://jwsfineart.com/checkout/success?session_id=secret',
                $referrer: 'https://example.com/path?campaign=private',
                artwork_id: 42,
            }),
        ).toEqual({
            $current_url: 'https://jwsfineart.com/checkout/success',
            $referrer: 'https://example.com/path',
            artwork_id: 42,
        });
    });

    it('normalizes legacy and dynamic routes for historical reports', () => {
        expect(normalizedAnalyticsPath('https://www.jwsfineart.com/gallery?piece=42')).toBe('/work');
        expect(normalizedAnalyticsPath('/details/42')).toBe('/work/[artwork]');
        expect(normalizedAnalyticsPath('/work/solana-beach')).toBe('/work/[artwork]');
        expect(normalizedAnalyticsPath('/biography')).toBe('/studio');
        expect(normalizedAnalyticsPath('/checkout/session/success')).toBe('/checkout');
        expect(analyticsPathLabel('/work/[artwork]')).toBe('Artwork detail');
    });
});
