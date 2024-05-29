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

    if (!pieceData) {
        return <LoadingSpinner page="Edit Details" />;
    }

    const { next_id, last_id } = pieceData;

    if (!pieceData.id || !pieceData.image_path) {
        return <div>Piece data is missing.</div>;
    }

    console.log(`LOADING EDIT DETAILS PAGE - Piece ID: ${current_id}`);

    return (
        <div className="flex h-full w-full flex-col lg:flex-row">
            <div className="h-1/3 bg-secondary_dark lg:h-full lg:w-2/3">
                <Image
                    src={pieceData.image_path}
                    alt={pieceData.title}
                    width={pieceData.width}
                    height={pieceData.height}
                    quality={100}
                    className="h-full w-full object-contain"
                />
            </div>
            <div className="h-2/3 overflow-y-auto bg-secondary lg:h-full lg:w-1/3">
                <div className="flex h-fit flex-row items-center space-x-2 bg-primary p-2">
                    <div className="flex h-[48px] flex-col space-y-1">
                        <Link href={`/edit/${next_id}`}>
                            <IoIosArrowUp className="h-[22px] w-8 cursor-pointer rounded-lg bg-secondary fill-secondary_dark hover:bg-secondary_dark hover:fill-primary" />
                        </Link>
                        <Link href={`/edit/${last_id}`}>
                            <IoIosArrowDown className="h-[22px] w-8 cursor-pointer rounded-lg bg-secondary fill-secondary_dark hover:bg-secondary_dark hover:fill-primary" />
                        </Link>
                    </div>
                    <Link href={`/details/${current_id}`}>
                        <MdPageview className="h-[48px] w-[48px] cursor-pointer rounded-lg bg-secondary fill-secondary_dark p-1 hover:bg-secondary_dark hover:fill-primary" />
                    </Link>
                    <form action={handleTitleUpdate} className="flex w-full flex-grow flex-row rounded-lg bg-secondary_dark">
                        <input type="hidden" name="pieceId" value={pieceData.id} />
                        <input
                            type="text"
                            name="newTitle"
                            defaultValue={pieceData.title}
                            className="m-0 flex w-full flex-grow rounded-lg border-none bg-secondary_dark px-3 py-1 text-2xl font-bold text-primary outline-none"
                        />
                        <button
                            type="submit"
                            className="ml-2 rounded-md bg-secondary px-3 py-1 font-bold text-primary hover:bg-primary_dark hover:text-secondary_dark"
                        >
                            Save
                        </button>
                    </form>
                </div>
                <EditForm current_piece={pieceData} />
                <PieceOrderPanel current_piece={pieceData} />
            </div>
        </div>
    );
};

export default Edit;
