import { v } from 'convex/values';
import { mutation } from './_generated/server';
import type { MutationCtx } from './_generated/server';
import { requireServerSecret } from './lib/serverSecret';
import { assertWritesEnabled } from './lib/writeFreeze';

const nullableNumber = v.union(v.number(), v.null());
const nullableString = v.union(v.string(), v.null());

function normalizeEmail(value: string) {
    return value.trim().toLowerCase();
}

function validEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function enforceRateLimit(ctx: MutationCtx, key: string, action: 'inquiry' | 'subscribe', limit: number, windowMs: number) {
    const now = Date.now();
    const existing = await ctx.db
        .query('publicRateLimits')
        .withIndex('by_key', (query) => query.eq('key', key))
        .unique();
    if (!existing) {
        await ctx.db.insert('publicRateLimits', { key, action, windowStartedAt: now, count: 1, updatedAt: now });
        return;
    }
    if (now - existing.windowStartedAt >= windowMs) {
        await ctx.db.patch(existing._id, { action, windowStartedAt: now, count: 1, updatedAt: now });
        return;
    }
    if (existing.count >= limit) throw new Error('Please wait before trying again.');
    await ctx.db.patch(existing._id, { count: existing.count + 1, updatedAt: now });
}

export const submitInquiry = mutation({
    args: {
        serverSecret: v.string(),
        artworkLegacyId: nullableNumber,
        kind: v.union(v.literal('artwork'), v.literal('commission'), v.literal('general')),
        name: v.string(),
        email: v.string(),
        phone: nullableString,
        message: v.string(),
        sourcePath: v.string(),
        rateLimitKey: v.string(),
    },
    handler: async (ctx, args) => {
        requireServerSecret(args.serverSecret);
        assertWritesEnabled('public');
        await enforceRateLimit(ctx, args.rateLimitKey, 'inquiry', 4, 60 * 60 * 1000);
        const name = args.name.trim();
        const email = normalizeEmail(args.email);
        const message = args.message.trim();
        if (name.length < 2 || name.length > 120 || !validEmail(email) || message.length < 10 || message.length > 5000) {
            throw new Error('Inquiry details are incomplete or invalid.');
        }
        let artwork = null;
        if (args.artworkLegacyId !== null) {
            artwork = await ctx.db
                .query('artworks')
                .withIndex('by_legacy_id', (q) => q.eq('legacyId', args.artworkLegacyId!))
                .unique();
        }
        const now = Date.now();
        const inquiryId = await ctx.db.insert('inquiries', {
            artworkId: artwork?._id ?? null,
            artworkLegacyId: artwork?.legacyId ?? args.artworkLegacyId,
            kind: args.kind,
            name,
            email,
            phone: args.phone?.trim() || null,
            message,
            status: 'new',
            sourcePath: args.sourcePath.slice(0, 500),
            createdAt: now,
            updatedAt: now,
        });
        return { inquiryId };
    },
});

export const subscribe = mutation({
    args: { serverSecret: v.string(), email: v.string(), name: nullableString, consentSource: v.string(), rateLimitKey: v.string() },
    handler: async (ctx, args) => {
        requireServerSecret(args.serverSecret);
        assertWritesEnabled('public');
        await enforceRateLimit(ctx, args.rateLimitKey, 'subscribe', 6, 60 * 60 * 1000);
        const email = normalizeEmail(args.email);
        if (!validEmail(email)) throw new Error('A valid email is required.');
        const now = Date.now();
        const existing = await ctx.db
            .query('subscribers')
            .withIndex('by_normalized_email', (q) => q.eq('normalizedEmail', email))
            .unique();
        if (existing?.status === 'suppressed') return { status: 'suppressed' as const };
        if (existing) {
            await ctx.db.patch(existing._id, {
                email,
                name: args.name?.trim() || existing.name,
                status: 'subscribed',
                consentSource: args.consentSource,
                consentedAt: now,
                unsubscribedAt: null,
                updatedAt: now,
            });
            await ctx.db.insert('subscriptionEvents', {
                subscriberId: existing._id,
                type: existing.status === 'unsubscribed' ? 'resubscribed' : 'consented',
                source: args.consentSource,
                createdAt: now,
            });
            return { status: 'subscribed' as const };
        }
        const subscriberId = await ctx.db.insert('subscribers', {
            email,
            normalizedEmail: email,
            name: args.name?.trim() || null,
            status: 'subscribed',
            consentSource: args.consentSource,
            consentedAt: now,
            unsubscribedAt: null,
            providerContactId: null,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert('subscriptionEvents', {
            subscriberId,
            type: 'consented',
            source: args.consentSource,
            createdAt: now,
        });
        return { status: 'subscribed' as const };
    },
});

export const unsubscribe = mutation({
    args: { serverSecret: v.string(), email: v.string(), source: v.string() },
    handler: async (ctx, args) => {
        requireServerSecret(args.serverSecret);
        const email = normalizeEmail(args.email);
        const existing = await ctx.db
            .query('subscribers')
            .withIndex('by_normalized_email', (q) => q.eq('normalizedEmail', email))
            .unique();
        if (!existing || existing.status === 'suppressed') return { status: existing?.status ?? 'not_found' };
        const now = Date.now();
        await ctx.db.patch(existing._id, { status: 'unsubscribed', unsubscribedAt: now, updatedAt: now });
        await ctx.db.insert('subscriptionEvents', {
            subscriberId: existing._id,
            type: 'unsubscribed',
            source: args.source,
            createdAt: now,
        });
        return { status: 'unsubscribed' as const };
    },
});
