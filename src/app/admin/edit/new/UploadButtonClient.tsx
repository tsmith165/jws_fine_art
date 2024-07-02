'use client';

import { useState, useCallback, useRef } from 'react';

import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
  
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

interface UploadButtonClientProps {
  onCreatePiece: (data: NewPieceData) => void;
}

const UploadButtonClient: React.FC<UploadButtonClientProps> = ({ onCreatePiece }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [title, setTitle] = useState('');
  const [smallImageUrl, setSmallImageUrl] = useState('');
  const [smallWidth, setSmallWidth] = useState(0);
  const [smallHeight, setSmallHeight] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      console.log('Upload complete:', res);
      const originalImageUrl = res && res[0] ? (res[0] as any).uploadedFileUrl : '';
      const smallImageUrl = res && res[1] ? (res[1] as any).uploadedFileUrl : '';
      console.log('Original Image Uploaded URL:', originalImageUrl);
      console.log('Small Image UploadedURL:', smallImageUrl);
      setImageUrl(originalImageUrl);
      setSmallImageUrl(smallImageUrl);
    },
    onUploadError: (error: Error) => {
      alert(`ERROR! ${error.message}`);
    },
    onUploadProgress: (progress: number) => {
      setUploadProgress(progress);
    },
  });

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const originalFile = selectedFiles[0];
      const smallFile = await createSmallerImage(originalFile);
      setFiles([originalFile, smallFile]);

      const img = document.createElement('img');
      img.src = URL.createObjectURL(originalFile);
      img.onload = function () {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        console.log('Original Image width:', width, 'height:', height);
        console.log('Original Image URL:', img.src);
        setWidth(width);
        setHeight(height);
      };

      const smallImg = document.createElement('img');
      smallImg.src = URL.createObjectURL(smallFile);
      smallImg.onload = function () {
        const smallWidth = smallImg.naturalWidth;
        const smallHeight = smallImg.naturalHeight;
        console.log('Small Image width:', smallWidth, 'height:', smallHeight);
        console.log('Small Image URL:', smallImg.src);
        setSmallWidth(smallWidth);
        setSmallHeight(smallHeight);
      };
    }
  }, []);

  const handleSelectFilesClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const isFormValid = imageUrl !== '' && title !== '';

  const handleCreatePiece = () => {
    const data: NewPieceData = {
      title,
      imagePath: imageUrl,
      width,
      height,
      smallImagePath: smallImageUrl,
      smallWidth,
      smallHeight,
    };
    onCreatePiece(data);
  };

  // Function to create a smaller version of the image
  async function createSmallerImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const img = document.createElement('img');
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          const maxSize = 450;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            const smallFile = new File([blob!], `small_${file.name}`, {
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
    <div className="flex h-full w-full flex-col items-center justify-center space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="flex space-x-2">
        <button
          onClick={handleSelectFilesClick}
          className="h-full rounded-md px-4 py-1 text-lg font-bold bg-primary_dark text-primary hover:bg-primary hover:text-primary_dark"
        >
          Select Files
        </button>
        {files.length > 0 && (
          <button
            onClick={() => startUpload(files)}
            className="relative overflow-hidden rounded-md px-4 py-1 text-lg font-bold bg-primary_dark text-primary hover:bg-primary hover:text-primary_dark"
          >
            Upload {files.length} files
            {uploadProgress > 0 && (
              <div
                className="absolute top-0 left-0 h-full bg-primary"
                style={{ width: `${uploadProgress}%` }}
              />
            )}
          </button>
        )}
      </div>
      <InputTextbox idName="image_path" name="Image Path" value={imageUrl} />
      <InputTextbox idName="px_width" name="Width (px)" value={width.toString()} />
      <InputTextbox idName="px_height" name="Height (px)" value={height.toString()} />
      <InputTextbox idName="small_image_path" name="Small Path" value={smallImageUrl} />
      <InputTextbox idName="small_px_width" name="Sm Width" value={smallWidth.toString()} />
      <InputTextbox idName="small_px_height" name="Sm Height" value={smallHeight.toString()} />
      <InputTextbox idName="title" name="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      {imageUrl === '' || imageUrl === null ? null : width < 800 && height < 800 ? (
        <div className="text-red-700">Warning: Image width and height are less than 800px.</div>
      ) : width < 800 ? (
        <div className="text-red-700">Warning: Image width is less than 800px.</div>
      ) : height < 800 ? (
        <div className="text-red-700">Warning: Image height is less than 800px.</div>
      ) : null}
      <button
        type="submit"
        disabled={!isFormValid}
        onClick={handleCreatePiece}
        className={
          'rounded-md border-2 px-4 py-1 text-lg font-bold ' +
          (isFormValid
            ? 'border-primary bg-primary_dark text-primary hover:border-primary_dark hover:bg-primary hover:text-primary_dark'
            : 'cursor-not-allowed border-gray-400 bg-gray-300 text-gray-500')
        }
      >
        Create Piece
      </button>
    </div>
  );
};

export default UploadButtonClient;