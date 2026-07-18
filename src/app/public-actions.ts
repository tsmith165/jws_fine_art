'use server';

import { api } from '../../convex/_generated/api';
import { getServerConvexClient } from '@/data/serverConvex';

export type PublicFormState = { status: 'idle' | 'success' | 'error'; message: string };

const idle: PublicFormState = { status: 'idle', message: '' };

function value(data: FormData, key: string) {
    return data.get(key)?.toString().trim() ?? '';
}

export async function subscribeAction(_state: PublicFormState = idle, data: FormData): Promise<PublicFormState> {
    try {
        const { client, serverSecret } = getServerConvexClient();
        const result = await client.mutation(api.publicWrites.subscribe, {
            serverSecret,
            email: value(data, 'email'),
            name: value(data, 'name') || null,
            consentSource: value(data, 'source') || 'website',
        });
        return result.status === 'suppressed'
            ? { status: 'error', message: 'This address cannot be subscribed. Contact the studio for help.' }
            : { status: 'success', message: 'You are on the list. Watch for a note from Jill.' };
    } catch {
        return { status: 'error', message: 'The studio list could not be updated. Please try again.' };
    }
}

export async function inquiryAction(_state: PublicFormState = idle, data: FormData): Promise<PublicFormState> {
    try {
        const rawArtworkId = value(data, 'artwork_id');
        const artworkLegacyId = rawArtworkId ? Number(rawArtworkId) : null;
        const kind = value(data, 'kind');
        if (kind !== 'artwork' && kind !== 'commission' && kind !== 'general') throw new Error('Invalid inquiry kind.');
        const { client, serverSecret } = getServerConvexClient();
        await client.mutation(api.publicWrites.submitInquiry, {
            serverSecret,
            artworkLegacyId: Number.isSafeInteger(artworkLegacyId) ? artworkLegacyId : null,
            kind,
            name: value(data, 'name'),
            email: value(data, 'email'),
            phone: value(data, 'phone') || null,
            message: value(data, 'message'),
            sourcePath: value(data, 'source_path') || '/contact',
        });
        return { status: 'success', message: 'Your note reached the studio. Jill usually replies within two business days.' };
    } catch {
        return { status: 'error', message: 'Your note could not be sent. Check the form and try again.' };
    }
}
