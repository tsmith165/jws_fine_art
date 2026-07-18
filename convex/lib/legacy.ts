export const SERIALIZER_VERSION = 'jws-neon-canonical-json-v1';

export function legacyArtworkSlug(title: string, legacyId: number): string {
    const base = title
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('en-US')
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return `${base || 'untitled'}-${legacyId}`;
}

export function normalizeLegacyBoolean(value: boolean | null, fallback: boolean): boolean {
    return value ?? fallback;
}
