import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { IoIosArrowForward } from 'react-icons/io';
import { MdPageview } from 'react-icons/md';

import EditForm from './EditForm';
import PieceOrderPanel from './PieceOrderPanel';

interface EditProps {
    piece_list: any[];
    current_id: string;
    most_recent_id: number;
}

const Edit: React.FC<EditProps> = ({ piece_list, current_id, most_recent_id }) => {
    const passed_o_id = current_id;
    console.log(`LOADING EDIT DETAILS PAGE - Piece ID: ${passed_o_id}`);

    const num_pieces = piece_list.length;
    let piece_position = 0;

    for (let i = 0; i < piece_list.length; i++) {
        if (piece_list[i]['o_id'].toString() === passed_o_id.toString()) {
            piece_position = i;
        }
    }
    const current_piece = piece_list[piece_position];

    return (
        <div className="flex h-[calc(100vh-80px)] w-full flex-col lg:flex-row">
            <div className="h-1/3 bg-secondary_dark lg:h-full lg:w-2/3">
                <Image
                    src={current_piece.image_path}
                    alt={current_piece.title}
                    width={current_piece.width}
                    height={current_piece.height}
                    quality={100}
                    className="h-full w-full object-contain"
                />
            </div>
            <div className="h-2/3 bg-secondary lg:h-full lg:w-1/3">
                <div className="flex flex-row items-center space-x-4 bg-primary px-4 py-1">
                    <Link href={`/edit/${piece_list[piece_position - 1 < 0 ? num_pieces - 1 : piece_position - 1].o_id}`}>
                        <IoIosArrowForward className="h-6 w-6 rotate-180 cursor-pointer text-secondary_dark hover:text-primary" />
                    </Link>
                    <h1 className="flex-grow text-2xl font-bold text-secondary_dark">{current_piece.title}</h1>
                    <Link href={`/details/${passed_o_id}`}>
                        <MdPageview className="h-6 w-6 cursor-pointer text-secondary_light hover:text-primary" />
                    </Link>
                    <Link href={`/edit/${piece_list[piece_position + 1 > num_pieces - 1 ? 0 : piece_position + 1].o_id}`}>
                        <IoIosArrowForward className="h-6 w-6 cursor-pointer text-secondary_dark hover:text-primary" />
                    </Link>
                </div>
                <EditForm current_piece={current_piece} />
                <PieceOrderPanel current_piece={current_piece} />
            </div>
        </div>
    );
};

export default Edit;
