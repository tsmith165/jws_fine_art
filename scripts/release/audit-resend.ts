import nextEnv from '@next/env';
import process from 'node:process';
import { Resend, type WebhookEvent } from 'resend';

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const apiKey = process.env.RESEND_AUDIT_API_KEY || process.env.RESEND_API_KEY;
if (!apiKey) throw new Error('RESEND_AUDIT_API_KEY or RESEND_API_KEY is required.');
const resend = new Resend(apiKey);
const endpoint = 'https://www.jwsfineart.com/api/resend/webhook';
const requiredEvents: WebhookEvent[] = [
    'email.sent',
    'email.delivered',
    'email.delivery_delayed',
    'email.bounced',
    'email.complained',
    'email.suppressed',
    'email.failed',
];

const [domainsResult, webhooksResult] = await Promise.all([resend.domains.list(), resend.webhooks.list({ limit: 100 })]);
const inspectionError = domainsResult.error?.message || webhooksResult.error?.message || null;
if (inspectionError) {
    console.log(
        JSON.stringify({
            ready: false,
            failures: [
                inspectionError.includes('restricted to only send emails')
                    ? 'The application uses a send-only Resend key. Run this audit locally with a temporary full-access RESEND_AUDIT_API_KEY or verify the domain and webhook in the Resend dashboard.'
                    : `Resend configuration could not be inspected: ${inspectionError}`,
            ],
        }),
    );
    process.exit(1);
}

const domain = domainsResult.data?.data.find((item) => item.name === 'jwsfineart.com') ?? null;
const webhook = webhooksResult.data?.data.find((item) => item.endpoint === endpoint) ?? null;
const missingEvents = requiredEvents.filter((event) => !webhook?.events?.includes(event));
const failures = [
    !domain ? 'The jwsfineart.com sending domain is not configured in Resend.' : null,
    domain && domain.status !== 'verified' ? `The Resend sending domain is ${domain.status}.` : null,
    !webhook ? `The production Resend webhook is missing at ${endpoint}.` : null,
    webhook && webhook.status !== 'enabled' ? 'The production Resend webhook is disabled.' : null,
    missingEvents.length > 0 ? `The production Resend webhook is missing events: ${missingEvents.join(', ')}.` : null,
    !process.env.RESEND_WEBHOOK_SECRET ? 'RESEND_WEBHOOK_SECRET is not configured in this environment.' : null,
].filter((failure): failure is string => Boolean(failure));

console.log(
    JSON.stringify({
        domain: domain ? { name: domain.name, status: domain.status, region: domain.region } : null,
        webhook: webhook ? { id: webhook.id, status: webhook.status, endpoint: webhook.endpoint, events: webhook.events } : null,
        ready: failures.length === 0,
        failures,
    }),
);
if (failures.length > 0) process.exitCode = 1;
