export type WriteScope = 'owner' | 'checkout' | 'public';

function frozenScopes(): Set<string> {
    return new Set(
        (process.env.JWS_WRITE_FREEZE || '')
            .split(',')
            .map((scope) => scope.trim().toLowerCase())
            .filter(Boolean),
    );
}

export function assertWritesEnabled(scope: WriteScope): void {
    const scopes = frozenScopes();
    if (scopes.has('all') || scopes.has(scope)) {
        throw new Error('Studio updates are temporarily paused while the site is being updated. Please try again shortly.');
    }
}
