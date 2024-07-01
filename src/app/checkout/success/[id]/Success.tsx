'use client';

import React from 'react';
import { motion } from 'framer-motion';
import PROJECT_CONSTANTS from '@/lib/constants';
import { PiecesWithImages } from '@/db/schema';

interface SuccessProps {
    current_piece: PiecesWithImages;
    current_id: number;
}

const Success: React.FC<SuccessProps> = ({ current_piece, current_id }) => {
    console.log(`LOADING SUCCESS PAGE - Piece ID: ${current_id}`);
    return (
        <div className="flex h-fit w-full flex-col items-center justify-center space-y-4 md:h-full md:flex-row md:space-x-4 md:space-y-0">
            <div className="flex h-full w-auto items-center justify-center rounded-md ">
                {current_piece && (
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
                )}
            </div>
            <div className="flex h-full w-fit items-center justify-center rounded-lg text-white shadow-lg md:justify-start ">
                <div className="flex flex-col items-center justify-center space-y-2">
                    <h1 className="w-full text-center text-2xl font-bold text-primary">
                        {current_piece ? `"${current_piece.title}"` : ''}
                    </h1>
                    <div className="flex w-full flex-col space-y-2 px-4 text-left">
                        <p className="font-sans text-lg font-bold text-stone-300">Purchase Successful. Thank you!</p>
                        <p className="font-sans text-lg font-bold text-stone-300">
                            You will receive an email shortly with your receipt and shipping information.
                        </p>
                        <p className="font-sans text-stone-300">
                            If you have any questions, feel free to reach out at
                            <a className="text-blue-400 hover:text-blue-300" href={`mailto:${PROJECT_CONSTANTS.CONTACT_EMAIL}`}>
                                {` ${PROJECT_CONSTANTS.CONTACT_EMAIL}`}
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Success;
