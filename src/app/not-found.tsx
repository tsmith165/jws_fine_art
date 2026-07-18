import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SiteShell } from '@/components/lit-wall/SiteShell';

export default function NotFound() {
    return (
        <SiteShell>
            <section className="lw-status-page">
                <span className="lw-eyebrow">404 · Not found</span>
                <h1>This page has left the wall.</h1>
                <p>The artwork may have moved, or the address may be incomplete.</p>
                <Link className="lw-button lw-button-brass" href="/work">
                    Return to the collection <ArrowRight size={16} />
                </Link>
            </section>
        </SiteShell>
    );
}
