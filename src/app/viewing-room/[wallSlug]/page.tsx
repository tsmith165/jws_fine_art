import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteShell } from '@/components/lit-wall/SiteShell';
import { ViewingRoomExperience } from '@/components/lit-wall/ViewingRoomExperience';
import { readPublishedGalleryWall, readPublishedGalleryWalls } from '@/data/galleryWallReads';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ wallSlug: string }> }): Promise<Metadata> {
    const { wallSlug } = await params;
    const wall = await readPublishedGalleryWall(wallSlug);
    if (!wall) return {};
    return { title: `${wall.title} Viewing Room`, description: wall.narrative || `Explore ${wall.title}, curated by Jill Weeks Smith.`, alternates: { canonical: `/viewing-room/${wall.slug}` } };
}

export default async function ViewingRoomWallPage({ params }: { params: Promise<{ wallSlug: string }> }) {
    const { wallSlug } = await params;
    const walls = await readPublishedGalleryWalls();
    if (!walls.some((wall) => wall.slug === wallSlug)) notFound();
    return <SiteShell newsletter><ViewingRoomExperience walls={walls} initialSlug={wallSlug} /></SiteShell>;
}
