import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { generateReactHelpers } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';
import { inspectUploadedImage } from './actions';

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

const ResizeUploader: React.FC<ResizeUploaderProps> = ({ handleUploadComplete, handleResetInputs, backToEditLink }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loadingState, setLoadingState] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { startUpload } = useUploadThing('imageUploader', {
        onClientUploadComplete: async (res) => {
            console.log('Upload complete:', res);
            setLoadingState('Loading Data');
            handleResetInputs();
            if (res?.length === 1) {
                const uploaded = res[0];
                try {
                    const dimensions = await inspectUploadedImage(uploaded.url);
                    handleUploadComplete(uploaded.name, uploaded.url, '', dimensions.width, dimensions.height, 0, 0);
                } catch (error) {
                    console.error('Error inspecting uploaded image:', error);
                    alert(error instanceof Error ? error.message : 'The uploaded image could not be inspected.');
                }
            } else {
                console.error('Unexpected response format');
            }
            setIsUploading(false);
            setUploadProgress(0);
            setLoadingState('');
        },
        onUploadError: (error: Error) => {
            alert(`ERROR! ${error.message}`);
            setIsUploading(false);
            setUploadProgress(0);
            setLoadingState('');
        },
        onUploadProgress: (progress: number) => {
            setUploadProgress(progress);
        },
    });

    const handleFileChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = e.target.files;
            if (selectedFiles && selectedFiles.length > 0) {
                const originalFile = selectedFiles[0];

                setIsUploading(true);
                handleResetInputs();

                setLoadingState('Uploading Original');
                await startUpload([originalFile]);
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
            <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
            />
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
                        {isUploading ? loadingState : 'Select and Upload File'}
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
