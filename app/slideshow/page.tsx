export const metadata = {
    title: 'JWS Fine Art - Gallery Slideshow',
    description: 'Gallery slideshow for JWS Fine Art',
    icons: {
        icon: '/JWS_ICON.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Gallery Slideshow',
    },
};

import { prisma } from '@/lib/prisma';
import { Piece } from '@prisma/client';

import PageLayout from '@/components/layout/PageLayout';
import Slideshow from '@/app/slideshow/Slideshow';

export default async function Page() {
    const { piece_list } = await get_piece_list();

    return (
        <PageLayout page="Gallery Slideshow">
            <Slideshow piece_list={piece_list} />
        </PageLayout>
    );
}

async function fetchPieces(): Promise<Piece[]> {
    console.log(`Fetching pieces with prisma`);
    const piece_list = await prisma.piece.findMany({
        orderBy: {
            o_id: 'desc',
        },
        where: {
            active: true,
        },
    });
    return piece_list;
}

async function get_piece_list() {
    console.log('Fetching piece list...');
    const piece_list = await fetchPieces();
    return {
        piece_list: piece_list,
        // most_recent_id: piece_list[0]['id'],
    };
}
