import React, { useState, useCallback, useRef } from 'react';
import { generateReactHelpers } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface ResizeUploaderProps {
    onFilesSelected: (originalFile: File, smallFile: File) => void;
    handleUploadComplete: (
        originalImageUrl: string,
        smallImageUrl: string,
        originalWidth: number,
        originalHeight: number,
        smallWidth: number,
        smallHeight: number,
    ) => void;
    handleResetInputs: () => void;
}

interface UploadResponse {
    name: string;
    url: string;
}

const ResizeUploader: React.FC<ResizeUploaderProps> = ({ onFilesSelected, handleUploadComplete, handleResetInputs }) => {
    const [largeFile, setLargeFile] = useState<File | null>(null);
    const [smallFile, setSmallFile] = useState<File | null>(null);
    const [isFileSelected, setIsFileSelected] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { startUpload } = useUploadThing('imageUploader', {
        onClientUploadComplete: (res) => {
            console.log('Upload complete:', res);
            if (res && res.length === 2) {
                const smallImage = res.find((file: UploadResponse) => file.name.startsWith('small-'));
                const largeImage = res.find((file: UploadResponse) => !file.name.startsWith('small-'));

                if (smallImage && largeImage) {
                    const img = new Image();
                    img.onload = function () {
                        const smallImg = new Image();
                        smallImg.onload = function () {
                            handleUploadComplete(
                                largeImage.url,
                                smallImage.url,
                                img.naturalWidth,
                                img.naturalHeight,
                                smallImg.naturalWidth,
                                smallImg.naturalHeight,
                            );
                        };
                        smallImg.src = smallImage.url;
                    };
                    img.src = largeImage.url;
                } else {
                    console.error('Could not identify small and large images from the response');
                }
            } else {
                console.error('Unexpected response format');
            }
            setIsUploading(false);
        },
        onUploadError: (error: Error) => {
            alert(`ERROR! ${error.message}`);
        },
        onUploadProgress: (progress: number) => {
            setUploadProgress(progress);
            if (progress < 100 && !isUploading && isFileSelected) {
                setIsUploading(true);
            }
        },
    });

    const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<File> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event: ProgressEvent<FileReader>) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    const width = img.width;
                    const height = img.height;

                    if (width <= maxWidth && height <= maxHeight) {
                        resolve(file);
                    } else {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        const newWidth = width * ratio;
                        const newHeight = height * ratio;

                        canvas.width = newWidth;
                        canvas.height = newHeight;

                        ctx?.drawImage(img, 0, 0, newWidth, newHeight);

                        canvas.toBlob((blob) => {
                            if (blob) {
                                const resizedFile = new File([blob], file.name, { type: file.type });
                                resolve(resizedFile);
                            }
                        }, file.type);
                    }
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = e.target.files;
            if (selectedFiles && selectedFiles.length > 0) {
                const originalFile = selectedFiles[0];

                const originalResizedFile = await resizeImage(originalFile, 1920, 1920);
                const smallResizedFile = await resizeImage(originalFile, 450, 450);

                setIsFileSelected(true);
                setLargeFile(originalResizedFile);
                setSmallFile(smallResizedFile);
                onFilesSelected(originalResizedFile, smallResizedFile);
            }
        },
        [onFilesSelected],
    );

    const handleSelectFilesClick = () => {
        handleResetInputs();
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const getFileSizeMB = (file: File) => {
        return (file.size / (1024 * 1024)).toFixed(2);
    };

    const handleUploadClick = async () => {
        if (!largeFile || !smallFile) return;

        console.log(`Uploading large file with size: ${getFileSizeMB(largeFile)} MB`);
        console.log(`Uploading small file with size: ${getFileSizeMB(smallFile)} MB`);

        // Create a new File object for the small file with the "small-" prefix
        const smallFileWithPrefix = new File([smallFile], `small-${smallFile.name}`, { type: smallFile.type });

        await startUpload([smallFileWithPrefix, largeFile]);
    };

    return (
        <>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <div className="flex space-x-2">
                <button
                    onClick={handleSelectFilesClick}
                    className="h-full rounded-md bg-primary_dark px-4 py-1 text-lg font-bold text-stone-300 hover:bg-secondary_dark hover:text-primary"
                >
                    Select File
                </button>
                {largeFile && smallFile && (
                    <button
                        onClick={handleUploadClick}
                        className={`group relative overflow-hidden rounded-md ${
                            isUploading ? 'bg-secondary_dark' : 'bg-primary_dark'
                        } px-4 py-1 text-lg font-bold shadow-xl ring-2 ring-primary_dark hover:bg-secondary_dark`}
                    >
                        {isUploading && (
                            <div className="absolute left-0 top-0 z-0 h-full bg-primary" style={{ width: `${uploadProgress}%` }} />
                        )}
                        <span className={`relative z-10 text-stone-300 ${isUploading ? '' : 'group-hover:text-primary'}`}>
                            {isUploading ? 'Uploading...' : 'Upload'}
                        </span>
                    </button>
                )}
            </div>
        </>
    );
};

export default ResizeUploader;
