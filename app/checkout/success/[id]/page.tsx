import { prisma } from '@/lib/prisma';
import PageLayout from '@/components/layout/PageLayout';
import PROJECT_CONSTANTS from '@/lib/constants';
import Image from 'next/image';

export const metadata = {
    title: 'JWS Fine Art - Successful Checkout',
    description: 'Successful Checkout for JWS Fine Art',
    icons: {
        icon: '/JWS_ICON.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Successful Checkout',
    },
};

export default async function Page({ params }: { params: { id: string } }) {
    const { piece_list } = await get_piece_list();
    const passed_o_id = params.id;
    const current_piece = piece_list.find((piece) => piece.o_id === Number(passed_o_id));

    return (
        <PageLayout page={`/checkout/cancel/${passed_o_id}`}>
            <div className="flex h-full flex-col md:flex-row">
                <div className="flex h-full items-center justify-center bg-secondary_dark md:w-[65%]">
                    {current_piece && (
                        <Image
                            src={`${PROJECT_CONSTANTS.AWS_BUCKET_URL}${current_piece.image_path}`}
                            alt={current_piece.title}
                            width={current_piece.width}
                            height={current_piece.height}
                            quality={100}
                            className="h-full w-full object-contain"
                        />
                    )}
                </div>
                <div className="flex flex-col items-center bg-secondary_light md:w-[35%]">
                    <h1 className="mb-4 w-full bg-secondary py-2 text-center text-2xl font-bold text-primary">
                        {current_piece ? `"${current_piece.title}"` : ''}
                    </h1>
                    <div className="w-full px-4 text-left">
                        <p className="mb-2 text-lg font-bold text-secondary_dark">Purchase Successful! Thank you!</p>
                        <p className="mb-2 text-lg font-bold text-secondary_dark">
                            You will receive an email shortly with your receipt and shipping info.
                        </p>
                        <p className="text-secondary_dark">
                            If problems persist, feel free to reach out at{' '}
                            <a className="text-blue-400 hover:text-blue-300" href={`mailto:${PROJECT_CONSTANTS.CONTACT_EMAIL}`}>
                                {` ${PROJECT_CONSTANTS.CONTACT_EMAIL}`}
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}

async function fetchPieces() {
    console.log('Fetching pieces with prisma');
    const piece_list = await prisma.piece.findMany({
        orderBy: {
            o_id: 'desc',
        },
    });
    return piece_list;
}

async function get_piece_list() {
    console.log('Fetching piece list...');
    const piece_list = await fetchPieces();
    return {
        piece_list: piece_list,
    };
}
