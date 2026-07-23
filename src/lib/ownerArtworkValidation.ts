import { artworkListingStatus } from '../../shared/artworkListingState';

export type OwnerArtworkField =
    'piece_title' | 'piece_type' | 'price' | 'real_width' | 'real_height' | 'description' | 'categories' | 'instagram';

export type OwnerArtworkValidationInput = {
    piece_title: string;
    piece_type: string;
    price: string;
    real_width: string;
    real_height: string;
    description: string;
    categories: string[];
    instagram: string;
    available: boolean;
    sold: boolean;
};

export type OwnerArtworkIssue = {
    field: OwnerArtworkField;
    tone: 'error' | 'warning';
    message: string;
};

function positiveNumber(value: string) {
    if (!value.trim()) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : Number.NaN;
}

function validHttpUrl(value: string) {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

export function validateOwnerArtwork(input: OwnerArtworkValidationInput) {
    const issues: OwnerArtworkIssue[] = [];
    const listingStatus = artworkListingStatus({ available: input.available, sold: input.sold });
    const publishing = listingStatus === 'available';
    const missingTone = publishing ? ('error' as const) : ('warning' as const);
    const publishMessage = (message: string) => (publishing ? message : `${message} Required before publishing.`);

    const title = input.piece_title.trim();
    if (!title) issues.push({ field: 'piece_title', tone: 'error', message: 'Artwork title is required to save.' });
    else if (title.length < 2) issues.push({ field: 'piece_title', tone: 'error', message: 'Use at least 2 characters for the title.' });
    else if (title.length > 160)
        issues.push({ field: 'piece_title', tone: 'error', message: 'Keep the title to 160 characters or fewer.' });

    if (!input.piece_type.trim()) {
        issues.push({ field: 'piece_type', tone: missingTone, message: publishMessage('Choose the artwork medium.') });
    }

    const price = positiveNumber(input.price);
    if (price === null) {
        issues.push({ field: 'price', tone: missingTone, message: publishMessage('Add a price greater than $0.') });
    } else if (Number.isNaN(price)) {
        issues.push({ field: 'price', tone: 'error', message: 'Enter a valid price greater than $0.' });
    } else if (price > 10_000_000) {
        issues.push({ field: 'price', tone: 'error', message: 'Enter a price below $10,000,000.' });
    }

    const width = positiveNumber(input.real_width);
    const height = positiveNumber(input.real_height);
    if (width === null) {
        issues.push({ field: 'real_width', tone: missingTone, message: publishMessage('Add the finished artwork width.') });
    } else if (Number.isNaN(width)) {
        issues.push({ field: 'real_width', tone: 'error', message: 'Enter a valid width greater than 0.' });
    } else if (width > 120) {
        issues.push({ field: 'real_width', tone: 'error', message: 'Width must be 120 inches or less.' });
    }
    if (height === null) {
        issues.push({ field: 'real_height', tone: missingTone, message: publishMessage('Add the finished artwork height.') });
    } else if (Number.isNaN(height)) {
        issues.push({ field: 'real_height', tone: 'error', message: 'Enter a valid height greater than 0.' });
    } else if (height > 120) {
        issues.push({ field: 'real_height', tone: 'error', message: 'Height must be 120 inches or less.' });
    }

    const story = input.description.trim();
    if (!story) {
        issues.push({ field: 'description', tone: missingTone, message: publishMessage('Add the artwork story.') });
    } else if (story.length < 20) {
        issues.push({ field: 'description', tone: 'warning', message: 'A little more detail will create a stronger public listing.' });
    } else if (story.length > 5000) {
        issues.push({ field: 'description', tone: 'error', message: 'Keep the artwork story to 5,000 characters or fewer.' });
    }

    if (input.categories.length === 0) {
        issues.push({ field: 'categories', tone: 'warning', message: 'Choose at least one collection so the artwork is easier to find.' });
    }

    if (input.instagram.trim() && !validHttpUrl(input.instagram.trim())) {
        issues.push({ field: 'instagram', tone: 'error', message: 'Enter a complete URL beginning with http:// or https://.' });
    }

    const byField = new Map<OwnerArtworkField, OwnerArtworkIssue>();
    for (const issue of issues) {
        const current = byField.get(issue.field);
        if (!current || (current.tone === 'warning' && issue.tone === 'error')) byField.set(issue.field, issue);
    }
    const errors = issues.filter((issue) => issue.tone === 'error');
    const warnings = issues.filter((issue) => issue.tone === 'warning');
    return { issues, byField, errors, warnings, canSave: errors.length === 0, listingStatus };
}
