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
        <div className="flex h-[calc(100dvh-50px)] w-full flex-col items-center justify-center bg-stone-900 p-4 md:flex-row">
            <div className="md:max-w-1/3 flex h-full w-full items-center justify-center rounded-md md:h-auto md:w-fit">
                <Image
                    src={current_piece.image_path}
                    alt={current_piece.title}
                    width={current_piece.width}
                    height={current_piece.height}
                    quality={100}
                    className="h-full w-full rounded-md bg-stone-600 object-contain p-1"
                />
            </div>
            <div className="flex h-full w-full items-center justify-center rounded-lg p-4 text-white shadow-lg md:w-2/3">
                <div className="flex flex-col items-center justify-center space-y-2">
                    <h1 className="text-2xl font-bold text-primary">{current_piece.title}</h1>
                    <CheckoutForm current_piece={current_piece} />
                </div>
            </div>
        </div>
    );
};

export default Checkout;
