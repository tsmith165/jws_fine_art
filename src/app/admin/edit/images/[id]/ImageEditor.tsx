'use client';

import { useState, useEffect, useCallback } from 'react';
import { storeUploadedImageDetails } from '@/app/admin/edit/actions';
import ResizeUploader from '@/app/admin/edit/ResizeUploader';
import InputTextbox from '@/components/inputs/InputTextbox';
import InputSelect from '@/components/inputs/InputSelect';

interface ImageEditorProps {
    pieceId: string;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ pieceId }) => {
    const [imageUrl, setImageUrl] = useState('Not yet uploaded');
    const [title, setTitle] = useState('Not yet uploaded');
    const [selectedOption, setSelectedOption] = useState('extra');
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [smallImageUrl, setSmallImageUrl] = useState('Not yet uploaded');
    const [smallWidth, setSmallWidth] = useState(0);
    const [smallHeight, setSmallHeight] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        console.log('ImageEditor mounted or pieceId changed:', pieceId);
        resetInputs();
    }, [pieceId]);

    const resetInputs = useCallback(() => {
        console.log('Resetting inputs');
        setImageUrl('Not yet uploaded');
        setTitle('Not yet uploaded');
        setWidth(0);
        setHeight(0);
        setSmallImageUrl('Not yet uploaded');
        setSmallWidth(0);
        setSmallHeight(0);
        setIsSubmitted(false);
        setStatusMessage(null);
    }, []);

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
            console.log('handleUploadComplete called with:', {
                fileName,
                originalImageUrl,
                smallImageUrl,
                originalWidth,
                originalHeight,
                smallWidth,
                smallHeight,
            });

            setTitle(fileName.split('.')[0] || 'Not yet uploaded');
            setImageUrl(originalImageUrl);
            setSmallImageUrl(smallImageUrl);
            setWidth(originalWidth);
            setHeight(originalHeight);
            setSmallWidth(smallWidth);
            setSmallHeight(smallHeight);
            setIsSubmitted(false);
            setStatusMessage(null);

            console.log('State after update:', {
                title: fileName.split('.')[0] || 'Not yet uploaded',
                imageUrl: originalImageUrl,
                smallImageUrl,
                width: originalWidth,
                height: originalHeight,
                smallWidth,
                smallHeight,
            });
        },
        [],
    );

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(e.target.value);
    };

    const handleSubmit = async () => {
        try {
            await storeUploadedImageDetails({
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
            setIsSubmitted(true);
            setStatusMessage({ type: 'success', message: 'Changes submitted successfully. You can upload another image.' });
        } catch (error) {
            console.error('Error submitting changes:', error);
            setStatusMessage({ type: 'error', message: 'Failed to submit changes. Please try again.' });
        }
    };

    const isFormValid = imageUrl !== 'Not yet uploaded' && !isSubmitted;

    console.log('Current state:', { imageUrl, title, width, height, smallImageUrl, smallWidth, smallHeight });

    return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-stone-900">
            <div className="flex w-4/5 flex-col items-center justify-center rounded-lg bg-stone-900">
                <div
                    id="header"
                    className="w-full rounded-t-lg bg-gradient-to-r from-secondary via-secondary_light to-secondary bg-clip-text text-center text-4xl font-bold text-transparent"
                >
                    Edit Images
                </div>
                <div className="flex w-full flex-col items-center space-y-2 p-2">
                    <ResizeUploader handleUploadComplete={handleUploadComplete} handleResetInputs={resetInputs} />
                    <InputSelect
                        idName="image_type"
                        key="image_type"
                        name="Type"
                        defaultValue={{ value: selectedOption, label: selectedOption }}
                        select_options={[
                            ['main', 'Modify Main Image'],
                            ['extra', 'Add Extra Image'],
                            ['progress', 'Add Progress Image'],
                        ]}
                        onChange={handleSelectChange}
                    />
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
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isFormValid}
                        className={
                            'relative rounded-md px-4 py-1 text-lg font-bold ' +
                            (isFormValid
                                ? ' bg-secondary_dark text-stone-300 hover:bg-secondary'
                                : 'cursor-not-allowed bg-stone-300 text-secondary_dark')
                        }
                    >
                        Submit Changes
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
};

export default ImageEditor;
