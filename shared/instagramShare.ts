const instagramShareTokenPattern = /^[A-Za-z0-9._~%=-]+$/;

export function normalizeInstagramShareToken(value: string | null | undefined): string {
    const trimmed = value?.trim() ?? '';
    if (!trimmed) return '';
    const match = trimmed.match(/(?:^|[?&])igsh=([^&#\s]+)/i);
    return match?.[1] ?? trimmed;
}

export function isInstagramShareToken(value: string): boolean {
    return Boolean(value) && instagramShareTokenPattern.test(value);
}
