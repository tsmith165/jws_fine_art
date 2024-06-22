import { Metadata } from 'next';
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import Details from '@/app/details/[id]/Details';
import { fetchPieceById, fetchAdjacentPieceIds, fetchPieceImageById } from '@/app/actions';
import { PiecesWithImages } from '@/db/schema';

interface PiecesWithImagesAndAdjacentImages extends PiecesWithImages {
    nextPieceImage: { image_path: string; width: number; height: number } | null;
    lastPieceImage: { image_path: string; width: number; height: number } | null;
}

interface PageProps {
    params: {
        id: string;
    };
    searchParams?: {
        selected?: string;
        type?: string;
    };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    return {
        title: 'JWS Fine Art - Gallery Piece Details',
        description: 'View gallery piece details for JWS Fine Art',
        keywords:
            'Jill Weeks Smith, JWS Fine Art, Jill Weeks Smith Art, JWS Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Piece Details',
        applicationName: 'JWS Fine Art',
        icons: {
            icon: '/JWS_ICON_MAIN.png',
        },
        openGraph: {
            title: 'JWS Fine Art - Piece Details',
            description: 'Piece Details for JWS Fine Art',
            siteName: 'JWS Fine Art',
            url: 'https://www.jwsfineart.com',
            images: [
                {
                    url: '/og-image.png',
                    width: 1200,
                    height: 630,
                    alt: 'JWS Fine Art',
                },
            ],
            locale: 'en_US',
            type: 'website',
        },
    };
}

async function fetchPieceData(id: number): Promise<PiecesWithImagesAndAdjacentImages> {
    const piece = await fetchPieceById(id);
    const { next_id, last_id } = await fetchAdjacentPieceIds(id);

    // Fetch the next and last piece images
    const nextPieceImage = await fetchPieceImageById(next_id);
    const lastPieceImage = await fetchPieceImageById(last_id);

    return {
        ...piece,
        next_id,
        last_id,
        nextPieceImage,
        lastPieceImage,
    };
}

export default async function Page({ params, searchParams }: PageProps) {
    const { id: idParam } = params;
    const id = parseInt(idParam, 10);
    const pieceData = await fetchPieceData(id);
    const selectedIndex = parseInt(searchParams?.selected || '0', 10);
    const type = searchParams?.type || 'gallery';

    return (
        <PageLayout page={`/details/${id}`}>
            <Details pieceData={pieceData} selectedIndex={selectedIndex} type={type} />
        </PageLayout>
    );
}

export const revalidate = 60;
