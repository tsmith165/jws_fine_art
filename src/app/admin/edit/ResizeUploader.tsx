import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { generateReactHelpers } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface ResizeUploaderProps {
    handleUploadComplete: (
        fileName: string,
        originalImageUrl: string,
        smallImageUrl: string,
        originalWidth: number,
        originalHeight: number,
        smallWidth: number,
        smallHeight: number,
    ) => void;
    handleResetInputs: () => void;
    backToEditLink: string;
}

interface UploadResponse {
    name: string;
    url: string;
}

const ResizeUploader: React.FC<ResizeUploaderProps> = ({ handleUploadComplete, handleResetInputs, backToEditLink }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { startUpload } = useUploadThing('imageUploader', {
        onClientUploadComplete: async (res) => {
            console.log('Upload complete:', res);
            handleResetInputs();
            if (res && res.length === 2) {
                const fileName = res[0].name;
                const smallImage = res.find((file: UploadResponse) => file.name.startsWith('small-'));
                const largeImage = res.find((file: UploadResponse) => !file.name.startsWith('small-'));

                if (smallImage && largeImage) {
                    try {
                        const [imgDimensions, smallImgDimensions] = await Promise.all([
                            getImageDimensions(largeImage.url),
                            getImageDimensions(smallImage.url),
                        ]);

                        console.log(`Image ${largeImage.url} dimensions:`, imgDimensions);
                        console.log(`Small image ${smallImage.url} dimensions:`, smallImgDimensions);
                        handleUploadComplete(
                            fileName,
                            largeImage.url,
                            smallImage.url,
                            imgDimensions.width,
                            imgDimensions.height,
                            smallImgDimensions.width,
                            smallImgDimensions.height,
                        );
                    } catch (error) {
                        console.error('Error getting image dimensions:', error);
                    }
                } else {
                    console.error('Could not identify small and large images from the response');
                }
            } else {
                console.error('Unexpected response format');
            }
            setIsUploading(false);
            setUploadProgress(0);
        },
        onUploadError: (error: Error) => {
            alert(`ERROR! ${error.message}`);
            setIsUploading(false);
            setUploadProgress(0);
        },
        onUploadProgress: (progress: number) => {
            setUploadProgress(progress);
        },
    });

    const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = reject;
            img.src = url;
        });
    };

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

                setIsUploading(true);
                handleResetInputs();

                const originalResizedFile = await resizeImage(originalFile, 1920, 1920);
                const smallResizedFile = await resizeImage(originalFile, 450, 450);

                const smallFileWithPrefix = new File([smallResizedFile], `small-${smallResizedFile.name}`, { type: smallResizedFile.type });

                await startUpload([smallFileWithPrefix, originalResizedFile]);
            }
        },
        [handleResetInputs, startUpload],
    );

    const handleSelectFilesClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" disabled={isUploading} />
            <div className="flex space-x-2">
                <button
                    onClick={handleSelectFilesClick}
                    disabled={isUploading}
                    className={`group relative overflow-hidden rounded-md ${
                        isUploading ? 'bg-primary_dark' : 'bg-primary_dark hover:bg-primary'
                    } px-4 py-1 text-lg font-bold`}
                >
                    {isUploading && (
                        <div
                            className="absolute left-0 top-0 z-0 h-full bg-primary"
                            style={{ width: `${uploadProgress}%`, transition: 'width 0.3s ease-in-out' }}
                        />
                    )}
                    <span className={`relative z-10 text-stone-300 ${isUploading ? '' : 'group-hover:text-stone-950'}`}>
                        {isUploading ? 'Uploading...' : 'Select and Upload File'}
                    </span>
                </button>
                <Link href={backToEditLink} passHref>
                    <button className="rounded-md bg-primary_dark px-4 py-1 text-lg font-bold text-stone-300 hover:bg-primary hover:text-stone-950">
                        Back To Edit
                    </button>
                </Link>
            </div>
        </>
    );
};

export default ResizeUploader;
