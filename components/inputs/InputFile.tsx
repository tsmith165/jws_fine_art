import React from 'react';
import Select from 'react-select';
import { Tooltip } from 'react-tooltip';
import { generate_upload_url } from '@/lib/s3_api_calls';
import { onFileUpload } from '@/app/edit/actions';

interface InputFileProps {
    name: string;
    defaultValue?: { value: string; label: string };
    file_types: { value: string; label: string }[];
}

const InputFile: React.FC<InputFileProps> = ({ name, defaultValue, file_types }) => {
    const id = name.toLowerCase().replace(' ', '_');
    const formatted_name = name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected_file = event.target.files?.[0];
        if (selected_file) {
            const file_name = selected_file.name.replace(/\s+/g, '_');
            const file_extension = file_name.split('.').pop()?.toLowerCase() || '';
            const file_name_with_extension = `${file_name}.${file_extension}`;

            const s3_upload_url = await generate_upload_url(file_name_with_extension, defaultValue?.value || '');
            const formData = new FormData();
            formData.append('upload_url', s3_upload_url);
            formData.append('file', selected_file);

            const uploaded_image_path = await onFileUpload(formData);
            console.log('Uploaded Image Path:', uploaded_image_path);
            // You can update the state or perform any other actions with the uploaded_image_path
        }
    };

    return (
        <div className="m-0 flex w-full flex-row p-0">
            <div
                className="flex min-w-28 max-w-28 items-center justify-center rounded-l-md bg-secondary_dark px-2.5 py-1.5 font-semibold"
                data-tooltip-id={`tooltip-${id}`}
                data-tooltip-content={formatted_name}
            >
                <div className="text-primary">{formatted_name}</div>
            </div>
            <Tooltip id={`tooltip-${id}`} place="top" />

            <div className="flex flex-grow flex-row space-x-2 rounded-r-lg border-4 border-r-0 border-secondary_dark bg-secondary_dark">
                <Select
                    defaultValue={defaultValue}
                    isMulti={false}
                    id={`upload_type`}
                    name={`upload_type`}
                    className="m-0 w-full rounded-none border-none bg-primary text-sm text-secondary_dark"
                    classNamePrefix="select"
                    styles={{
                        control: (baseStyles, state) => ({
                            ...baseStyles,
                            borderColor: '',
                            backgroundColor: '#54786d',
                        }),
                    }}
                    options={file_types}
                />

                <button
                    className="inline-block w-fit grow cursor-pointer whitespace-nowrap rounded-md border-none bg-secondary_dark px-4 py-1 text-center font-lato text-sm font-bold text-primary no-underline hover:bg-secondary_light hover:text-secondary_dark"
                    onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(id)?.click();
                    }}
                >
                    Select File
                </button>

                <input id={id} type="file" className="hidden" onChange={handleFileChange} />

                <input
                    id={`${id}_path`}
                    type="text"
                    readOnly
                    className="m-0 !mr-1 w-full grow rounded-br-md rounded-tr-md border-none bg-primary px-3 py-1 font-lato text-sm text-secondary_dark placeholder-secondary_dark placeholder-opacity-100"
                    placeholder="Click Select File & choose image..."
                    defaultValue={''}
                />
            </div>
        </div>
    );
};

export default InputFile;
