'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import { MdPageview } from 'react-icons/md';
import EditForm from './EditForm';
import PieceOrderPanel from './PieceOrderPanel';
import { handleTitleUpdate } from '../actions';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

interface EditProps {
    pieceDataPromise: Promise<any>;
    current_id: number;
}

const Edit: React.FC<EditProps> = ({ pieceDataPromise, current_id }) => {
    const [pieceData, setPieceData] = useState<any>(null);

    useEffect(() => {
        pieceDataPromise.then((data) => {
            setPieceData(data);
        });
    }, [pieceDataPromise]);

    const next_id = pieceData?.next_id ?? -1;
    const last_id = pieceData?.last_id ?? -1;
    const piece_title = pieceData?.title ?? '';
    const price = pieceData?.price ?? '';

    console.log(`LOADING EDIT DETAILS PAGE - Piece ID: ${current_id}`);

    return (
        <div className="flex h-full w-full flex-col bg-stone-800 md:flex-row">
            <div className="flex h-1/3 items-center justify-center rounded-md object-contain p-8 md:h-full md:w-2/5 lg:w-1/2">
                {pieceData ? (
                    <Image
                        src={pieceData.image_path}
                        alt={pieceData.title}
                        width={pieceData.width}
                        height={pieceData.height}
                        quality={100}
                        className="h-full w-auto rounded-md md:h-auto"
                    />
                ) : (
                    <LoadingSpinner page="Edit Details" />
                )}
            </div>
            <div className="h-2/3 overflow-y-auto p-4 md:h-full md:w-3/5 lg:w-1/2">
                <div className="mb-2 flex h-fit flex-row items-center space-x-2">
                    <div className="flex h-[48px] flex-col space-y-1">
                        <Link href={`/admin/edit/${next_id}`}>
                            <IoIosArrowUp className="h-[22px] w-8 cursor-pointer rounded-lg bg-stone-700 fill-stone-400 hover:bg-stone-600 hover:fill-stone-200" />
                        </Link>
                        <Link href={`/admin/edit/${last_id}`}>
                            <IoIosArrowDown className="h-[22px] w-8 cursor-pointer rounded-lg bg-stone-700 fill-stone-400 hover:bg-stone-600 hover:fill-stone-200" />
                        </Link>
                    </div>
                    <Link href={`/details/${current_id}`}>
                        <MdPageview className="h-[48px] w-[48px] cursor-pointer rounded-lg bg-stone-700 fill-stone-400 p-1 hover:bg-stone-600 hover:fill-stone-200" />
                    </Link>
                    <form action={handleTitleUpdate} className="flex w-full flex-grow flex-row rounded-lg bg-stone-700">
                        <input type="hidden" name="pieceId" value={current_id} />
                        <input
                            type="text"
                            name="newTitle"
                            defaultValue={piece_title}
                            className="m-0 flex w-full flex-grow rounded-lg border-none bg-stone-700 px-3 py-1 text-2xl font-bold text-stone-200 outline-none"
                        />
                        <button
                            type="submit"
                            className="ml-2 rounded-md bg-stone-600 px-3 py-1 font-bold text-stone-200 hover:bg-stone-500"
                        >
                            Save
                        </button>
                    </form>
                </div>
                {pieceData ? (
                    <>
                        <EditForm current_piece={pieceData} />
                        <PieceOrderPanel current_piece={pieceData} />
                    </>
                ) : (
                    <LoadingSpinner page="" />
                )}
            </div>
        </div>
    );
};

export default Edit;
