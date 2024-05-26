import React from 'react';
import { IoIosArrowUp, IoIosArrowDown, IoIosTrash } from 'react-icons/io';
import { handleImageReorder, handleImageDeleteAction } from '../actions';
import { PiecesWithImages, ExtraImages, ProgressImages } from '@/db/schema';

interface PieceOrderPanelProps {
    current_piece: PiecesWithImages;
}

const PieceOrderPanel: React.FC<PieceOrderPanelProps> = ({ current_piece }) => {
    const extra_images: ExtraImages[] = current_piece.extraImages || [];
    const progress_images: ProgressImages[] = current_piece.progressImages || [];

    async function handleImageReorderAction(formData: FormData) {
        'use server';
        const pieceId = Number(formData.get('pieceId'));
        const currentPieceId = Number(formData.get('currentPieceId'));
        const targetPieceId = Number(formData.get('targetPieceId'));
        const imageType = formData.get('imageType')?.toString();

        if (!currentPieceId || !targetPieceId || !imageType) {
            console.error(`Required form data missing. Cannot reorder image.`);
            return;
        }

        await handleImageReorder(pieceId, currentPieceId, targetPieceId, imageType);
    }

    async function handleImageDelete(formData: FormData) {
        'use server';
        const pieceId = Number(formData.get('pieceId'));
        const imageType = formData.get('imageType')?.toString();
        const imagePath = formData.get('imagePath')?.toString();

        if (!imageType || !imagePath) {
            console.error(`Required form data missing. Cannot delete image.`);
            return;
        }

        await handleImageDeleteAction(pieceId, imagePath, imageType);
    }

    const renderImages = (images: (ExtraImages | ProgressImages)[], imageType: string) => {
        const elements = [];
        for (let index = 0; index < images.length; index++) {
            const image = images[index];
            const currentPieceId = image.id;
            const prevPieceId = images[index - 1]?.id || images[images.length - 1]?.id;
            const nextPieceId = images[index + 1]?.id || images[0]?.id;

            elements.push(
                <div
                    key={index}
                    className="flex items-center space-x-2 rounded-b-lg px-2 pt-1 hover:bg-primary_dark hover:text-secondary_light"
                >
                    <form action={handleImageDelete}>
                        <input type="hidden" name="pieceId" value={current_piece.id.toString()} />
                        <input type="hidden" name="imagePath" value={image.image_path} />
                        <input type="hidden" name="imageType" value={imageType} />
                        <button type="submit">
                            <IoIosTrash className="h-6 w-6 cursor-pointer rounded-sm bg-red-500 p-1 hover:bg-red-600" />
                        </button>
                    </form>
                    {prevPieceId && (
                        <form action={handleImageReorderAction}>
                            <input type="hidden" name="pieceId" value={current_piece.id.toString()} />
                            <input type="hidden" name="currentPieceId" value={currentPieceId.toString()} />
                            <input type="hidden" name="targetPieceId" value={prevPieceId.toString()} />
                            <input type="hidden" name="imageType" value={imageType} />
                            <button type="submit">
                                <IoIosArrowUp className="h-6 w-6 cursor-pointer rounded-sm bg-secondary_light fill-primary_dark p-1 hover:bg-primary hover:fill-secondary_dark" />
                            </button>
                        </form>
                    )}
                    {nextPieceId && (
                        <form action={handleImageReorderAction}>
                            <input type="hidden" name="pieceId" value={current_piece.id.toString()} />
                            <input type="hidden" name="currentPieceId" value={currentPieceId.toString()} />
                            <input type="hidden" name="targetPieceId" value={nextPieceId.toString()} />
                            <input type="hidden" name="imageType" value={imageType} />
                            <button type="submit">
                                <IoIosArrowDown className="h-6 w-6 cursor-pointer rounded-sm bg-secondary_light fill-primary_dark p-1 hover:bg-primary hover:fill-secondary_dark" />
                            </button>
                        </form>
                    )}
                    <div className="text-md overflow-hidden text-ellipsis whitespace-nowrap leading-8 text-primary">{image.image_path}</div>
                </div>,
            );
        }
        return elements;
    };

    return (
        <div className="flex h-fit w-full flex-col p-2 pt-0">
            <div className="rounded-lg bg-secondary_dark">
                {extra_images.length > 0 && (
                    <div>
                        <h3 className="rounded-t-lg bg-primary px-2 py-1 text-lg font-semibold text-secondary_dark">Extra Images</h3>
                        {renderImages(extra_images, 'extra')}
                    </div>
                )}
                {progress_images.length > 0 && (
                    <div className="">
                        <h3 className="rounded-t-lg bg-primary px-2 py-1 text-lg font-semibold text-secondary_dark">Progress Images</h3>
                        {renderImages(progress_images, 'progress')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PieceOrderPanel;
