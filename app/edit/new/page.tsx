import { createPiece } from '../actions';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

interface NewPieceData {
    title: string;
    imagePath: string;
}

export default function NewPiecePage() {
    async function handleCreatePiece(formData: FormData) {
        'use server';
        const newPieceData: NewPieceData = {
            title: formData.get('title')?.toString() || '',
            imagePath: formData.get('imagePath')?.toString() || '',
        };

        const newPiece = await createPiece(newPieceData);
        revalidatePath('/edit');
        redirect(`/edit/${newPiece.o_id}`);
    }

    return (
        <div className="flex h-[calc(100vh-80px)] w-full flex-col items-center justify-center">
            <h1 className="mb-8 text-4xl font-bold">Create New Piece</h1>
            <form action={handleCreatePiece} className="flex w-1/2 flex-col space-y-4">
                <div>
                    <label htmlFor="title" className="mb-1 block font-semibold">
                        Title:
                    </label>
                    <input type="text" id="title" name="title" className="w-full rounded-md border border-gray-300 px-3 py-2" required />
                </div>
                <div>
                    <label htmlFor="image" className="mb-1 block font-semibold">
                        Image:
                    </label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                        required
                    />
                </div>
                <button type="submit" className="rounded-md bg-primary px-4 py-2 text-secondary_dark hover:bg-secondary hover:text-primary">
                    Create Piece
                </button>
            </form>
        </div>
    );
}
