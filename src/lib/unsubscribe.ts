import { createHmac, timingSafeEqual } from 'node:crypto';

function signingSecret(): string {
    const secret = process.env.UNSUBSCRIBE_SIGNING_SECRET || process.env.CONVEX_SERVER_WRITE_SECRET;
    if (!secret || secret.length < 32) throw new Error('Unsubscribe signing is not configured.');
    return secret;
}

function signature(payload: string): string {
    return createHmac('sha256', signingSecret()).update(payload).digest('base64url');
}

export function createUnsubscribeToken(email: string): string {
    const payload = Buffer.from(email.trim().toLowerCase(), 'utf8').toString('base64url');
    return `${payload}.${signature(payload)}`;
}

export function readUnsubscribeToken(token: string): string | null {
    const [payload, suppliedSignature, extra] = token.split('.');
    if (!payload || !suppliedSignature || extra) return null;
    const expected = Buffer.from(signature(payload));
    const supplied = Buffer.from(suppliedSignature);
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
    try {
        const email = Buffer.from(payload, 'base64url').toString('utf8').trim().toLowerCase();
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
    } catch {
        return null;
    }
}

export function publicSiteOrigin(): string {
    const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://www.jwsfineart.com';
    return configured.startsWith('http') ? configured : `https://${configured}`;
}

export function unsubscribeUrls(email: string): { page: string; oneClick: string } {
    const token = createUnsubscribeToken(email);
    const origin = publicSiteOrigin();
    return {
        page: `${origin}/unsubscribe?token=${encodeURIComponent(token)}`,
        oneClick: `${origin}/api/unsubscribe?token=${encodeURIComponent(token)}`,
    };
}

export function appendUnsubscribeFooter(html: string, pageUrl: string): string {
    return `${html}<div style="margin-top:32px;padding-top:20px;border-top:1px solid #d8d8d2;color:#686d67;font:12px/1.5 Arial,sans-serif;text-align:center">You received this studio note because you joined the JWS Fine Art mailing list. <a href="${pageUrl}" style="color:#315e52">Unsubscribe</a>.</div>`;
}
