import { readAdjacentArtworkIds, readFirstAvailableArtworkId, readHomepageArtworks, readPublicArtworks } from '../../src/data/artworkReads';
import type { PiecesWithImages } from '../../src/db/schema';
import { canonicalJson } from './shared';

function publicSnapshot(artwork: PiecesWithImages) {
    return {
        id: artwork.id,
        oId: artwork.o_id,
        pId: artwork.p_id,
        className: artwork.class_name,
        title: artwork.title,
        imagePath: artwork.image_path,
        width: artwork.width,
        height: artwork.height,
        smallImagePath: artwork.small_image_path,
        smallWidth: artwork.small_width,
        smallHeight: artwork.small_height,
        price: artwork.price,
        sold: artwork.sold,
        available: artwork.available,
        description: artwork.description,
        pieceType: artwork.piece_type,
        instagram: artwork.instagram,
        realWidth: artwork.real_width,
        realHeight: artwork.real_height,
        active: artwork.active,
        theme: artwork.theme,
        framed: artwork.framed,
        extraImages: artwork.extraImages
            .map(({ id, piece_id, title, image_path, width, height, small_image_path, small_width, small_height }) => ({
                id,
                pieceId: piece_id,
                title,
                imagePath: image_path,
                width,
                height,
                smallImagePath: small_image_path,
                smallWidth: small_width,
                smallHeight: small_height,
            }))
            .sort((a, b) => a.id - b.id),
        progressImages: artwork.progressImages
            .map(({ id, piece_id, title, image_path, width, height, small_image_path, small_width, small_height }) => ({
                id,
                pieceId: piece_id,
                title,
                imagePath: image_path,
                width,
                height,
                smallImagePath: small_image_path,
                smallWidth: small_width,
                smallHeight: small_height,
            }))
            .sort((a, b) => a.id - b.id),
    };
}

async function capture(backend: 'neon' | 'convex') {
    process.env.JWS_READ_BACKEND = backend;
    const artworks = await readPublicArtworks();
    const homepage = await readHomepageArtworks(6);
    const firstAvailable = await readFirstAvailableArtworkId();
    const navigationIds = [artworks[0]?.id, artworks[Math.floor(artworks.length / 2)]?.id, artworks.at(-1)?.id].filter(
        (id): id is number => id !== undefined,
    );
    const adjacent = await Promise.all(navigationIds.map(async (id) => [id, await readAdjacentArtworkIds(id)] as const));
    return {
        artworks: artworks.map(publicSnapshot),
        homepageIds: homepage.map((artwork) => artwork.id),
        firstAvailable,
        adjacent: Object.fromEntries(adjacent),
    };
}

const neon = await capture('neon');
const convex = await capture('convex');
function firstDifference(left: unknown, right: unknown, path = 'root'): string | null {
    if (Object.is(left, right)) return null;
    if (typeof left !== typeof right || left === null || right === null) {
        return `${path}: ${JSON.stringify(left)} !== ${JSON.stringify(right)}`;
    }
    if (Array.isArray(left) || Array.isArray(right)) {
        if (!Array.isArray(left) || !Array.isArray(right)) return `${path}: array type mismatch`;
        if (left.length !== right.length) return `${path}.length: ${left.length} !== ${right.length}`;
        for (let index = 0; index < left.length; index += 1) {
            const difference = firstDifference(left[index], right[index], `${path}[${index}]`);
            if (difference) return difference;
        }
        return null;
    }
    if (typeof left === 'object' && typeof right === 'object') {
        const leftRecord = left as Record<string, unknown>;
        const rightRecord = right as Record<string, unknown>;
        const keys = [...new Set([...Object.keys(leftRecord), ...Object.keys(rightRecord)])].sort();
        for (const key of keys) {
            const difference = firstDifference(leftRecord[key], rightRecord[key], `${path}.${key}`);
            if (difference) return difference;
        }
        return null;
    }
    return `${path}: ${JSON.stringify(left)} !== ${JSON.stringify(right)}`;
}

const difference = firstDifference(convex, neon);
if (difference) throw new Error(`Convex and Neon public read contracts diverged at ${difference}`);
if (canonicalJson(convex) !== canonicalJson(neon)) throw new Error('Canonical serialization diverged after structural comparison.');

console.log(
    JSON.stringify({
        verified: true,
        artworkCount: convex.artworks.length,
        supportingImageCount: convex.artworks.reduce((count, artwork) => count + artwork.extraImages.length, 0),
        progressImageCount: convex.artworks.reduce((count, artwork) => count + artwork.progressImages.length, 0),
        homepageIds: convex.homepageIds,
        firstAvailable: convex.firstAvailable,
        navigationSamples: Object.keys(convex.adjacent).length,
    }),
);
