export function requireServerSecret(value: string): void {
    const expected = process.env.CONVEX_SERVER_WRITE_SECRET;
    let mismatch = (expected?.length ?? 0) ^ value.length;
    const comparisonLength = Math.max(expected?.length ?? 0, value.length);
    for (let index = 0; index < comparisonLength; index += 1) {
        mismatch |= (expected?.charCodeAt(index) ?? 0) ^ (value.charCodeAt(index) || 0);
    }
    if (!expected || mismatch !== 0) {
        throw new Error('Server authorization failed.');
    }
}
