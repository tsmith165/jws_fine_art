export const ARTWORK_CATEGORIES = [
    { id: 'coastal', label: 'Coastal' },
    { id: 'mountain', label: 'Mountain' },
    { id: 'urban', label: 'Urban' },
    { id: 'intaglio-lino-cut', label: 'Intaglio & Lino Cut' },
] as const;

export type ArtworkCategoryId = (typeof ARTWORK_CATEGORIES)[number]['id'];

const categoryIds = new Set<string>(ARTWORK_CATEGORIES.map((category) => category.id));

export function isArtworkCategoryId(value: string): value is ArtworkCategoryId {
    return categoryIds.has(value);
}

const legacyCategoryAliases: Record<string, ArtworkCategoryId> = {
    water: 'coastal',
    coast: 'coastal',
    coastal: 'coastal',
    snow: 'mountain',
    mountains: 'mountain',
    mountain: 'mountain',
    city: 'urban',
    urban: 'urban',
    intaglio: 'intaglio-lino-cut',
    linocut: 'intaglio-lino-cut',
    'lino-cut': 'intaglio-lino-cut',
    'intaglio-lino-cut': 'intaglio-lino-cut',
};

export function resolveArtworkCategory(value: string | null | undefined): ArtworkCategoryId | '' {
    if (!value) return '';
    return legacyCategoryAliases[value.trim().toLowerCase()] ?? '';
}

export function normalizeArtworkCategories(values: readonly string[] | null | undefined): ArtworkCategoryId[] {
    const selected = values ?? [];
    return ARTWORK_CATEGORIES.map((category) => category.id).filter((id) => selected.includes(id));
}

export function deriveArtworkCategories({ theme, medium }: { theme?: string | null; medium?: string | null }): ArtworkCategoryId[] {
    const normalizedTheme = (theme ?? '').toLowerCase();
    const normalizedMedium = (medium ?? '').toLowerCase();
    const categories: ArtworkCategoryId[] = [];

    if (/\b(water|coast|coastal)\b/.test(normalizedTheme)) categories.push('coastal');
    if (/\b(snow|mountain|mountains)\b/.test(normalizedTheme)) categories.push('mountain');
    if (/\b(city|urban)\b/.test(normalizedTheme)) categories.push('urban');
    if (/\b(intaglio|linocut|lino cut)\b/.test(normalizedMedium)) categories.push('intaglio-lino-cut');

    return normalizeArtworkCategories(categories);
}

export function artworkCategoryLabel(id: ArtworkCategoryId): string {
    return ARTWORK_CATEGORIES.find((category) => category.id === id)?.label ?? id;
}
