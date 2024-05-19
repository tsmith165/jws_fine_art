import React from 'react';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import { IoIosTrash } from 'react-icons/io';
import { handleImageReorder, handleImageDeleteAction } from '../actions';
import { Pieces } from '@/db/schema';

interface PieceOrderPanelProps {
    current_piece: Pieces;
}

interface Image {
    image_path: string;
    width: number;
    height: number;
}

const PieceOrderPanel: React.FC<PieceOrderPanelProps> = ({ current_piece }) => {
    const extra_images = [undefined, null, ''].includes(current_piece.extra_images)
        ? []
        : JSON.parse(current_piece.extra_images?.toString() || '[]');
    console.log(`Using Extra Images: "${extra_images}"`);

    const progress_images = [undefined, null, ''].includes(current_piece.progress_images)
        ? []
        : JSON.parse(current_piece.progress_images?.toString() || '[]');
    console.log(`Using Progress Images: "${progress_images}"`);

    async function handleImageReorderAction(formData: FormData) {
        'use server';
        const pieceId = Number(formData.get('pieceId'));
        const index = Number(formData.get('index'));
        const direction = formData.get('direction')?.toString();
        const imageType = formData.get('imageType')?.toString();

        if (!direction) {
            console.error(`No direction or image type found in form data. Cannot reorder image.`);
            return;
        }
        if (!imageType) {
            console.error(`No image type found in form data. Cannot reorder image.`);
            return;
        }

        await handleImageReorder(pieceId, index, direction, imageType);
    }

    async function handleImageDelete(formData: FormData) {
        'use server';
        const pieceId = Number(formData.get('pieceId'));
        const imageType = formData.get('imageType')?.toString();
        const imagePath = formData.get('imagePath')?.toString();

        if (!imageType) {
            console.error(`No image type found in form data. Cannot delete image.`);
            return;
        }
        if (!imagePath) {
            console.error(`No image path found in form data. Cannot delete image.`);
            return;
        }

        await handleImageDeleteAction(pieceId, imagePath, imageType);
    }

    return (
        <div className="flex h-fit w-full flex-col p-2 pt-0">
            <div className="rounded-lg bg-secondary_dark">
                {extra_images.length > 0 && (
                    <div>
                        <h3 className="rounded-t-lg bg-primary px-2 py-1 text-lg font-semibold text-secondary_dark">Extra Images</h3>
                        {extra_images.map((image: Image, index: number) => (
                            <div
                                key={index}
                                className="flex items-center space-x-2 rounded-b-lg px-2 py-1 hover:bg-primary_dark hover:text-secondary_light"
                            >
                                <form action={handleImageReorderAction}>
                                    <input type="hidden" name="pieceId" value={current_piece.id.toString()} />
                                    <input type="hidden" name="index" value={index.toString()} />
                                    <input type="hidden" name="direction" value="up" />
                                    <input type="hidden" name="imageType" value="extra_images" />
                                    <button
                                        type="submit"
                                        className="h-6 w-6 cursor-pointer rounded-sm bg-secondary_light p-1 hover:bg-primary"
                                    >
                                        <IoIosArrowUp />
                                    </button>
                                </form>
                                <form action={handleImageReorderAction}>
                                    <input type="hidden" name="pieceId" value={current_piece.id.toString()} />
                                    <input type="hidden" name="index" value={index.toString()} />
                                    <input type="hidden" name="direction" value="down" />
                                    <input type="hidden" name="imageType" value="extra_images" />
                                    <button
                                        type="submit"
                                        className="h-6 w-6 cursor-pointer rounded-sm bg-secondary_light p-1 hover:bg-primary"
                                    >
                                        <IoIosArrowDown />
                                    </button>
                                </form>
                                <form action={handleImageDelete}>
                                    <input type="hidden" name="pieceId" value={current_piece.id.toString()} />
                                    <input type="hidden" name="imagePath" value={image.image_path} />
                                    <input type="hidden" name="imageType" value="extra_images" />
                                    <button type="submit" className="h-6 w-6 cursor-pointer rounded-sm bg-red-500 p-1 hover:bg-red-600">
                                        <IoIosTrash />
                                    </button>
                                </form>
                                <div className="text-md overflow-hidden text-ellipsis whitespace-nowrap leading-6 text-primary">
                                    {image.image_path}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {progress_images.length > 0 && (
                    <div className="">
                        <h3 className="rounded-t-lg bg-primary px-2 py-1 text-lg font-semibold text-secondary_dark">Progress Images</h3>
                        {progress_images.map((image: Image, index: number) => (
                            <div
                                key={index}
                                className="flex max-w-fit flex-row items-center space-x-2 rounded-b-lg px-2 py-1 hover:bg-primary_dark hover:text-secondary_light"
                            >
                                <form action={handleImageReorderAction} className="flex">
                                    <input type="hidden" name="pieceId" value={current_piece.id.toString()} />
                                    <input type="hidden" name="index" value={index.toString()} />
                                    <input type="hidden" name="direction" value="up" />
                                    <input type="hidden" name="imageType" value="progress_images" />
                                    <button
                                        type="submit"
                                        className="h-6 w-6 cursor-pointer rounded-sm bg-secondary_light p-1 hover:bg-primary"
                                    >
                                        <IoIosArrowUp />
                                    </button>
                                </form>
                                <form action={handleImageReorderAction} className="flex">
                                    <input type="hidden" name="pieceId" value={current_piece.id.toString()} />
                                    <input type="hidden" name="index" value={index.toString()} />
                                    <input type="hidden" name="direction" value="down" />
                                    <input type="hidden" name="imageType" value="progress_images" />
                                    <button
                                        type="submit"
                                        className="h-6 w-6 cursor-pointer rounded-sm bg-secondary_light p-1 hover:bg-primary"
                                    >
                                        <IoIosArrowDown />
                                    </button>
                                </form>
                                <form action={handleImageDelete}>
                                    <input type="hidden" name="pieceId" value={current_piece.id.toString()} />
                                    <input type="hidden" name="imagePath" value={image.image_path} />
                                    <input type="hidden" name="imageType" value="progress_images" />
                                    <button type="submit" className="h-6 w-6 cursor-pointer rounded-sm bg-red-500 p-1 hover:bg-red-600">
                                        <IoIosTrash />
                                    </button>
                                </form>
                                <div className="text-md overflow-hidden text-ellipsis whitespace-nowrap leading-6 text-primary">
                                    {image.image_path}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PieceOrderPanel;
