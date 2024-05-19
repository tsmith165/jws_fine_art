import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { IoIosArrowForward } from 'react-icons/io';
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
                <div className="flex flex-row items-center space-x-4 bg-primary px-4 py-1">
                    <Link href={`/edit/${last_id}`}>
                        <IoIosArrowForward className="h-6 w-6 rotate-180 cursor-pointer text-secondary_dark hover:text-primary" />
                    </Link>
                    <h1 className="flex-grow text-2xl font-bold text-secondary_dark">{piece.title}</h1>
                    <Link href={`/details/${current_id}`}>
                        <MdPageview className="h-6 w-6 cursor-pointer text-secondary_light hover:text-primary" />
                    </Link>
                    <Link href={`/edit/${next_id}`}>
                        <IoIosArrowForward className="h-6 w-6 cursor-pointer text-secondary_dark hover:text-primary" />
                    </Link>
                </div>
                <EditForm current_piece={piece} />
                <PieceOrderPanel current_piece={piece} />
            </div>
        </div>
    );
};

export default Edit;
