import { beforeEach, describe, expect, it } from 'vitest';
import { appendUnsubscribeFooter, createUnsubscribeToken, readUnsubscribeToken, unsubscribeUrls } from '../../src/lib/unsubscribe';

beforeEach(() => {
    process.env.UNSUBSCRIBE_SIGNING_SECRET = 'test-signing-secret-that-is-at-least-thirty-two-characters';
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.jwsfineart.com/';
});

describe('unsubscribe links', () => {
    it('normalizes and verifies signed recipient tokens', () => {
        const token = createUnsubscribeToken(' Collector@Example.com ');
        expect(readUnsubscribeToken(token)).toBe('collector@example.com');
        expect(readUnsubscribeToken(`${token}tampered`)).toBeNull();
    });

    it('creates page and one-click URLs and appends an email footer', () => {
        const urls = unsubscribeUrls('collector@example.com');
        expect(urls.page).toMatch(/^https:\/\/www\.jwsfineart\.com\/unsubscribe\?token=/);
        expect(urls.oneClick).toMatch(/^https:\/\/www\.jwsfineart\.com\/api\/unsubscribe\?token=/);
        expect(appendUnsubscribeFooter('<p>Studio note</p>', urls.page)).toContain('Unsubscribe');
    });
});
