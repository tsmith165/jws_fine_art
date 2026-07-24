import nextEnv from '@next/env';
import process from 'node:process';
import { assertStripeEnvironment, stripeMode, stripeTaxConfiguration } from '../../src/lib/providerSafety';

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const required = [
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_CONVEX_URL',
    'NEXT_PUBLIC_CONVEX_SITE_URL',
    'CONVEX_SERVER_WRITE_SECRET',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_AUTOMATIC_TAX_ENABLED',
    'STRIPE_ARTWORK_TAX_CODE',
    'UPLOADTHING_TOKEN',
    'RESEND_API_KEY',
    'RESEND_WEBHOOK_SECRET',
    'CRON_SECRET',
    'NEXT_PUBLIC_POSTHOG_KEY',
    'NEXT_PUBLIC_POSTHOG_HOST',
    'POSTHOG_PROJECT_ID',
    'POSTHOG_PERSONAL_API_KEY',
    'POSTHOG_API_HOST',
] as const;

const missing = required.filter((name) => !process.env[name]);
const failures: string[] = [];
try {
    assertStripeEnvironment(process.env);
    const tax = stripeTaxConfiguration(process.env);
    if (!tax.enabled) failures.push('Stripe Tax must be enabled for production checkout.');
} catch (error) {
    failures.push(error instanceof Error ? error.message : 'Stripe environment validation failed.');
}
if (missing.length > 0) failures.push(`Missing required variables: ${missing.join(', ')}.`);

console.log(
    JSON.stringify({
        environment: process.env.VERCEL_ENV || 'local',
        stripeMode: process.env.STRIPE_SECRET_KEY ? stripeMode(process.env.STRIPE_SECRET_KEY) : null,
        stripeAutomaticTax: process.env.STRIPE_AUTOMATIC_TAX_ENABLED === 'true',
        writeFreeze: (process.env.JWS_WRITE_FREEZE || '').split(',').filter(Boolean),
        requiredVariablesPresent: Object.fromEntries(required.map((name) => [name, Boolean(process.env[name])])),
        ready: failures.length === 0,
        failures,
    }),
);
if (failures.length > 0) process.exitCode = 1;
