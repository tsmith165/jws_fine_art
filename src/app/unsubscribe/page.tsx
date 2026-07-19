import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteShell } from '@/components/lit-wall/SiteShell';
import { readUnsubscribeToken } from '@/lib/unsubscribe';
import { UnsubscribeForm } from './UnsubscribeForm';

export const metadata: Metadata = { title: 'Mailing preferences', robots: { index: false, follow: false } };

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
    const token = (await searchParams).token || '';
    const email = readUnsubscribeToken(token);
    return (
        <SiteShell>
            <section className="lw-purchase-status">
                <article>
                    <span className="lw-eyebrow">Mailing preferences</span>
                    <h1>{email ? 'Leave the studio list.' : 'This link is not valid.'}</h1>
                    {email ? (
                        <UnsubscribeForm token={token} email={email} />
                    ) : (
                        <p>
                            The unsubscribe link may be incomplete. Contact <a href="mailto:jwsfineart@gmail.com">Jill</a> for help.
                        </p>
                    )}
                    <Link className="lw-button" href="/">
                        Return to the gallery
                    </Link>
                </article>
            </section>
        </SiteShell>
    );
}
