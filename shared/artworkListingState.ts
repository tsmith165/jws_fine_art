export type ArtworkListingStatus = 'available' | 'private-collection' | 'not-for-sale';

type ArtworkAvailability = {
    available: boolean;
    sold: boolean;
};

export function artworkListingStatus({ available, sold }: ArtworkAvailability): ArtworkListingStatus {
    if (available) return 'available';
    if (sold) return 'private-collection';
    return 'not-for-sale';
}

export function artworkAvailabilityForStatus(status: ArtworkListingStatus): ArtworkAvailability {
    if (status === 'available') return { available: true, sold: false };
    if (status === 'private-collection') return { available: false, sold: true };
    return { available: false, sold: false };
}

export function normalizeArtworkAvailability({ available, sold }: ArtworkAvailability): ArtworkAvailability {
    return artworkAvailabilityForStatus(artworkListingStatus({ available, sold }));
}
