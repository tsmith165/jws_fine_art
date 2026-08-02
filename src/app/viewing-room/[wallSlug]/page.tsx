import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { readPublishedGalleryWall } from '@/data/galleryWallReads';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ wallSlug: string }> }): Promise<Metadata> {
    const { wallSlug } = await params;
    const wall = await readPublishedGalleryWall(wallSlug);
    if (!wall) return {};
    return {
        title: `${wall.title} | Gallery`,
        description: wall.narrative || `Explore ${wall.title}, curated by Jill Weeks Smith.`,
        alternates: { canonical: `/viewing-room?wall=${encodeURIComponent(wall.slug)}` },
    };
}

export default async function ViewingRoomWallPage({ params }: { params: Promise<{ wallSlug: string }> }) {
    const { wallSlug } = await params;
    const wall = await readPublishedGalleryWall(wallSlug);
    if (!wall) notFound();
    redirect(`/viewing-room?wall=${encodeURIComponent(wallSlug)}`);
}
