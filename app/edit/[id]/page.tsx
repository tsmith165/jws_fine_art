export const metadata = {
    title: 'JWS Fine Art - Edit Piece Details',
    description: 'Edit gallery piece details for JWS Fine Art',
    icons: {
        icon: '/JWS_ICON.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Edit Piece Details',
    },
};

import { prisma } from '@/lib/prisma';
import PROJECT_CONSTANTS from '@/lib/constants';
import PageLayout from '@/components/layout/PageLayout';
import Edit from '@/app/edit/Edit';
import { SignedIn, SignedOut } from '@clerk/nextjs';

export default async function Page({ params }: { params: { id: string } }) {
    const { piece_list, most_recent_id } = await get_piece_list();

    return (
        <PageLayout page={`/edit/${params.id}`}>
            <SignedIn>
                <Edit piece_list={piece_list} current_id={params.id} most_recent_id={most_recent_id} />
            </SignedIn>
        </PageLayout>
    );
}

async function fetchPieces() {
    console.log(`Fetching pieces with prisma`);
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

async function get_piece_list() {
    console.log('Fetching piece list...');
    const piece_list = await fetchPieces();

    return {
        piece_list: piece_list,
        most_recent_id: piece_list[0]['id'],
    };
}
