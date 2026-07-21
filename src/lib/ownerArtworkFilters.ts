export function filterCategorizerArtworks<T extends { active: boolean | null }>(artworks: readonly T[]): T[] {
    return artworks.filter((artwork) => artwork.active === true);
}
