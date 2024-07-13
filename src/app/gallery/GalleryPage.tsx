import { fetchPieces } from '@/app/actions';
import React from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const DynamicGallery = dynamic(() => import('./Gallery'), {
    loading: () => (
        <div className="inset-0 flex h-full w-full items-center justify-center">
            <div className="relative flex h-[250px] w-[250px] items-center justify-center rounded-full bg-stone-900 p-6 opacity-70 xxs:h-[300px] xxs:w-[300px] xs:h-[350px] xs:w-[350px]">
                <Image src="/logo/full_logo_small.png" alt="JWS Fine Art Logo" width={370} height={150} priority />
            </div>
        </div>
    ),
    ssr: false,
});

export default async function GalleryPage({ searchParams }: { searchParams: { piece?: string } }) {
    console.log(`Loading Gallery Page`);
    const piecesData = await fetchPieces();

    return <DynamicGallery initialPieces={piecesData} />;
}

export const revalidate = 60;
