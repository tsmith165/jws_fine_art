'use client';

import { ArrowLeft, Check, FileImage, Upload } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import { generateReactHelpers } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';
import { readClientImageDimensions } from '@/lib/clientUploadedImage';
import { formatUploadBytes, validateUploadFile } from '@/lib/uploadedImageReference';

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
    const [phase, setPhase] = useState<'idle' | 'reading' | 'uploading' | 'finalizing' | 'ready'>('idle');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; width: number; height: number } | null>(null);
    const input = useRef<HTMLInputElement>(null);
    const dimensions = useRef<{ width: number; height: number } | null>(null);
    const isBusy = phase === 'reading' || phase === 'uploading' || phase === 'finalizing';

    function resetProgress() {
        setProgress(0);
        setIsDragging(false);
    }

    const { startUpload } = useUploadThing('imageUploader', {
        onClientUploadComplete: (result) => {
            setPhase('finalizing');
            const uploaded = result?.[0];
            const measured = dimensions.current;
            if (!uploaded || !measured) {
                setError('The upload did not return a file. Please try again.');
                setPhase('idle');
                resetProgress();
                return;
            }
            try {
                const imageUrl = uploaded.ufsUrl || uploaded.url;
                if (!imageUrl) throw new Error('The media provider did not return an image URL. Please try again.');
                handleUploadComplete(uploaded.name, imageUrl, '', measured.width, measured.height, 0, 0);
                setPhase('ready');
            } catch (uploadError) {
                setError(uploadError instanceof Error ? uploadError.message : 'The uploaded image could not be prepared.');
                setPhase('idle');
            }
            resetProgress();
        },
        onUploadError: (uploadError) => {
            const message = uploadError.message.toLowerCase().includes('size')
                ? 'The media provider rejected this file size. Choose an image under 32 MB.'
                : uploadError.message;
            setError(message);
            setPhase('idle');
            resetProgress();
        },
        onUploadProgress: setProgress,
    });

    const uploadFile = useCallback(
        async (file: File) => {
            setError(null);
            setSelectedFile(null);
            setPhase('reading');
            handleResetInputs();
            try {
                validateUploadFile(file);
                const measured = await readClientImageDimensions(file);
                dimensions.current = measured;
                setSelectedFile({ name: file.name, size: file.size, ...measured });
                setPhase('uploading');
                await startUpload([file]);
            } catch (uploadError) {
                setError(uploadError instanceof Error ? uploadError.message : 'The image could not be uploaded.');
                setPhase('idle');
                resetProgress();
            } finally {
                if (input.current) input.current.value = '';
            }
        },
        [handleResetInputs, startUpload],
    );

    const selectFile = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) void uploadFile(file);
        },
        [uploadFile],
    );

    const dropFile = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            setIsDragging(false);
            const file = event.dataTransfer.files?.[0];
            if (file && !isBusy) void uploadFile(file);
        },
        [isBusy, uploadFile],
    );

    const status =
        phase === 'reading'
            ? 'Checking the original…'
            : phase === 'uploading'
              ? `Uploading original · ${progress}%`
              : phase === 'finalizing'
                ? 'Preparing the review…'
                : phase === 'ready'
                  ? 'Original ready for review'
                  : 'Choose the highest-quality original';

    return (
        <div
            className={`owner-uploader${isDragging ? 'is-dragging' : ''}${phase === 'ready' ? 'is-ready' : ''}`}
            onDragEnter={(event) => {
                event.preventDefault();
                if (!isBusy) setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false);
            }}
            onDrop={dropFile}
        >
            <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={selectFile} disabled={isBusy} />
            <span className="owner-upload-icon" aria-hidden="true">
                {phase === 'ready' ? <Check size={24} /> : <FileImage size={24} />}
            </span>
            <div className="owner-upload-copy">
                <strong>{status}</strong>
                {selectedFile ? (
                    <p>
                        {selectedFile.name} · {formatUploadBytes(selectedFile.size)} · {selectedFile.width.toLocaleString()} ×{' '}
                        {selectedFile.height.toLocaleString()} px
                    </p>
                ) : (
                    <p>Drop a JPEG, PNG, or WebP here, or choose a file. Maximum 32 MB.</p>
                )}
                <small>Full-resolution original retained. Preview rendering does not alter the stored file.</small>
            </div>
            <button className="owner-button is-primary" type="button" onClick={() => input.current?.click()} disabled={isBusy}>
                <Upload size={16} /> {isBusy ? 'Working…' : phase === 'ready' ? 'Choose another' : 'Select image'}
            </button>
            <Link className="owner-button" href={backToEditLink}>
                <ArrowLeft size={16} /> Back
            </Link>
            {phase === 'uploading' || phase === 'finalizing' ? (
                <span
                    className={`owner-upload-progress${phase === 'finalizing' ? 'is-indeterminate' : ''}`}
                    style={phase === 'uploading' ? { width: `${progress}%` } : undefined}
                    role="progressbar"
                    aria-label={phase === 'uploading' ? 'Image upload progress' : 'Preparing uploaded image'}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={phase === 'uploading' ? progress : undefined}
                />
            ) : null}
            {error ? (
                <p className="owner-upload-error" role="alert">
                    {error}
                </p>
            ) : null}
        </div>
    );
}
