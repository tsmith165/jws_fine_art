export function requireServerSecret(value: string): void {
    const expected = process.env.CONVEX_SERVER_WRITE_SECRET;
    if (!expected || value !== expected) {
        throw new Error('Server authorization failed.');
    }
}
