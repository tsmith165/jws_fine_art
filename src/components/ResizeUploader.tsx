import React, { useState, useCallback, useRef } from 'react';

import { generateReactHelpers } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';
const { useUploadThing } = generateReactHelpers<OurFileRouter>();

import { createSmallerImage } from '@/utils/imageUtils';
import Sharp from 'sharp';

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

    const sharpToFile = async (sharpImage: Sharp.Sharp, fileName: string): Promise<File> => {
        const buffer = await sharpImage.toBuffer();
        return new File([buffer], fileName, { type: 'image/jpeg' });
    };

    const handleFileChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = e.target.files;
            if (selectedFiles && selectedFiles.length > 0) {
                const originalFile = selectedFiles[0];
                const originalFileArrayBuffer = await originalFile.arrayBuffer();
                const originalFileBuffer = Buffer.from(originalFileArrayBuffer);

                const originalFileSharp = await createSmallerImage(originalFileBuffer, 1920);
                const smallFileSharp = await createSmallerImage(originalFileBuffer, 450);

                const originalResizedFile = await sharpToFile(originalFileSharp, `original_${originalFile.name}`);
                const smallResizedFile = await sharpToFile(smallFileSharp, `small_${originalFile.name}`);

                setIsFileSelected(true);
                setFiles([originalResizedFile, smallResizedFile]);
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

    const handleUploadClick = async () => {
        if (files.length === 0) return;
        await startUpload(files);
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
                {files.length > 0 && (
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
