import { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
import Details from '@/app/details/[id]/Details';
import { fetchPieces } from '@/app/actions';

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
    const piece_list = await fetchPieces();
    const selectedIndex = parseInt(searchParams?.selected || '0', 10);
    const type = searchParams?.type || 'gallery';

    return (
        <PageLayout page={`/details/${id}`}>
            <Details piece_list={piece_list} current_id={parseInt(id)} selectedIndex={selectedIndex} type={type} />
        </PageLayout>
    );
}
