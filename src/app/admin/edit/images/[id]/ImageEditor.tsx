'use client';

import { useState } from 'react';
import { UploadButton } from '@/utils/uploadthing';

import { handleImageUpload } from '@/app/admin/edit/actions';

import InputTextbox from '@/components/inputs/InputTextbox';
import InputSelect from '@/components/inputs/InputSelect';

interface ImageEditorProps {
    pieceId: string;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ pieceId }) => {
    const [selectedOption, setSelectedOption] = useState('main');
    const [imageUrl, setImageUrl] = useState('');
    const [title, setTitle] = useState('');
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    const handleImageUploadComplete = (res: any) => {
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
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(e.target.value);
    };

    const handleSubmit = async () => {
        await handleImageUpload({
            piece_id: pieceId,
            image_path: imageUrl,
            title: title,
            piece_type: selectedOption,
            width: width.toString(),
            height: height.toString(),
        });

        // Redirect to the piece details page after submitting the changes
        window.location.href = `/edit/${pieceId}`;
    };

    return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-secondary_dark">
            <div className="flex w-2/5 flex-col items-center justify-center rounded-lg bg-secondary_light">
                <div
                    id="header"
                    className="flex w-full items-center justify-center rounded-t-lg bg-secondary p-4 text-center text-4xl font-bold text-primary"
                >
                    Edit Images
                </div>
                <div className="flex w-full flex-col items-center space-y-2 p-2">
                    <UploadButton
                        endpoint="imageUploader"
                        className={
                            '!flex-row items-center justify-center space-x-2 rounded-lg bg-secondary_dark p-2 ' +
                            'ut-button:bg-primary ut-button:text-secondary_dark ut-button:hover:bg-secondary_light ut-button:ut-readying:bg-primary ' +
                            'ut-allowed-content:min-w-[100px] ut-allowed-content:text-lg ut-allowed-content:leading-[18px] ut-allowed-content:text-primary ' +
                            'ut-button:after:bg-primary ut-button:ut-uploading:bg-secondary_light '
                        }
                        onClientUploadComplete={handleImageUploadComplete}
                        onUploadError={(error: Error) => {
                            alert(`ERROR! ${error.message}`);
                        }}
                    />
                    <InputSelect
                        name="image_type"
                        defaultValue={{ value: selectedOption, label: selectedOption }}
                        select_options={[
                            ['main', 'Modify Main Image'],
                            ['extra_images', 'Add Extra Image'],
                            ['progress_images', 'Add Progress Image'],
                        ]}
                        onChange={handleSelectChange}
                    />
                    <InputTextbox name="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <InputTextbox name="Image Path" value={imageUrl} />
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="rounded-md border-2 border-primary bg-primary_dark px-4 py-1 text-lg font-bold text-primary hover:border-primary_dark hover:bg-primary hover:text-primary_dark"
                    >
                        Submit Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;
