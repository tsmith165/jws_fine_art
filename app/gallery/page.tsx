import { prisma } from '@/lib/prisma';
import { Piece as PieceType } from '@prisma/client';
import Gallery from './Gallery';
import PageLayout from '@/components/layout/PageLayout';

export const metadata = {
    title: 'JWS Fine Art - Gallery',
    description: 'Gallery page for JWS Fine Art',
    icons: {
        icon: '/JWS_ICON.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Gallery',
    },
};

async function fetchPieces(): Promise<PieceType[]> {
    const pieces = await prisma.piece.findMany({
        orderBy: {
            o_id: 'desc',
        },
        where: {
            active: true,
        },
    });
    return pieces;
}

export default async function Page() {
    const pieces = await fetchPieces();

    return (
        <PageLayout page="/gallery">
            <Gallery pieces={pieces} />
        </PageLayout>
    );
}
