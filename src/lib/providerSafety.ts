export type StripeMode = 'test' | 'live';

export function stripeMode(secretKey: string): StripeMode | null {
    if (secretKey.startsWith('sk_test_')) return 'test';
    if (secretKey.startsWith('sk_live_')) return 'live';
    return null;
}

export function assertStripeEnvironment(environment: Record<string, string | undefined> = process.env): {
    secretKey: string;
    mode: StripeMode;
} {
    const secretKey = environment.STRIPE_SECRET_KEY;
    if (!secretKey) throw new Error('Stripe is not configured.');
    const mode = stripeMode(secretKey);
    if (!mode) throw new Error('Stripe configuration is invalid.');
    const expectedMode: StripeMode = environment.VERCEL_ENV === 'production' ? 'live' : 'test';
    if (mode !== expectedMode) {
        throw new Error(`Stripe ${mode} credentials cannot run in the ${environment.VERCEL_ENV || 'local'} environment.`);
    }
    return { secretKey, mode };
}
