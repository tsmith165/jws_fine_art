import type { QueryCtx } from '../_generated/server';

export async function requireOwnerIdentity(ctx: QueryCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.owner_role !== 'ADMIN') {
        throw new Error('Owner access is required.');
    }
    return identity;
}
