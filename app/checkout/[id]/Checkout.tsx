import React from 'react';
import Image from 'next/image';
import CheckoutForm from './CheckoutForm';

interface CheckoutProps {
    piece_list: any[];
    current_id: string;
    most_recent_id: number;
}

const Checkout: React.FC<CheckoutProps> = ({ piece_list, current_id, most_recent_id }) => {
    const passed_o_id = current_id;
    console.log(`LOADING CHECKOUT PAGE - Piece ID: ${passed_o_id}`);

    const num_pieces = piece_list.length;
    let piece_position = 0;

    for (let i = 0; i < piece_list.length; i++) {
        if (piece_list[i]['o_id'].toString() === passed_o_id.toString()) {
            piece_position = i;
        }
    }

    const current_piece = piece_list[piece_position];

    return (
        <div className="flex h-full w-full flex-col md:flex-row">
            <div className="bg-secondary_dark md:w-[65%]">
                <Image
                    src={current_piece.image_path}
                    alt={current_piece.title}
                    width={current_piece.width}
                    height={current_piece.height}
                    quality={100}
                    className="h-full w-full object-contain"
                />
            </div>
            <div className="bg-secondary_light md:w-[35%]">
                <div className="flex flex-row items-center justify-center bg-secondary px-4 py-1">
                    <h1 className="text-2xl font-bold text-primary">{current_piece.title}</h1>
                </div>
                <CheckoutForm current_piece={current_piece} />
            </div>
        </div>
    );
};

export default Checkout;
