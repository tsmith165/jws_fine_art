'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import InputTextbox from '@/components/inputs/InputTextbox';
import InputSelect from '@/components/inputs/InputSelect';
import InputMultiSelect from '@/components/inputs/InputMultiSelect';
import InputTextArea from '@/components/inputs/InputTextArea';

import { onSubmitEditForm } from './actions';
import { PiecesWithImages } from '@/db/schema';

const MAX_CHANGE_DISPLAY_LENGTH = 30;

interface EditFormProps {
    current_piece: PiecesWithImages;
}

interface SubmitFormData {
    piece_id: string;
    piece_title: string;
    description: string;
    piece_type: string;
    sold: boolean;
    price: string;
    instagram: string;
    width: string;
    height: string;
    real_width: string;
    real_height: string;
    theme: string;
    available: boolean;
    framed: boolean;
    comments: string;
    image_path: string;
}

const EditForm: React.FC<EditFormProps> = ({ current_piece }) => {
    const [initialFormData, setInitialFormData] = useState<SubmitFormData>({
        piece_id: current_piece.id.toString(),
        piece_title: current_piece.title,
        description: current_piece.description || '',
        piece_type: current_piece.piece_type || '',
        sold: current_piece.sold ?? false,
        price: current_piece.price?.toString() || '',
        instagram: current_piece.instagram || '',
        width: current_piece.width?.toString() || '',
        height: current_piece.height?.toString() || '',
        real_width: current_piece.real_width?.toString() || '',
        real_height: current_piece.real_height?.toString() || '',
        theme: current_piece.theme || '',
        available: current_piece.available ?? true,
        framed: current_piece.framed ?? false,
        comments: current_piece.comments || '',
        image_path: current_piece.image_path || '',
    });

    const [formData, setFormData] = useState<SubmitFormData>(initialFormData);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [changes, setChanges] = useState<{ field: string; oldValue: string; newValue: string }[]>([]);
    const [submittedChanges, setSubmittedChanges] = useState<{ field: string; oldValue: string; newValue: string }[]>([]);

    useEffect(() => {
        const newInitialFormData = {
            piece_id: current_piece.id.toString(),
            piece_title: current_piece.title,
            description: current_piece.description || '',
            piece_type: current_piece.piece_type || '',
            sold: current_piece.sold ?? false,
            price: current_piece.price?.toString() || '',
            instagram: current_piece.instagram || '',
            width: current_piece.width?.toString() || '',
            height: current_piece.height?.toString() || '',
            real_width: current_piece.real_width?.toString() || '',
            real_height: current_piece.real_height?.toString() || '',
            theme: current_piece.theme || '',
            available: current_piece.available ?? true,
            framed: current_piece.framed ?? false,
            comments: current_piece.comments || '',
            image_path: current_piece.image_path || '',
        };
        setInitialFormData(newInitialFormData);
        setFormData(newInitialFormData);
        setChanges([]);
    }, [current_piece]);

    const getChanges = (newData: SubmitFormData) => {
        const changesArray: { field: string; oldValue: string; newValue: string }[] = [];
        Object.keys(newData).forEach((key) => {
            const typedKey = key as keyof SubmitFormData;
            if (newData[typedKey] !== initialFormData[typedKey]) {
                changesArray.push({
                    field: key,
                    oldValue: String(initialFormData[typedKey]),
                    newValue: String(newData[typedKey]),
                });
            }
        });
        return changesArray;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => {
            const newData = { ...prevData, [name]: value };
            setChanges(getChanges(newData));
            return newData;
        });
    };

    const handleBooleanChange = (name: 'sold' | 'available' | 'framed') => (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value === 'True';
        setFormData((prevData) => {
            const newData = { ...prevData, [name]: value };
            setChanges(getChanges(newData));
            return newData;
        });
    };

    const handleMultiSelectChange = (selectedOptions: { value: string; label: string }[]) => {
        const selectedValues = selectedOptions.map((option) => option.value).join(',');
        setFormData((prevData) => {
            const newData = { ...prevData, theme: selectedValues };
            setChanges(getChanges(newData));
            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmittedChanges([]);
        setSubmitMessage(null);
        console.log('Form Data (Next Line):');
        console.log(formData);
        try {
            const result = await onSubmitEditForm(formData);
            if (result.success) {
                setSubmitMessage({ type: 'success', text: 'Changes submitted successfully!' });
                setSubmittedChanges(changes);
                setInitialFormData(formData); // Update initial data after successful submission
                setChanges([]); // Clear pending changes
            } else {
                setSubmitMessage({ type: 'error', text: result.error || 'An error occurred while submitting changes.' });
            }
        } catch (error) {
            setSubmitMessage({ type: 'error', text: 'An unexpected error occurred.' });
        }
    };

    const themeOptions =
        formData.theme
            ?.split(',')
            .filter((option: string) => option.trim() !== '')
            .map((option: string) => ({ value: option, label: option })) || [];

    const truncateChange = (value: string) => {
        return value.length > MAX_CHANGE_DISPLAY_LENGTH ? value.substring(0, MAX_CHANGE_DISPLAY_LENGTH) + '...' : value;
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-2">
                <InputMultiSelect
                    idName="theme"
                    name="Theme"
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
                            ['Oil On Panel', 'Oil On Panel'],
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
                        onChange={handleBooleanChange('sold')}
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
                        onChange={handleBooleanChange('framed')}
                        select_options={[
                            ['True', 'True'],
                            ['False', 'False'],
                        ]}
                    />
                    <InputSelect
                        idName="available"
                        name="Available"
                        value={formData.available ? 'True' : 'False'}
                        onChange={handleBooleanChange('available')}
                        select_options={[
                            ['True', 'True'],
                            ['False', 'False'],
                        ]}
                    />
                </div>
                <div className="flex h-fit w-full flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                    <InputTextbox idName="instagram" name="Instagram" value={formData.instagram} onChange={handleChange} />
                    <InputTextbox idName="price" name="Price" value={formData.price} onChange={handleChange} />
                </div>
                <div className="flex h-fit w-full flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                    <InputTextbox idName="real_width" name="Width (in)" value={formData.real_width} onChange={handleChange} />
                    <InputTextbox idName="real_height" name="Height (in)" value={formData.real_height} onChange={handleChange} />
                </div>
                <div className="flex h-fit w-full flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                    <InputTextbox idName="width" name="Width (px)" value={formData.width} onChange={handleChange} />
                    <InputTextbox idName="height" name="Height (px)" value={formData.height} onChange={handleChange} />
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
                        href={`/admin/edit/images/${formData.piece_id}`}
                        className="rounded-md bg-stone-600 px-4 py-2 text-sm font-bold text-stone-200 hover:bg-stone-500"
                    >
                        Edit Images
                    </Link>
                </div>

                {changes.length > 0 && (
                    <div className="mt-2 rounded-md bg-yellow-100 p-2 text-yellow-800">
                        <p className="font-bold">Pending Changes:</p>
                        <ul className="list-disc pl-5">
                            {changes.map((change, index) => (
                                <li key={index}>
                                    {change.field}: {truncateChange(change.oldValue)} → {truncateChange(change.newValue)}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {submitMessage && (
                    <div className={`mt-2 rounded-md p-2 ${submitMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                        <p>{submitMessage.text}</p>
                        {submitMessage.type === 'success' && submittedChanges.length > 0 && (
                            <div className="mt-2">
                                <p className="font-bold">Submitted Changes:</p>
                                <ul className="list-disc pl-5">
                                    {submittedChanges.map((change, index) => (
                                        <li key={index}>
                                            {change.field}: {truncateChange(change.oldValue)} → {truncateChange(change.newValue)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </form>
        </div>
    );
};

export default EditForm;
