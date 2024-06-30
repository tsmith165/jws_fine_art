import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Successful Checkout',
    description: 'Successful Checkout for JWS Fine Art',
    keywords:
        'Jill Weeks Smith, JWS Fine Art, Jill Weeks Smith Art, JWS Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Checkout, Success',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/logo/JWS_ICON_260.png',
        shortcut: '/logo/JWS_ICON_260.png',
        apple: '/favicon/apple-icon.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Successful Checkout',
        description: 'Successful Checkout for JWS Fine Art',
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
                <div className="flex h-fit w-full flex-col items-center justify-center space-y-4 md:h-full md:flex-row md:space-x-4 md:space-y-0">
                    <div className="flex h-full w-auto items-center justify-center rounded-md ">
                        {current_piece && (
                            <Image
                                src={current_piece.image_path}
                                alt={current_piece.title}
                                width={current_piece.width}
                                height={current_piece.height}
                                quality={100}
                                className="h-auto max-h-[35dvh] w-auto rounded-md bg-stone-600 object-contain p-1 md:max-h-none"
                            />
                        )}
                    </div>
                    <div className="flex h-full w-fit items-center justify-center rounded-lg text-white shadow-lg md:justify-start ">
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <h1 className="w-full text-center text-2xl font-bold text-primary">
                                {current_piece ? `"${current_piece.title}"` : ''}
                            </h1>
                            <div className="flex w-full flex-col space-y-2 px-4 text-left">
                                <p className="font-sans text-lg font-bold text-stone-300">Purchase Successful. Thank you!</p>
                                <p className="font-sans text-lg font-bold text-stone-300">
                                    You will receive an email shortly with your receipt and shipping information.
                                </p>
                                <p className="font-sans text-stone-300">
                                    If you have any questions, feel free to reach out at
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
