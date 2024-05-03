import React from 'react';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import { handleImageReorder } from './actions';
import { Piece } from '@prisma/client';

interface PieceOrderPanelProps {
    current_piece: Piece;
}

interface Image {
    image_path: string;
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
        const direction = formData.get('direction')?.toString() || '';
        const imageType = formData.get('imageType')?.toString() || '';

        await handleImageReorder(pieceId, index, direction, imageType);
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
                                <span className="text-md overflow-ellipsis whitespace-nowrap text-primary">
                                    {image.image_path.split('.com')[1]}
                                </span>
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
                                <span className="text-md overflow-ellipsis whitespace-nowrap leading-6 text-primary">
                                    {image.image_path.split('.com')[1]}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PieceOrderPanel;
