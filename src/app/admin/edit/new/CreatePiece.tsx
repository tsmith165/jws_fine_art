'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createNewPiece } from '@/app/admin/edit/actions';
import ResizeUploader from '@/app/admin/edit/ResizeUploader';
import InputTextbox from '@/components/inputs/InputTextbox';

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
    const [imageUrl, setImageUrl] = useState('Not yet uploaded');
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [title, setTitle] = useState('Not yet uploaded');
    const [smallImageUrl, setSmallImageUrl] = useState('Not yet uploaded');
    const [smallWidth, setSmallWidth] = useState(0);
    const [smallHeight, setSmallHeight] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const router = useRouter();

    const handleUploadComplete = useCallback(
        (
            fileName: string,
            originalImageUrl: string,
            smallImageUrl: string,
            originalWidth: number,
            originalHeight: number,
            smallWidth: number,
            smallHeight: number,
        ) => {
            console.log(
                'handleUploadComplete',
                fileName,
                originalImageUrl,
                smallImageUrl,
                originalWidth,
                originalHeight,
                smallWidth,
                smallHeight,
            );
            setTitle(fileName.split('.')[0]);
            setImageUrl(originalImageUrl);
            setSmallImageUrl(smallImageUrl);
            setWidth(originalWidth);
            setHeight(originalHeight);
            setSmallWidth(smallWidth);
            setSmallHeight(smallHeight);
            setStatusMessage(null);
        },
        [],
    );

    const handleCreatePiece = async () => {
        setIsSubmitting(true);
        try {
            const data: NewPieceData = {
                title,
                imagePath: imageUrl,
                width,
                height,
                smallImagePath: smallImageUrl,
                smallWidth,
                smallHeight,
            };
            const piece_data = await createNewPiece(data);
            setStatusMessage({ type: 'success', message: 'Piece created successfully.' });
            handleResetInputs();
            if (piece_data.piece?.id) {
                router.push(`/admin/edit/${piece_data.piece?.id}`);
            }
        } catch (error) {
            console.error('Error creating piece:', error);
            setStatusMessage({ type: 'error', message: 'Failed to create piece. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetInputs = useCallback(() => {
        setImageUrl('Not yet uploaded');
        setWidth(0);
        setHeight(0);
        setTitle('Not yet uploaded');
        setSmallImageUrl('Not yet uploaded');
        setSmallWidth(0);
        setSmallHeight(0);
        setStatusMessage(null);
    }, []);

    const isFormValid = imageUrl !== 'Not yet uploaded' && title !== 'Not yet uploaded' && !isSubmitting;

    return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-stone-900">
            <div className="flex w-4/5 flex-col items-center justify-center rounded-lg bg-stone-900">
                <div
                    id="header"
                    className="w-full rounded-t-lg bg-gradient-to-r from-secondary via-secondary_light to-secondary bg-clip-text text-center text-4xl font-bold text-transparent"
                >
                    Create New Piece
                </div>
                <div className="flex w-full flex-col items-center space-y-2 p-2">
                    <ResizeUploader handleUploadComplete={handleUploadComplete} handleResetInputs={handleResetInputs} />
                    <InputTextbox idName="title" name="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <InputTextbox idName="image_path" name="Image URL" value={imageUrl} />
                    <InputTextbox idName="px_width" name="Px Width" value={width.toString()} />
                    <InputTextbox idName="px_height" name="Px Height" value={height.toString()} />
                    <InputTextbox idName="small_image_path" name="Small URL" value={smallImageUrl} />
                    <InputTextbox idName="small_px_width" name="Sm Width" value={smallWidth.toString()} />
                    <InputTextbox idName="small_px_height" name="Sm Height" value={smallHeight.toString()} />
                    {imageUrl !== '' && imageUrl !== null ? null : width < 800 && height < 800 ? (
                        <div className="text-red-500">Warning: Image width and height are less than 800px.</div>
                    ) : width < 800 ? (
                        <div className="text-red-500">Warning: Image width is less than 800px.</div>
                    ) : height < 800 ? (
                        <div className="text-red-500">Warning: Image height is less than 800px.</div>
                    ) : null}

                    <button
                        type="submit"
                        disabled={!isFormValid}
                        onClick={handleCreatePiece}
                        className={
                            'relative rounded-md px-4 py-1 text-lg font-bold ' +
                            (isFormValid
                                ? ' bg-secondary_dark text-stone-300 hover:bg-secondary'
                                : 'cursor-not-allowed bg-stone-300 text-secondary_dark')
                        }
                    >
                        {isSubmitting ? 'Creating...' : 'Create Piece'}
                    </button>
                    {statusMessage && (
                        <div
                            className={`mt-4 rounded p-2 ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        >
                            {statusMessage.message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
