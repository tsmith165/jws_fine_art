// /app/edit/EditForm.tsx
'use client';

import React from 'react';
import Link from 'next/link';

import InputTextbox from '@/components/inputs/InputTextbox';
import InputSelect from '@/components/inputs/InputSelect';
import InputMultiSelect from '@/components/inputs/InputMultiSelect';
import InputTextArea from '@/components/inputs/InputTextArea';
import InputFile from '@/components/inputs/InputFile';
import { onSubmit } from './actions';

interface EditFormProps {
    current_piece: any;
}

const EditForm: React.FC<EditFormProps> = ({ current_piece }) => {
    return (
        <div className="flex h-fit w-full overflow-y-auto px-2 pb-2">
            <form action={onSubmit} className="flex flex-col space-y-2">
                <input type="hidden" name="piece_id" value={current_piece.id} />
                <input type="hidden" name="piece_title" value={current_piece.title} />
                <input type="hidden" name="image_path" value={current_piece.image_path} />
                <input type="hidden" name="extra_images" value={JSON.stringify(current_piece.extra_images)} />
                <input type="hidden" name="progress_images" value={JSON.stringify(current_piece.progress_images)} />
                <input type="hidden" name="extra_images_count" value={current_piece.extra_images?.length.toString()} />
                <input type="hidden" name="progress_images_count" value={current_piece.progress_images?.length.toString()} />

                {/* Row 1.) File Input */}
                <div className="flex h-fit w-full">
                    <InputFile
                        name="file"
                        defaultValue={current_piece.file_upload_type}
                        file_types={[
                            { value: 'cover', label: 'Cover Image' },
                            { value: 'extra', label: 'Extra Image' },
                            { value: 'progress', label: 'Progress Image' },
                        ]}
                    />
                </div>

                {/* Row 2.) Piece Type Select */}
                <div className="flex h-fit w-full">
                    <InputSelect
                        name="piece_type"
                        defaultValue={
                            current_piece.piece_type ? { value: current_piece.piece_type, label: current_piece.piece_type } : undefined
                        }
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
                        defaultValue={current_piece.theme_options}
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
                    />
                </div>

                {/* Row 3.) Piece Is Framed Select */}
                <div className="flex h-fit w-full">
                    <InputSelect
                        name="framed"
                        defaultValue={current_piece.framed ? { value: 'True', label: 'True' } : { value: 'False', label: 'False' }}
                        select_options={[
                            ['True', 'True'],
                            ['False', 'False'],
                        ]}
                    />
                </div>

                {/* Row 5.) Available / Sold Selects */}
                <div className="flex h-fit w-full flex-row space-x-2.5">
                    <div className="w-1/2">
                        <InputSelect
                            name="available"
                            defaultValue={current_piece.available ? { value: 'True', label: 'True' } : { value: 'False', label: 'False' }}
                            select_options={[
                                ['True', 'True'],
                                ['False', 'False'],
                            ]}
                        />
                    </div>
                    <div className="w-1/2">
                        <InputSelect
                            name="sold"
                            defaultValue={current_piece.sold ? { value: 'Sold', label: 'Sold' } : { value: 'Not Sold', label: 'Not Sold' }}
                            select_options={[
                                ['True', 'Sold'],
                                ['False', 'Not Sold'],
                            ]}
                        />
                    </div>
                </div>

                {/* Row 6.) Instagram URL Textbox / Price Textbox */}
                <div className="flex h-fit w-full flex-row space-x-2.5">
                    <div className="w-1/2">
                        <InputTextbox name="instagram" defaultValue={current_piece.instagram} />
                    </div>
                    <div className="w-1/2">
                        <InputTextbox name="price" defaultValue={current_piece.price.toString()} />
                    </div>
                </div>

                {/* Row 7.) Real Width / Height Text Box */}
                <div className="flex h-fit w-full flex-row space-x-2.5">
                    <div className="w-1/2">
                        <InputTextbox name="real_width" defaultValue={current_piece.real_width.toString()} />
                    </div>
                    <div className="w-1/2">
                        <InputTextbox name="real_height" defaultValue={current_piece.real_height.toString()} />
                    </div>
                </div>

                {/* Row 8.) Width / Height Text Box */}
                <div className="flex h-fit w-full max-w-full flex-row space-x-2.5">
                    <div className="w-1/2">
                        <InputTextbox name="width" defaultValue={current_piece.width.toString()} />
                    </div>
                    <div className="w-1/2">
                        <InputTextbox name="height" defaultValue={current_piece.height.toString()} />
                    </div>
                </div>

                {/* Row 9.) Comments Text Area */}
                <div className="flex h-fit w-full">
                    <InputTextArea name="comments" defaultValue={current_piece.comments} rows={2} />
                </div>

                {/* Row 10.) Description Text Area */}
                <div className="flex h-fit w-full">
                    <InputTextArea name="description" defaultValue={current_piece.description} rows={5} />
                </div>

                <div className="flex flex-row items-center space-x-2">
                    <button
                        type="submit"
                        className={
                            'rounded-md border-2 border-primary_dark bg-primary px-3 py-1 font-bold text-secondary_dark' +
                            'hover:border-primary hover:bg-secondary_dark hover:text-primary'
                        }
                    >
                        Submit Changes
                    </button>
                    <Link
                        href="/edit/new"
                        className={
                            'rounded-md border-2 border-primary_dark bg-primary px-3 py-1 font-bold text-secondary_dark' +
                            'hover:border-primary hover:bg-secondary_dark hover:text-primary'
                        }
                    >
                        Create New Piece
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default EditForm;
