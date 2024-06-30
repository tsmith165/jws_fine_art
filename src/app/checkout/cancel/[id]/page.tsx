import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Cancel Checkout',
    description: 'Cancel Checkout for JWS Fine Art',
    keywords:
        'Jill Weeks Smith, JWS Fine Art, Jill Weeks Smith Art, JWS Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Checkout, Cancel',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/logo/JWS_ICON_260.png',
        shortcut: '/logo/JWS_ICON_260.png',
        apple: '/favicon/apple-icon.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Cancel Checkout',
        description: 'Cancel Checkout for JWS Fine Art',
        siteName: 'JWS Fine Art',
        url: 'https://www.jwsfineart.com',
        images: [
            {
                url: '/favicon/og-image.png',
                width: 1200,
                height: 630,
                alt: 'JWS Fine Art',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
};

import { fetchPieces } from '@/app/actions';
import { Pieces } from '@/db/schema';

import PROJECT_CONSTANTS from '@/lib/constants';
import PageLayout from '@/components/layout/PageLayout';
import Image from 'next/image';

export default async function Page({ params }: { params: { id: string } }) {
    const piece_list: Pieces[] = await fetchPieces();
    const passed_o_id = params.id;
    const current_piece = piece_list.find((piece) => piece.o_id === Number(passed_o_id));

    return (
        <PageLayout page={`/checkout/cancel/${passed_o_id}`}>
            <div className="flex h-full w-full overflow-y-auto bg-stone-900 p-4">
                <div className="flex h-fit flex-col items-center justify-center space-y-4 md:h-full md:flex-row md:space-x-4 md:space-y-0">
                    <div className="md:max-w-1/3 flex h-full w-full items-center justify-center rounded-md md:h-auto md:w-fit">
                        {current_piece && (
                            <Image
                                src={current_piece.image_path}
                                alt={current_piece.title}
                                width={current_piece.width}
                                height={current_piece.height}
                                quality={100}
                                className="h-full w-full rounded-md bg-stone-600 object-contain p-1"
                            />
                        )}
                    </div>
                    <div className="flex h-full w-full items-center justify-center rounded-lg text-white shadow-lg md:w-2/3">
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <h1 className="mb-4 w-full py-2 text-center text-2xl font-bold text-primary">
                                {current_piece ? `"${current_piece.title}"` : ''}
                            </h1>
                            <div className="w-full px-4 text-left ">
                                <p className="mb-2 font-sans text-lg font-bold text-red-600">Purchase was not successful.</p>
                                <p className="mb-2 font-sans text-lg font-bold text-red-600">
                                    Try reloading the home page and selecting the piece again.
                                </p>
                                <p className="font-sans text-stone-300">
                                    If problems persist, feel free to reach out at{' '}
                                    <a className="text-blue-400 hover:text-blue-300" href={`mailto:${PROJECT_CONSTANTS.CONTACT_EMAIL}`}>
                                        {` ${PROJECT_CONSTANTS.CONTACT_EMAIL}`}
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}

export const revalidate = 60;
