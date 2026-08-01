import 'server-only';
import { api } from '../../convex/_generated/api';
import { getConvexClient } from './convexClient';
import { getAuthenticatedOwnerConvexClient } from './ownerConvex';
import { requireAdmin } from '@/utils/auth/requireAdmin';

export async function readPublishedGalleryWalls() {
    return getConvexClient().query(api.galleryWalls.listPublished, {});
}

export async function readPublishedGalleryWall(slug: string) {
    return getConvexClient().query(api.galleryWalls.getPublishedBySlug, { slug });
}

export async function readOwnerGalleryWalls() {
    const access = await requireAdmin('manage viewing-room walls');
    if (!access.isAdmin) throw new Error(access.error);
    const client = await getAuthenticatedOwnerConvexClient('manage viewing-room walls');
    return client.query(api.galleryWalls.listOwner, {});
}

export async function readOwnerGalleryWallDiagnostics() {
    const access = await requireAdmin('review viewing-room health');
    if (!access.isAdmin) throw new Error(access.error);
    const client = await getAuthenticatedOwnerConvexClient('review viewing-room health');
    return client.query(api.galleryWalls.ownerDiagnostics, {});
}
