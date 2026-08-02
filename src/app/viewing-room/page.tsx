import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteShell } from '@/components/lit-wall/SiteShell';
import { ViewingRoomExperience } from '@/components/lit-wall/ViewingRoomExperience';
import { readPublishedGalleryWalls } from '@/data/galleryWallReads';

export const metadata: Metadata = {
    title: 'Gallery',
    description: 'Explore original artwork by Jill Weeks Smith arranged together on curated gallery walls.',
    alternates: { canonical: '/viewing-room' },
};
export const dynamic = 'force-dynamic';

export default async function ViewingRoomPage({ searchParams }: { searchParams: Promise<{ wall?: string | string[] }> }) {
    const walls = await readPublishedGalleryWalls();
    if (!walls.length) notFound();
    const requestedWall = (await searchParams).wall;
    const requestedSlug = typeof requestedWall === 'string' ? requestedWall : requestedWall?.[0];
    const initialSlug = walls.some((wall) => wall.slug === requestedSlug) ? requestedSlug! : walls[0].slug;
    return (
        <SiteShell newsletter>
            <ViewingRoomExperience walls={walls} initialSlug={initialSlug} />
        </SiteShell>
    );
}
