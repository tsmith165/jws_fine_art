'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import { MdPageview } from 'react-icons/md';
import EditForm from './EditForm';
import PieceOrderPanel from './PieceOrderPanel';
import { handleTitleUpdate } from './actions';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

interface EditProps {
    pieceDataPromise: Promise<any>;
    current_id: number;
}

const Edit: React.FC<EditProps> = ({ pieceDataPromise, current_id }) => {
    const [pieceData, setPieceData] = useState<any>(null);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [titleInput, setTitleInput] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await pieceDataPromise;
                setPieceData(data);
                setTitleInput(data.title || '');
                console.log(`LOADING EDIT DETAILS PAGE - Piece ID: ${current_id}`);
            } catch (error) {
                console.error('Error fetching piece data:', error);
                setSubmitMessage({ type: 'error', text: 'Failed to load piece data.' });
            }
        };

        fetchData();
    }, [pieceDataPromise, current_id]);

    const handleTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitleInput(e.target.value);
    };

    const handleTitleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitMessage(null);
        try {
            const formData = new FormData();
            formData.append('pieceId', current_id.toString());
            formData.append('newTitle', titleInput);

            const result = await handleTitleUpdate(formData);
            if (result.success) {
                setSubmitMessage({ type: 'success', text: 'Title updated successfully!' });
                // Refresh the piece data to reflect the new title
                const updatedData = await pieceDataPromise;
                setPieceData(updatedData);
            } else {
                setSubmitMessage({ type: 'error', text: result.error || 'An error occurred while updating the title.' });
            }
        } catch (error) {
            setSubmitMessage({ type: 'error', text: 'An unexpected error occurred.' });
        }
    };

    if (!pieceData) {
        return <LoadingSpinner page="Edit Details" />;
    }

    const next_id = pieceData?.next_id ?? -1;
    const last_id = pieceData?.last_id ?? -1;

    return (
        <div className="flex h-full w-full flex-col bg-stone-800 md:flex-row">
            <div className="flex h-1/3 items-center justify-center rounded-lg p-8 md:h-[calc(100dvh-50px)] md:w-2/5 lg:w-1/2">
                <Image
                    src={pieceData.image_path}
                    alt={pieceData.title}
                    width={pieceData.width}
                    height={pieceData.height}
                    quality={100}
                    className="h-fit max-h-full w-auto rounded-lg object-contain"
                />
            </div>
            <div className="h-2/3 overflow-y-auto p-4 pt-0 md:h-full md:w-3/5 md:pl-0 md:pt-4 lg:w-1/2">
                <div className="mb-2 flex h-fit flex-row items-center space-x-2">
                    <div className="flex h-[48px] flex-col space-y-1">
                        <Link href={`/admin/edit?id=${next_id}`}>
                            <IoIosArrowUp className="h-[22px] w-8 cursor-pointer rounded-lg bg-stone-700 fill-stone-400 hover:bg-stone-600 hover:fill-stone-200" />
                        </Link>
                        <Link href={`/admin/edit?id=${last_id}`}>
                            <IoIosArrowDown className="h-[22px] w-8 cursor-pointer rounded-lg bg-stone-700 fill-stone-400 hover:bg-stone-600 hover:fill-stone-200" />
                        </Link>
                    </div>
                    <Link href={`/details/${current_id}`}>
                        <MdPageview className="h-[48px] w-[48px] cursor-pointer rounded-lg bg-stone-700 fill-stone-400 p-1 hover:bg-stone-600 hover:fill-stone-200" />
                    </Link>
                    <form onSubmit={handleTitleUpdateSubmit} className="flex w-full flex-grow flex-row rounded-lg bg-stone-700">
                        <input
                            type="text"
                            name="newTitle"
                            value={titleInput}
                            onChange={handleTitleInputChange}
                            className="m-0 flex w-full flex-grow rounded-lg border-none bg-stone-700 px-3 py-1 text-2xl font-bold text-stone-200 outline-none"
                        />
                        <button
                            type="submit"
                            className="ml-2 rounded-md bg-stone-600 px-3 py-1 font-bold text-stone-200 hover:bg-stone-500"
                        >
                            Save
                        </button>
                    </form>
                </div>
                {submitMessage && (
                    <div className={`mt-2 rounded-md p-2 ${submitMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                        {submitMessage.text}
                    </div>
                )}
                <EditForm current_piece={pieceData} />
                <PieceOrderPanel current_piece={pieceData} />
            </div>
        </div>
    );
};

export default Edit;
