'use client';

import { redirect } from 'next/navigation';
import UploadButtonClient from './UploadButtonClient';
import { handleCreatePiece } from '../actions';

interface NewPieceData {
    title: string;
    imagePath: string;
    width: number;
    height: number;
    smallImagePath: string;
    smallWidth: number;
    smallHeight: number;
}

export default function CreatePiece() {

    return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-secondary_dark">
            <div className="flex w-2/5 flex-col items-center justify-center rounded-lg bg-secondary_light">
                <div id="header" className="w-full rounded-t-lg bg-secondary p-4 text-center text-4xl font-bold text-primary">
                    Create New Piece
                </div>
                <div className="flex w-full flex-col items-center space-y-2 p-2">
                    <UploadButtonClient onCreatePiece={(data) => {handleCreatePiece(data);}} />
                </div>
            </div>
        </div>
    );
}