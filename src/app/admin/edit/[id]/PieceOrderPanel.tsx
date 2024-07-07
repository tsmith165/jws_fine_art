import React from 'react';
import { IoIosArrowUp, IoIosArrowDown, IoIosTrash } from 'react-icons/io';
import { handleImageReorder, handleImageDelete, handleImageTitleEdit } from '../actions';
import { PiecesWithImages, ExtraImages, ProgressImages } from '@/db/schema';
import Image from 'next/image';

interface PieceOrderPanelProps {
    current_piece: PiecesWithImages;
}

const PieceOrderPanel: React.FC<PieceOrderPanelProps> = ({ current_piece }) => {
    const extra_images: ExtraImages[] = current_piece.extraImages || [];
    const progress_images: ProgressImages[] = current_piece.progressImages || [];

    async function handleImageReorderAction(formData: FormData) {
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

    async function handleImageDeleteAction(formData: FormData) {
        const pieceId = Number(formData.get('pieceId'));
        const imageType = formData.get('imageType')?.toString();
        const imagePath = formData.get('imagePath')?.toString();

        if (!imageType || !imagePath) {
            console.error(`Required form data missing. Cannot delete image.`);
            return;
        }

        await handleImageDelete(pieceId, imagePath, imageType);
    }

    async function handleImageTitleEditAction(formData: FormData) {
        const imageId = Number(formData.get('imageId'));
        const newTitle = formData.get('newTitle')?.toString();
        const imageType = formData.get('imageType')?.toString();

        if (!imageId || !newTitle || !imageType) {
            console.error(`Required form data missing. Cannot edit image title.`);
            return;
        }

        await handleImageTitleEdit(imageId, newTitle, imageType);
    }

    const renderImages = (images: (ExtraImages | ProgressImages)[], imageType: string) => {
        const elements = [];
        for (let index = 0; index < images.length; index++) {
            const image = images[index];
            const currentPieceId = image.id;
            const prevPieceId = images[index - 1]?.id || images[images.length - 1]?.id;
            const nextPieceId = images[index + 1]?.id || images[0]?.id;

            elements.push(
                <div key={index} className="group flex h-[60px] flex-row items-center space-x-2 rounded-lg px-2 py-2 hover:bg-stone-400">
                    <Image
                        src={image.image_path}
                        alt={image.image_path}
                        width={image.width}
                        height={image.height}
                        className="h-[40x] w-[40px] object-contain"
                    />
                    <div className="flex h-[40px] flex-col space-y-0.5">
                        <form action={handleImageReorderAction} className="flex h-full w-fit">
                            <input type="hidden" name="pieceId" value={current_piece.id.toString()} />
                            <input type="hidden" name="currentPieceId" value={currentPieceId.toString()} />
                            <input type="hidden" name="targetPieceId" value={prevPieceId.toString()} />
                            <input type="hidden" name="imageType" value={imageType} />
                            <button type="submit">
                                <IoIosArrowUp className="h-[20px] w-[20px] cursor-pointer rounded-sm bg-primary fill-stone-950 p-1 hover:bg-primary_dark hover:fill-stone-400" />
                            </button>
                        </form>
                        <form action={handleImageReorderAction}>
                            <input type="hidden" name="pieceId" value={current_piece.id.toString()} />
                            <input type="hidden" name="currentPieceId" value={currentPieceId.toString()} />
                            <input type="hidden" name="targetPieceId" value={nextPieceId.toString()} />
                            <input type="hidden" name="imageType" value={imageType} />
                            <button type="submit">
                                <IoIosArrowDown className="h-[20px] w-[20px] cursor-pointer rounded-sm bg-primary fill-stone-950 p-1 hover:bg-primary_dark hover:fill-stone-400" />
                            </button>
                        </form>
                    </div>

                    <div className="flex h-[40px] items-center justify-center">
                        <form action={handleImageDeleteAction} className="h-6 w-6">
                            <input type="hidden" name="pieceId" value={current_piece.id.toString()} />
                            <input type="hidden" name="imagePath" value={image.image_path} />
                            <input type="hidden" name="imageType" value={imageType} />
                            <button type="submit">
                                <IoIosTrash className="h-6 w-6 cursor-pointer rounded-sm bg-red-600 fill-stone-950 p-1 hover:bg-red-800 hover:fill-stone-400" />
                            </button>
                        </form>
                    </div>
                    <div className="flex h-[40px] items-center justify-center group-hover:text-stone-950">
                        {image.title || image.image_path}
                    </div>
                </div>,
            );
        }
        return elements;
    };

    return (
        <div className="flex h-fit w-full flex-col pt-2">
            <div className="rounded-lg">
                {extra_images.length > 0 && (
                    <div>
                        <h3 className="gradient-primary-main rounded-t-lg px-2 py-2 text-center text-2xl font-semibold">Extra Images</h3>
                        <div className="flex h-fit flex-col">{renderImages(extra_images, 'extra')}</div>
                    </div>
                )}
                {progress_images.length > 0 && (
                    <div className="">
                        <h3 className="gradient-primary-main rounded-t-lg px-2 py-2 text-center text-2xl font-semibold">Progress Images</h3>
                        <div className="flex h-fit flex-col">{renderImages(progress_images, 'progress')}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PieceOrderPanel;
