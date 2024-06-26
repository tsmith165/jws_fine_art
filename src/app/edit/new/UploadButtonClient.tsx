'use client';

import { useState } from 'react';
import { UploadButton } from '@/utils/uploadthing';
import InputTextbox from '@/components/inputs/InputTextbox';

interface NewPieceData {
    title: string;
    imagePath: string;
    width: number;
    height: number;
}

interface UploadButtonClientProps {
    onCreatePiece: (data: NewPieceData) => void;
}

const UploadButtonClient: React.FC<UploadButtonClientProps> = ({ onCreatePiece }) => {
    const [imageUrl, setImageUrl] = useState('');
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [title, setTitle] = useState('');

    const isFormValid = imageUrl !== '' && title !== '';

    const handleCreatePiece = () => {
        const data: NewPieceData = {
            title,
            imagePath: imageUrl,
            width,
            height,
        };
        onCreatePiece(data);
    };

    return (
        <div className="flex h-full w-full flex-col items-center justify-center space-y-2">
            <UploadButton
                endpoint="imageUploader"
                className={
                    '!flex-row items-center justify-center space-x-2 rounded-lg bg-secondary_dark p-2 ' +
                    'ut-button:bg-primary ut-button:text-secondary_dark ut-button:ut-readying:bg-primary ut-button:hover:bg-secondary_light ' +
                    'ut-allowed-content:text-primary ut-allowed-content:min-w-[100px] ut-allowed-content:text-lg ut-allowed-content:leading-[18px] ' +
                    'ut-button:ut-uploading:bg-secondary_light ut-button:after:bg-primary '
                }
                onClientUploadComplete={(res) => {
                    console.log('Upload complete:', res);
                    const imageUrl = res && res[0] ? res[0].url : '';
                    setImageUrl(imageUrl);

                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.onload = function () {
                        const width = img.naturalWidth;
                        const height = img.naturalHeight;
                        console.log('Image width:', width);
                        console.log('Image height:', height);
                        setWidth(width);
                        setHeight(height);

                        const header = document.getElementById('header')!;
                        header.innerHTML = '';
                        header.appendChild(img);
                    };
                }}
                onUploadError={(error: Error) => {
                    alert(`ERROR! ${error.message}`);
                }}
            />
            <InputTextbox name="Image Path" value={imageUrl} />
            <InputTextbox name="Px Width" value={width.toString()} />
            <InputTextbox name="Px Height" value={height.toString()} />
            <InputTextbox name="title" value={title} onChange={(e) => setTitle(e.target.value)} />
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
