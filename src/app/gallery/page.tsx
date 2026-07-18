import { permanentRedirect } from 'next/navigation';

export default async function GalleryRedirect({ searchParams }: { searchParams: Promise<{ piece?: string }> }) {
    const { piece } = await searchParams;
    permanentRedirect(piece ? `/details/${piece}` : '/work');
}
