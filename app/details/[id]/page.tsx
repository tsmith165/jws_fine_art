import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import PageLayout from '@/components/layout/PageLayout';
import Details from '@/app/details/[id]/Details';

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
        icons: {
            icon: '/JWS_ICON.png',
        },
        openGraph: {
            title: 'JWS Fine Art - Gallery Piece Details',
        },
    };
}

export default async function Page({ params, searchParams }: PageProps) {
    const { id } = params;
    const { piece_list, most_recent_id } = await get_piece_list();
    const selectedIndex = parseInt(searchParams?.selected || '0', 10);
    const type = searchParams?.type || 'gallery';

    return (
        <PageLayout page={`/details/${id}`}>
            <Details
                piece_list={piece_list}
                current_id={parseInt(id)}
                most_recent_id={most_recent_id}
                selectedIndex={selectedIndex}
                type={type}
            />
        </PageLayout>
    );
}

async function fetchPieces() {
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
        most_recent_id: piece_list[0]['id'],
    };
}
