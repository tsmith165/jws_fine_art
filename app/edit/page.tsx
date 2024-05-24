import { redirect } from 'next/navigation';
import { fetchFirstPieceId, fetchPieceById, fetchAdjacentPieceIds } from '@/app/actions';
import PageLayout from '@/components/layout/PageLayout';
import Details from '@/app/details/[id]/Details';

interface PageProps {
    params: {
        id?: string;
    };
    searchParams?: {
        selected?: string;
        type?: string;
    };
}

export async function generateMetadata({ params }: PageProps) {
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
    let { id } = params;

    // If no id is provided, fetch the first piece and redirect to it
    if (!id) {
        const firstId = await fetchFirstPieceId();
        if (firstId) {
            redirect(`/edit/${firstId}`);
            return;
        } else {
            return <div>No pieces available.</div>;
        }
    }

    const piece = await fetchPieceById(parseInt(id, 10));
    const { next_id, last_id } = await fetchAdjacentPieceIds(parseInt(id, 10));
    const selectedIndex = parseInt(searchParams?.selected || '0', 10);
    const type = searchParams?.type || 'gallery';

    return (
        <PageLayout page={`/edit/${id}`}>
            <Details piece={piece} selectedIndex={selectedIndex} type={type} next_id={next_id || 0} last_id={last_id || 0} />
        </PageLayout>
    );
}

export const revalidate = 60;
