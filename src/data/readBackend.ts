import 'server-only';

export type ReadBackend = 'neon' | 'convex';

export function getReadBackend(): ReadBackend {
    return process.env.JWS_READ_BACKEND === 'convex' ? 'convex' : 'neon';
}
