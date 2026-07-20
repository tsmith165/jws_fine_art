import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Catalog } from '@/components/lit-wall/Catalog';
import { SiteShell } from '@/components/lit-wall/SiteShell';
import { readPublicArtworks } from '@/data/artworkReads';

export const metadata: Metadata = {
    title: 'Work',
    description: 'Browse available original paintings, prints, studies, and selected archive work by Jill Weeks Smith.',
    alternates: { canonical: '/work' },
};

export default async function WorkPage() {
    const pieces = await readPublicArtworks();
    return (
        <SiteShell newsletter>
            <header className="lw-page-intro lw-work-intro">
                <span className="lw-eyebrow">The collection</span>
                <h1>Original work by Jill Weeks Smith.</h1>
                <p>Original paintings of familiar shores, shifting light, and the quiet details noticed along the way.</p>
            </header>
            <div className="lw-catalog-wrap">
                <Suspense fallback={<div className="lw-catalog-loading">Preparing the collection…</div>}>
                    <Catalog pieces={pieces} />
                </Suspense>
            </div>
        </SiteShell>
    );
}

export const revalidate = 300;
