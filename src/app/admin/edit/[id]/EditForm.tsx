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
            .filter((option: string) => option.trim() !== '')
            .map((option: string) => ({ value: option, label: option })) || [];

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-2">
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
                <div className="flex h-fit w-full flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                    <InputSelect
                        idName="piece_type"
                        name="Piece Type"
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
                    <InputSelect
                        idName="sold"
                        name="Sold"
                        value={formData.sold ? 'True' : 'False'}
                        onChange={handleChange}
                        select_options={[
                            ['True', 'Sold'],
                            ['False', 'Not Sold'],
                        ]}
                    />
                </div>
                <div className="flex h-fit w-full flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                    <InputSelect
                        idName="framed"
                        name="Framed"
                        value={formData.framed ? 'True' : 'False'}
                        onChange={handleChange}
                        select_options={[
                            ['True', 'True'],
                            ['False', 'False'],
                        ]}
                    />
                    <InputSelect
                        idName="available"
                        name="Available"
                        value={formData.available ? 'True' : 'False'}
                        onChange={handleChange}
                        select_options={[
                            ['True', 'True'],
                            ['False', 'False'],
                        ]}
                    />
                </div>
                <div className="flex h-fit w-full flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                    <InputTextbox idName="instagram" name="Instagram" value={formData.instagram} onChange={handleChange} />
                    <InputTextbox idName="price" name="Price" value={formData.price.toString()} onChange={handleChange} />
                </div>
                <div className="flex h-fit w-full flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                    <InputTextbox idName="real_width" name="Width (in)" value={formData.real_width.toString()} onChange={handleChange} />
                    <InputTextbox idName="real_height" name="Height (in)" value={formData.real_height.toString()} onChange={handleChange} />
                </div>
                <div className="flex h-fit w-full flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                    <InputTextbox idName="width" name="Width (px)" value={formData.width.toString()} onChange={handleChange} />
                    <InputTextbox idName="height" name="Height (px)" value={formData.height.toString()} onChange={handleChange} />
                </div>
                <InputTextArea idName="comments" name="Comments" value={formData.comments} rows={2} onChange={handleChange} />
                <InputTextArea idName="description" name="Description" value={formData.description} rows={5} onChange={handleChange} />
                <div className="flex flex-row items-center space-x-2">
                    <button type="submit" className="rounded-md bg-stone-600 px-4 py-2 text-sm font-bold text-stone-200 hover:bg-stone-500">
                        Submit Changes
                    </button>
                    <Link
                        href="/admin/edit/new"
                        className="rounded-md bg-stone-600 px-4 py-2 text-sm font-bold text-stone-200 hover:bg-stone-500"
                    >
                        Create New Piece
                    </Link>
                    <Link
                        href={`/admin/edit/images/${formData.id}`}
                        className="rounded-md bg-stone-600 px-4 py-2 text-sm font-bold text-stone-200 hover:bg-stone-500"
                    >
                        Edit Images
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default EditForm;
