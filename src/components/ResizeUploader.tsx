import React, { useState, useCallback, useRef } from 'react';

import { generateReactHelpers } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';
const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface ResizeUploaderProps {
    onFilesSelected: (originalFile: File, smallFile: File) => void;
    handleUploadComplete: (originalImageUrl: string, smallImageUrl: string) => void;
    handleResetInputs: () => void;
}

const ResizeUploader: React.FC<ResizeUploaderProps> = ({ onFilesSelected, handleUploadComplete, handleResetInputs }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [isFileSelected, setIsFileSelected] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { startUpload } = useUploadThing('imageUploader', {
        onClientUploadComplete: (res) => {
            console.log('Upload complete:', res);
            const originalImageUrl = res && res[0] ? (res[0] as any).url : '';
            const smallImageUrl = res && res[1] ? (res[1] as any).url : '';
            handleUploadComplete(originalImageUrl, smallImageUrl);
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

    const handleFileChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = e.target.files;
            if (selectedFiles && selectedFiles.length > 0) {
                let originalFile = selectedFiles[0];
                originalFile = await createSmallerImage(originalFile, 1920);
                const smallFile = await createSmallerImage(originalFile, 450);
                setIsFileSelected(true);
                setFiles([originalFile, smallFile]);
                onFilesSelected(originalFile, smallFile);
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

    const handleUploadClick = async () => {
        if (files.length === 0) return;
        await startUpload(files);
    };

    function getUpdatedDimensions(width: number, height: number, maxSize: number) {
        let updatedWidth = width;
        let updatedHeight = height;
        if (width > height) {
            if (width > maxSize) {
                updatedHeight *= maxSize / width;
                updatedWidth = maxSize;
            }
        } else {
            if (height > maxSize) {
                updatedWidth *= maxSize / height;
                updatedHeight = maxSize;
            }
        }
        return { updatedWidth: updatedWidth, updatedHeight: updatedHeight };
    }

    // Function to create a smaller version of the image
    async function createSmallerImage(file: File, maxSize: number): Promise<File> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const img = document.createElement('img');
                img.onload = async () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    const { updatedWidth, updatedHeight } = getUpdatedDimensions(img.width, img.height, maxSize);

                    canvas.width = updatedWidth;
                    canvas.height = updatedHeight;
                    ctx?.drawImage(img, 0, 0, updatedWidth, updatedHeight);

                    canvas.toBlob((blob) => {
                        const smallFile = new File([blob!], `small-${file.name}`, {
                            type: file.type,
                            lastModified: Date.now(),
                        });
                        resolve(smallFile);
                    }, file.type);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    }

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
                {files.length > 0 && (
                    <button
                        onClick={handleUploadClick}
                        className={`group relative overflow-hidden rounded-md ${isUploading ? 'bg-secondary_dark' : 'bg-primary_dark'} px-4 py-1 text-lg font-bold shadow-xl ring-2 ring-primary_dark hover:bg-secondary_dark`}
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
