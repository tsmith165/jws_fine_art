import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import UploadButtonClient from './UploadButtonClient';
import { createPiece } from '../actions';

interface NewPieceData {
    title: string;
    imagePath: string;
    width: number;
    height: number;
}

export default function CreatePiece() {
    async function handleCreatePiece(newPieceData: NewPieceData) {
        'use server';
        console.log('Creating new piece:', newPieceData);
        const newPiece = await createPiece(newPieceData);
        revalidatePath('/edit');
        redirect(`/edit/${newPiece.o_id}`);
    }

    return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-secondary_dark">
            <div className="flex w-2/5 flex-col items-center justify-center rounded-lg bg-secondary_light">
                <div id="header" className="w-full rounded-t-lg bg-secondary p-4 text-center text-4xl font-bold text-primary">
                    Create New Piece
                </div>
                <div className="flex w-full flex-col items-center space-y-2 p-2">
                    <UploadButtonClient onCreatePiece={handleCreatePiece} />
                </div>
            </div>
        </div>
    );
}
