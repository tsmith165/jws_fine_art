'use client';

import React from 'react';
import Link from 'next/link';

import InputTextbox from '@/components/inputs/InputTextbox';
import InputSelect from '@/components/inputs/InputSelect';
import InputMultiSelect from '@/components/inputs/InputMultiSelect';
import InputTextArea from '@/components/inputs/InputTextArea';

import { onSubmitEditForm } from '../actions';

interface EditFormProps {
    current_piece: any;
}

const EditForm: React.FC<EditFormProps> = ({ current_piece }) => {
    const [formData, setFormData] = React.useState({
        ...current_piece,
        piece_id: current_piece.id,
        piece_title: current_piece.title,
        image_path: current_piece.image_path,
        extra_images: current_piece.extra_images,
        progress_images: current_piece.progress_images,
        extra_images_count: current_piece.extra_images?.length.toString(),
        progress_images_count: current_piece.progress_images?.length.toString(),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData: typeof formData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleMultiSelectChange = (selectedOptions: { value: string; label: string }[]) => {
        const selectedValues = selectedOptions.map((option) => option.value).join(',');
        setFormData((prevData: typeof formData) => ({
            ...prevData,
            theme: selectedValues,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Form Data (Next Line):');
        console.log(formData);
        await onSubmitEditForm(formData);
    };

    const themeOptions =
        formData.theme
            ?.split(',')
            .filter((option: string) => option.trim() !== '') // Filter out blank options
            .map((option: string) => ({ value: option, label: option })) || [];

    return (
        <div className="flex h-fit w-full p-2">
            <form onSubmit={handleSubmit} className="flex w-full flex-col space-y-2">
                {/* Row 2.) Piece Type Select */}
                <div className="flex h-fit w-full">
                    <InputSelect
                        name="piece_type"
                        value={formData.piece_type}
                        onChange={handleChange}
                        select_options={[
                            ['Oil On Canvas', 'Oil On Canvas'],
                            ['Oil On Cradled Panel', 'Oil On Cradled Panel'],
                            ['Intaglio On Paper', 'Intaglio On Paper'],
                            ['Linocut On Paper', 'Linocut On Paper'],
                            ['Pastel On Paper', 'Pastel On Paper'],
                        ]}
                    />
                </div>

                {/* Row 3.) Theme Select */}
                <div className="flex h-fit w-full">
                    <InputMultiSelect
                        name="theme"
                        defaultValue={themeOptions}
                        select_options={[
                            ['Water', 'Water'],
                            ['Snow', 'Snow'],
                            ['Mountains', 'Mountains'],
                            ['Landscape', 'Landscape'],
                            ['City', 'City'],
                            ['Portrait', 'Portrait'],
                            ['Black and White', 'Black and White'],
                            ['Abstract', 'Abstract'],
                            ['None', 'None'],
                        ]}
                        onChange={handleMultiSelectChange}
                    />
                </div>

                {/* Row 3.) Piece Is Framed Select */}
                <div className="flex h-fit w-full">
                    <InputSelect
                        name="framed"
                        value={formData.framed ? 'True' : 'False'}
                        onChange={handleChange}
                        select_options={[
                            ['True', 'True'],
                            ['False', 'False'],
                        ]}
                    />
                </div>

                {/* Row 5.) Available / Sold Selects */}
                <div className="flex h-fit w-full flex-col space-y-2 md:flex-row md:space-x-2">
                    <div className="w-full md:w-1/2">
                        <InputSelect
                            name="available"
                            value={formData.available ? 'True' : 'False'}
                            onChange={handleChange}
                            select_options={[
                                ['True', 'True'],
                                ['False', 'False'],
                            ]}
                        />
                    </div>
                    <div className="w-full md:w-1/2">
                        <InputSelect
                            name="sold"
                            value={formData.sold ? 'True' : 'False'}
                            onChange={handleChange}
                            select_options={[
                                ['True', 'Sold'],
                                ['False', 'Not Sold'],
                            ]}
                        />
                    </div>
                </div>

                {/* Row 6.) Instagram URL Textbox / Price Textbox */}
                <div className="flex h-fit w-full flex-col space-y-2 md:flex-row md:space-x-2">
                    <div className="w-full md:w-1/2">
                        <InputTextbox name="instagram" value={formData.instagram} onChange={handleChange} />
                    </div>
                    <div className="w-full md:w-1/2">
                        <InputTextbox name="price" value={formData.price.toString()} onChange={handleChange} />
                    </div>
                </div>

                {/* Row 7.) Real Width / Height Text Box */}
                <div className="flex h-fit w-full flex-col space-y-2 md:flex-row md:space-x-2">
                    <div className="w-full md:w-1/2">
                        <InputTextbox name="real_width" value={formData.real_width.toString()} onChange={handleChange} />
                    </div>
                    <div className="w-full md:w-1/2">
                        <InputTextbox name="real_height" value={formData.real_height.toString()} onChange={handleChange} />
                    </div>
                </div>

                {/* Row 8.) Width / Height Text Box */}
                <div className="flex h-fit w-full flex-col space-y-2 md:flex-row md:space-x-2">
                    <div className="w-full md:w-1/2">
                        <InputTextbox name="width" value={formData.width.toString()} onChange={handleChange} />
                    </div>
                    <div className="w-full md:w-1/2">
                        <InputTextbox name="height" value={formData.height.toString()} onChange={handleChange} />
                    </div>
                </div>

                {/* Row 9.) Comments Text Area */}
                <div className="flex h-fit w-full">
                    <InputTextArea name="comments" value={formData.comments} rows={2} onChange={handleChange} />
                </div>

                {/* Row 10.) Description Text Area */}
                <div className="flex h-fit w-full">
                    <InputTextArea name="description" value={formData.description} rows={5} onChange={handleChange} />
                </div>

                <div className="flex flex-row items-center space-x-2">
                    <button
                        type="submit"
                        className={
                            'rounded-md border-2 border-primary_dark bg-primary px-3 py-1 font-bold text-secondary_dark ' +
                            'hover:border-primary hover:bg-secondary_dark hover:text-primary'
                        }
                    >
                        Submit Changes
                    </button>
                    <Link
                        href="/edit/new"
                        className={
                            'rounded-md border-2 border-primary_dark bg-primary px-3 py-1 font-bold text-secondary_dark ' +
                            'hover:border-primary hover:bg-secondary_dark hover:text-primary'
                        }
                    >
                        Create New Piece
                    </Link>
                    <Link
                        href={`/edit/images/${formData.o_id}`}
                        className={
                            'rounded-md border-2 border-primary_dark bg-primary px-3 py-1 font-bold text-secondary_dark ' +
                            'hover:border-primary hover:bg-secondary_dark hover:text-primary'
                        }
                    >
                        Edit Images
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default EditForm;
