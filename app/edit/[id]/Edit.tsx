import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import { MdPageview } from 'react-icons/md';

import EditForm from './EditForm';
import PieceOrderPanel from './PieceOrderPanel';

interface EditProps {
    piece: any;
    current_id: string;
    next_id: number;
    last_id: number;
}

const Edit: React.FC<EditProps> = ({ piece, current_id, next_id, last_id }) => {
    console.log(`LOADING EDIT DETAILS PAGE - Piece ID: ${current_id}`);

    return (
        <div className="flex h-[calc(100vh-80px)] w-full flex-col lg:flex-row">
            <div className="h-1/3 bg-secondary_dark lg:h-full lg:w-2/3">
                <Image
                    src={piece.image_path}
                    alt={piece.title}
                    width={piece.width}
                    height={piece.height}
                    quality={100}
                    className="h-full w-full object-contain"
                />
            </div>
            <div className="h-2/3 overflow-y-auto bg-secondary lg:h-full lg:w-1/3">
                <div className="flex h-[58px] flex-row items-center space-x-4 bg-primary px-4">
                    <div className="flex h-[58px] flex-col space-y-1 p-1 ">
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
                    <h1 className="m-0 text-2xl font-bold text-secondary_dark">{piece.title}</h1>
                </div>
                <EditForm current_piece={piece} />
                <PieceOrderPanel current_piece={piece} />
            </div>
        </div>
    );
};

export default Edit;
