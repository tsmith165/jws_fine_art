'use client';

import { ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
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

export default function ResizeUploader({ handleUploadComplete, handleResetInputs, backToEditLink }: ResizeUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const input = useRef<HTMLInputElement>(null);
    const { startUpload } = useUploadThing('imageUploader', {
        onClientUploadComplete: async (result) => {
            const uploaded = result?.[0];
            if (!uploaded) {
                setError('The upload did not return a file. Please try again.');
                setIsUploading(false);
                return;
            }
            try {
                const dimensions = await inspectUploadedImage(uploaded.url);
                handleUploadComplete(uploaded.name, uploaded.url, '', dimensions.width, dimensions.height, 0, 0);
            } catch (uploadError) {
                setError(uploadError instanceof Error ? uploadError.message : 'The image could not be inspected.');
            } finally {
                setIsUploading(false);
                setProgress(0);
            }
        },
        onUploadError: (uploadError) => {
            setError(uploadError.message);
            setIsUploading(false);
            setProgress(0);
        },
        onUploadProgress: setProgress,
    });

    const selectFile = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setError(null);
            setIsUploading(true);
            handleResetInputs();
            await startUpload([file]);
        },
        [handleResetInputs, startUpload],
    );

    return (
        <div className="owner-uploader">
            <input
                ref={input}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                onChange={selectFile}
                disabled={isUploading}
            />
            <Upload size={28} aria-hidden="true" />
            <div>
                <strong>{isUploading ? `Uploading original · ${progress}%` : 'Choose the highest-quality original'}</strong>
                <p>JPEG, PNG, WebP, HEIC, or HEIF. The original is stored without client compression or downscaling.</p>
            </div>
            <button className="owner-button is-primary" type="button" onClick={() => input.current?.click()} disabled={isUploading}>
                <Upload size={16} /> {isUploading ? 'Uploading…' : 'Select image'}
            </button>
            <Link className="owner-button" href={backToEditLink}>
                <ArrowLeft size={16} /> Back
            </Link>
            {isUploading ? <span className="owner-upload-progress" style={{ width: `${progress}%` }} /> : null}
            {error ? <p className="owner-upload-error">{error}</p> : null}
        </div>
    );
}
