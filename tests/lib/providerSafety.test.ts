import { describe, expect, it } from 'vitest';
import { assertStripeEnvironment, stripeMode, stripeTaxConfiguration } from '../../src/lib/providerSafety';

describe('provider safety', () => {
    it('detects Stripe credential modes without exposing keys', () => {
        expect(stripeMode('sk_test_example')).toBe('test');
        expect(stripeMode('sk_live_example')).toBe('live');
        expect(stripeMode('invalid')).toBeNull();
    });

    it('requires test credentials outside production and live credentials in production', () => {
        expect(assertStripeEnvironment({ STRIPE_SECRET_KEY: 'sk_test_example', VERCEL_ENV: 'preview' }).mode).toBe('test');
        expect(assertStripeEnvironment({ STRIPE_SECRET_KEY: 'sk_live_example', VERCEL_ENV: 'production' }).mode).toBe('live');
        expect(() => assertStripeEnvironment({ STRIPE_SECRET_KEY: 'sk_live_example', VERCEL_ENV: 'preview' })).toThrow('cannot run');
        expect(() => assertStripeEnvironment({ STRIPE_SECRET_KEY: 'sk_test_example', VERCEL_ENV: 'production' })).toThrow('cannot run');
    });

    it('requires a reviewed artwork tax code before Stripe Tax can be enabled', () => {
        expect(stripeTaxConfiguration({})).toEqual({ enabled: false, artworkTaxCode: null });
        expect(() => stripeTaxConfiguration({ STRIPE_AUTOMATIC_TAX_ENABLED: 'true' })).toThrow('artwork tax code');
        expect(
            stripeTaxConfiguration({
                STRIPE_AUTOMATIC_TAX_ENABLED: 'true',
                STRIPE_ARTWORK_TAX_CODE: 'txcd_artwork',
            }),
        ).toEqual({ enabled: true, artworkTaxCode: 'txcd_artwork' });
    });
});
