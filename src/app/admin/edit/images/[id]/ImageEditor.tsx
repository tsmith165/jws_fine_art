'use client';

import { useState } from 'react';

import { handleImageUpload } from '@/app/admin/edit/actions';

import ResizeUploader from '@/components/ResizeUploader';
import InputTextbox from '@/components/inputs/InputTextbox';
import InputSelect from '@/components/inputs/InputSelect';

interface ImageEditorProps {
    pieceId: string;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ pieceId }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [imageUrl, setImageUrl] = useState('Not yet uploaded');
    const [title, setTitle] = useState('Not yet uploaded');
    const [selectedOption, setSelectedOption] = useState('main');
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [smallImageUrl, setSmallImageUrl] = useState('Not yet uploaded');
    const [smallWidth, setSmallWidth] = useState(0);
    const [smallHeight, setSmallHeight] = useState(0);

    const handleFilesSelected = (originalFile: File, smallFile: File) => {
        setFiles([originalFile, smallFile]);
        setTitle(originalFile.name.split('.')[0]);

        const img = document.createElement('img');
        img.src = URL.createObjectURL(originalFile);
        img.onload = function () {
            const width = img.naturalWidth;
            const height = img.naturalHeight;
            console.log('Original Image width:', width, 'height:', height);
            setWidth(width);
            setHeight(height);
        };

        const smallImg = document.createElement('img');
        smallImg.src = URL.createObjectURL(smallFile);
        smallImg.onload = function () {
            const smallWidth = smallImg.naturalWidth;
            const smallHeight = smallImg.naturalHeight;
            console.log('Small Image width:', smallWidth, 'height:', smallHeight);
            setSmallWidth(smallWidth);
            setSmallHeight(smallHeight);
        };
    };

    const handleUploadComplete = (originalImageUrl: string, smallImageUrl: string) => {
        setImageUrl(originalImageUrl);
        setSmallImageUrl(smallImageUrl);
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(e.target.value);
    };

    const handleSubmit = async () => {
        await handleImageUpload({
            piece_id: pieceId,
            image_path: imageUrl,
            title: title,
            piece_type: selectedOption,
            width: width.toString(),
            height: height.toString(),
            small_image_path: smallImageUrl,
            small_width: smallWidth.toString(),
            small_height: smallHeight.toString(),
        });
        // Redirect to the piece details page after submitting the changes
        window.location.href = `/admin/edit/${pieceId}`;
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

    const isFormValid = files.length > 0;

    return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-secondary_dark">
            <div className="flex w-2/5 flex-col items-center justify-center rounded-lg bg-secondary_light">
                <div
                    id="header"
                    className="flex w-full items-center justify-center rounded-t-lg bg-secondary p-4 text-center text-4xl font-bold text-primary"
                >
                    Edit Images
                </div>
                <div className="flex w-full flex-col items-center space-y-2 p-2">
                    <ResizeUploader
                        onFilesSelected={handleFilesSelected}
                        handleUploadComplete={handleUploadComplete}
                        handleResetInputs={handleResetInputs}
                    />
                    <InputSelect
                        key="image_type"
                        name="image_type"
                        defaultValue={{ value: selectedOption, label: selectedOption }}
                        select_options={[
                            ['main', 'Modify Main Image'],
                            ['extra', 'Add Extra Image'],
                            ['progress', 'Add Progress Image'],
                        ]}
                        onChange={handleSelectChange}
                    />
                    <InputTextbox idName="title" name="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <InputTextbox idName="image_path" name="Image Path" value={imageUrl} />
                    <InputTextbox idName="px_width" name="Width (px)" value={width.toString()} />
                    <InputTextbox idName="px_height" name="Height (px)" value={height.toString()} />
                    <InputTextbox idName="small_image_path" name="Small Path" value={smallImageUrl} />
                    <InputTextbox idName="small_px_width" name="Sm Width" value={smallWidth.toString()} />
                    <InputTextbox idName="small_px_height" name="Sm Height" value={smallHeight.toString()} />
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isFormValid}
                        className={
                            'rounded-md border-2 px-4 py-1 text-lg font-bold ' +
                            (isFormValid
                                ? 'border-primary bg-primary_dark text-primary hover:border-primary_dark hover:bg-primary hover:text-primary_dark'
                                : 'cursor-not-allowed border-gray-400 bg-gray-300 text-gray-500')
                        }
                    >
                        Submit Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;
