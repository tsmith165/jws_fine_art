import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteShell } from '@/components/lit-wall/SiteShell';
import { ViewingRoomExperience } from '@/components/lit-wall/ViewingRoomExperience';
import { readPublishedGalleryWalls } from '@/data/galleryWallReads';

export const metadata: Metadata = {
    title: 'Viewing Room',
    description: 'Explore original artwork by Jill Weeks Smith arranged together on curated gallery walls.',
    alternates: { canonical: '/viewing-room' },
};
export const dynamic = 'force-dynamic';

export default async function ViewingRoomPage() {
    const walls = await readPublishedGalleryWalls();
    if (!walls.length) notFound();
    return <SiteShell newsletter><ViewingRoomExperience walls={walls} initialSlug={walls[0].slug} /></SiteShell>;
}
