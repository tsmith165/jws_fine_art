'use client';

import React from 'react';
import CheckoutForm from './CheckoutForm';
import { motion } from 'framer-motion';

interface CheckoutProps {
    piece_list: any[];
    current_id: string;
}

const Checkout: React.FC<CheckoutProps> = ({ piece_list, current_id }) => {
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
        <div className="flex h-full w-full overflow-y-auto bg-stone-900 p-4">
            <div className="flex h-fit w-full flex-col items-center justify-center space-y-4 md:h-full md:flex-row md:space-x-4 md:space-y-0">
                <div className="flex h-full w-auto items-center justify-center rounded-md ">
                    <motion.img
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        src={current_piece.image_path}
                        alt={current_piece.title}
                        width={current_piece.width}
                        height={current_piece.height}
                        className="max-h-[40dvh] w-auto rounded-md bg-stone-600 object-contain p-1 hover:cursor-pointer md:max-h-[50dvh] md:min-h-[50dvh]"
                    />
                </div>
                <div className="flex h-fit w-full items-center justify-center rounded-lg text-white shadow-lg md:h-full md:w-fit md:justify-start">
                    <div className="flex w-full flex-col items-center justify-center space-y-2">
                        <h1 className="text-center text-xl font-bold text-primary">{current_piece.title}</h1>
                        <CheckoutForm current_piece={current_piece} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
