'use client';

import { useState } from 'react';
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
    const [files, setFiles] = useState<File[]>([]);
    const [imageUrl, setImageUrl] = useState('Not yet uploaded');
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [title, setTitle] = useState('Not yet uploaded');
    const [smallImageUrl, setSmallImageUrl] = useState('Not yet uploaded');
    const [smallWidth, setSmallWidth] = useState(0);
    const [smallHeight, setSmallHeight] = useState(0);

    const handleFilesSelected = (originalFile: File, smallFile: File) => {
        setFiles([originalFile, smallFile]);
        setTitle(originalFile.name.split('.')[0]);
    };

    const handleUploadComplete = (
        originalImageUrl: string,
        smallImageUrl: string,
        originalWidth: number,
        originalHeight: number,
        smallWidth: number,
        smallHeight: number,
    ) => {
        setImageUrl(originalImageUrl);
        setSmallImageUrl(smallImageUrl);
        setWidth(originalWidth);
        setHeight(originalHeight);
        setSmallWidth(smallWidth);
        setSmallHeight(smallHeight);
    };

    const handleCreatePiece = async () => {
        const data: NewPieceData = {
            title,
            imagePath: imageUrl,
            width,
            height,
            smallImagePath: smallImageUrl,
            smallWidth,
            smallHeight,
        };
        createNewPiece(data);
    };

    const handleResetInputs = () => {
        setFiles([]);
        setImageUrl('Not yet uploaded');
        setWidth(0);
        setHeight(0);
        setTitle('Not yet uploaded');
        setSmallImageUrl('Not yet uploaded');
        setSmallWidth(0);
        setSmallHeight(0);
    };

    const isFormValid = files.length > 0 && title !== '';

    return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-secondary_dark">
            <div className="flex w-4/5 flex-col items-center justify-center rounded-lg bg-secondary_light">
                <div id="header" className="w-full rounded-t-lg bg-secondary p-4 text-center text-4xl font-bold text-primary">
                    Create New Piece
                </div>
                <div className="flex w-full flex-col items-center space-y-2 p-2">
                    <ResizeUploader
                        onFilesSelected={handleFilesSelected}
                        handleUploadComplete={handleUploadComplete}
                        handleResetInputs={handleResetInputs}
                    />
                    <InputTextbox idName="image_path" name="Image Path" value={imageUrl} />
                    <InputTextbox idName="px_width" name="Width (px)" value={width.toString()} />
                    <InputTextbox idName="px_height" name="Height (px)" value={height.toString()} />
                    <InputTextbox idName="small_image_path" name="Small Path" value={smallImageUrl} />
                    <InputTextbox idName="small_px_width" name="Sm Width" value={smallWidth.toString()} />
                    <InputTextbox idName="small_px_height" name="Sm Height" value={smallHeight.toString()} />
                    <InputTextbox idName="title" name="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    {imageUrl !== 'Not yet uploaded' && (width < 800 || height < 800) && (
                        <div className="text-red-700">
                            Warning: Image dimensions are less than 800px. Width: {width}px, Height: {height}px
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={!isFormValid}
                        onClick={handleCreatePiece}
                        className={`relative rounded-md border-2 px-4 py-1 text-lg font-bold ${
                            isFormValid
                                ? 'border-primary bg-primary_dark text-primary hover:border-primary_dark hover:bg-primary hover:text-primary_dark'
                                : 'cursor-not-allowed border-gray-400 bg-gray-300 text-gray-500'
                        }`}
                    >
                        <span className="relative z-10">Create Piece</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
