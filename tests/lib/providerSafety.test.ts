import { describe, expect, it } from 'vitest';
import { assertStripeEnvironment, stripeMode } from '../../src/lib/providerSafety';

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
});
