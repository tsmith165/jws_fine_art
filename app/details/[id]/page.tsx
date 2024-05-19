import { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
import Details from '@/app/details/[id]/Details';
import { fetchPieceById, fetchAdjacentPieceIds } from '@/app/actions';

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
    const piece = await fetchPieceById(parseInt(id));
    const { next_id, last_id } = await fetchAdjacentPieceIds(parseInt(id));
    const selectedIndex = parseInt(searchParams?.selected || '0', 10);
    const type = searchParams?.type || 'gallery';

    return (
        <PageLayout page={`/details/${id}`}>
            <Details piece={piece} selectedIndex={selectedIndex} type={type} next_id={next_id || 0} last_id={last_id || 0} />
        </PageLayout>
    );
}

export const revalidate = 60;
