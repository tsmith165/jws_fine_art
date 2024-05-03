import { prisma } from '@/lib/prisma';
import PageLayout from '@/components/layout/PageLayout';
import Checkout from '@/app/checkout/Checkout';

export const metadata = {
    title: 'JWS Fine Art - Checkout',
    description: 'Checkout for JWS Fine Art',
    icons: {
        icon: '/JWS_ICON.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Checkout',
    },
};

export default async function Page(props: { params: { id: string } }) {
    const { piece_list, most_recent_id } = await get_piece_list();

    return (
        <PageLayout page={`/checkout/${props.params.id}`}>
            <Checkout piece_list={piece_list} most_recent_id={most_recent_id} current_id={props.params.id} />
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
