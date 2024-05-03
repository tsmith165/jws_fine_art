export const metadata = {
    title: 'JWS Fine Art - Homepage',
    description: 'Jill Weeks Smith Biography',
    icons: {
        icon: '/JWS_ICON.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Homepage',
    },
};

import PageLayout from '@/components/layout/PageLayout';
import Homepage from '@/app/Homepage';

import { prisma } from '@/lib/prisma';

export default async function Page() {
    const { most_recent_id } = await get_piece_list();

    return (
        <PageLayout page="/">
            <Homepage most_recent_id={most_recent_id} />
        </PageLayout>
    );
}

async function fetchFirstPiece() {
    console.log(`Fetching pieces with prisma`);
    const piece = await prisma.piece.findFirst({
        orderBy: {
            o_id: 'desc',
        },
        where: {
            active: true,
        },
    });
    return piece;
}

async function get_piece_list() {
    console.log('Fetching piece list...');
    const first_piece = await fetchFirstPiece();

    return {
        most_recent_id: first_piece ? first_piece.id : null,
    };
}
