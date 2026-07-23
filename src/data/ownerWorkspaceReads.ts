import 'server-only';
import { api } from '../../convex/_generated/api';
import { ownerArtworkAttention } from '@/lib/ownerArtworkAttention';
import { filterCategorizerArtworks } from '@/lib/ownerArtworkFilters';
import { readOwnerArtworksWithMedia } from './ownerReads';
import { getAuthenticatedOwnerConvexClient } from './ownerConvex';

async function ownerClient(action: string) {
    return getAuthenticatedOwnerConvexClient(action);
}

export async function readOwnerDashboard() {
    const [dashboard, artworks] = await Promise.all([
        (await ownerClient('read the studio dashboard')).query(api.ownerWorkspace.dashboard, {}),
        readOwnerArtworksWithMedia(),
    ]);
    return {
        ...dashboard,
        artwork: {
            ...dashboard.artwork,
            needsDetails: filterCategorizerArtworks(artworks).filter((artwork) => ownerArtworkAttention(artwork).length > 0).length,
        },
    };
}

export async function readOwnerOrders() {
    return (await ownerClient('read orders')).query(api.ownerWorkspace.listOrders, {});
}

export async function readOwnerInquiries() {
    return (await ownerClient('read collector inquiries')).query(api.ownerWorkspace.listInquiries, {});
}

export async function readOwnerSubscribers() {
    return (await ownerClient('read mailing subscribers')).query(api.ownerWorkspace.listSubscribers, {});
}

export async function readOwnerCampaigns() {
    return (await ownerClient('read mailing campaigns')).query(api.ownerWorkspace.listCampaigns, {});
}
