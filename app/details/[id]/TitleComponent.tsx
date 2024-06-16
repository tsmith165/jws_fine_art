// File: /app/details/[id]/TitleComponent.tsx

import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';

interface TitleComponentProps {
    title: string;
    next_id: number;
    last_id: number;
    nextPieceImage: { image_path: string; width: number; height: number } | null;
    lastPieceImage: { image_path: string; width: number; height: number } | null;
}

const TitleComponent: React.FC<TitleComponentProps> = ({ title, next_id, last_id, nextPieceImage, lastPieceImage }) => {
    return (
        <>
            <Head>
                {nextPieceImage && (
                    <link
                        rel="preload"
                        as="image"
                        href={nextPieceImage.image_path}
                        imageSrcSet={`${nextPieceImage.image_path}?w=${nextPieceImage.width}&h=${nextPieceImage.height}`}
                        imageSizes="(max-width: 640px) 50vw, 66vw"
                    />
                )}
                {lastPieceImage && (
                    <link
                        rel="preload"
                        as="image"
                        href={lastPieceImage.image_path}
                        imageSrcSet={`${lastPieceImage.image_path}?w=${lastPieceImage.width}&h=${lastPieceImage.height}`}
                        imageSizes="(max-width: 640px) 50vw, 66vw"
                    />
                )}
            </Head>
            <div className="z-0 flex h-fit flex-row items-center space-x-2 bg-secondary p-2">
                <div className="flex h-[48px] flex-col space-y-1">
                    <Link href={`/details/${next_id}`} prefetch={true}>
                        <IoIosArrowUp className="h-[22px] w-8 rounded-md bg-secondary_light fill-primary_dark hover:bg-primary hover:fill-primary_dark" />
                    </Link>
                    <Link href={`/details/${last_id}`} prefetch={true}>
                        <IoIosArrowDown className="h-[22px] w-8 rounded-md bg-secondary_light fill-primary_dark hover:bg-primary hover:fill-primary_dark" />
                    </Link>
                </div>
                <div className="flex flex-grow items-center text-2xl font-bold text-primary">{title}</div>
            </div>
        </>
    );
};

export default TitleComponent;
