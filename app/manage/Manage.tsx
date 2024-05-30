// File: /app/manage/Manage.tsx

import Link from 'next/link';
import Image from 'next/image';
import { IoIosArrowForward } from 'react-icons/io';
import { MdDeleteForever, MdRestore } from 'react-icons/md';
import { FaEdit } from 'react-icons/fa';
import { changeOrder, changePriority, setInactive, setActive } from './actions';
import { Pieces } from '@/db/schema';
import { revalidatePath } from 'next/cache';

interface ManageProps {
    pieces: Pieces[];
    deletedPieces: Pieces[];
    prioritized_pieces: Pieces[];
    activeTab: string;
}

export function Manage({ pieces, deletedPieces, prioritized_pieces, activeTab }: ManageProps) {
    async function handleOrderChange(formData: FormData) {
        'use server';
        const currId = Number(formData.get('currId'));
        const currOrderId = Number(formData.get('currOrderId'));
        const nextId = Number(formData.get('nextId'));
        const nextOrderId = Number(formData.get('nextOrderId'));

        if (nextId !== null && nextOrderId !== null) {
            console.log(`Handle Order Change: currId: ${currId} (${currOrderId}) | nextId: ${nextId} (${nextOrderId})`);
            await changeOrder([currId, currOrderId], [nextId, nextOrderId]);
            revalidatePath('/manage');
        }
    }

    async function handlePriorityChange(formData: FormData) {
        'use server';
        const currId = Number(formData.get('currId'));
        const currPriorityId = Number(formData.get('currPriorityId'));
        const nextId = Number(formData.get('nextId'));
        const nextPriorityId = Number(formData.get('nextPriorityId'));

        if (nextId !== null && nextPriorityId !== null) {
            console.log(`Handle Priority Change: currId: ${currId} (${currPriorityId}) | nextId: ${nextId} (${nextPriorityId})`);
            await changePriority([currId, currPriorityId], [nextId, nextPriorityId]);
            revalidatePath('/manage');
        }
    }

    async function handleSetInactive(formData: FormData) {
        'use server';
        const id = Number(formData.get('id'));
        console.log(`Handle Set Inactive: id: ${id}`);
        await setInactive(id);
        revalidatePath('/manage');
    }

    async function handleSetActive(formData: FormData) {
        'use server';
        const id = Number(formData.get('id'));
        console.log(`Handle Set Active: id: ${id}`);
        await setActive(id);
        revalidatePath('/manage');
    }

    console.log(`Current pieces length: ${pieces.length}`);
    console.log(`Deleted Pieces length: ${deletedPieces.length}`);

    return (
        <div className="flex h-full w-full flex-col items-center overflow-y-auto py-4">
            <div className="w-4/5 rounded-lg bg-primary text-lg font-bold text-secondary_dark">
                <div className="w-full rounded-t-md bg-secondary text-lg font-bold text-secondary_dark">
                    <div className="flex pt-1">
                        {pieces.length > 0 && (
                            <Link
                                href="/manage?tab=manage"
                                className={`rounded-t-md px-2 py-1 ${
                                    activeTab === 'manage'
                                        ? 'bg-secondary_dark text-primary'
                                        : 'bg-secondary_light text-primary_dark hover:bg-secondary_dark hover:text-primary'
                                }`}
                            >
                                Piece Management
                            </Link>
                        )}
                        {deletedPieces.length > 0 && (
                            <Link
                                href="/manage?tab=deleted"
                                className={`rounded-t-md px-2 py-1 ${
                                    activeTab === 'deleted'
                                        ? 'bg-secondary_dark text-primary'
                                        : 'bg-secondary_light text-primary_dark hover:bg-secondary_dark hover:text-primary'
                                }`}
                            >
                                Deleted Pieces
                            </Link>
                        )}
                        <Link
                            href="/manage?tab=priority"
                            className={`rounded-t-md px-2 py-1 ${
                                activeTab === 'priority'
                                    ? 'bg-secondary_dark text-primary'
                                    : 'bg-secondary_light text-primary_dark hover:bg-secondary_dark hover:text-primary'
                            }`}
                        >
                            Piece Priority
                        </Link>
                    </div>
                </div>

                <div className="flex h-fit w-full flex-col items-center">
                    {pieces.length > 0 &&
                        activeTab === 'manage' &&
                        pieces.reverse().map((piece, i) => {
                            const last_piece = pieces[i - 1] ?? pieces[pieces.length - 1];
                            const next_piece = pieces[i + 1] ?? pieces[0];

                            return (
                                <div
                                    key={piece.id.toString()}
                                    className="flex w-full flex-row items-center space-x-4 rounded-lg border-b-2 border-primary_dark bg-primary p-1 hover:bg-secondary_light"
                                >
                                    <div className="flex max-h-24 min-h-24 min-w-24 max-w-24 items-center justify-center rounded bg-secondary p-1">
                                        <Image
                                            src={piece.image_path}
                                            alt={piece.title}
                                            width={piece.width}
                                            height={piece.height}
                                            className="h-[5.5rem] w-[5.5rem] object-contain"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <form action={handleOrderChange}>
                                            <input type="hidden" name="currId" value={piece.id.toString()} />
                                            <input type="hidden" name="currOrderId" value={piece.o_id.toString()} />
                                            <input type="hidden" name="nextId" value={last_piece.id.toString()} />
                                            <input type="hidden" name="nextOrderId" value={last_piece.o_id.toString()} />
                                            <button type="submit">
                                                <IoIosArrowForward className="h-8 w-8 -rotate-90 transform cursor-pointer rounded-lg bg-secondary fill-primary hover:bg-primary hover:fill-secondary_dark" />
                                            </button>
                                        </form>

                                        <form action={handleOrderChange}>
                                            <input type="hidden" name="currId" value={piece.id.toString()} />
                                            <input type="hidden" name="currOrderId" value={piece.o_id.toString()} />
                                            <input type="hidden" name="nextId" value={next_piece.id.toString()} />
                                            <input type="hidden" name="nextOrderId" value={next_piece.o_id.toString()} />
                                            <button type="submit">
                                                <IoIosArrowForward className="h-8 w-8 rotate-90 transform cursor-pointer rounded-lg bg-secondary fill-primary hover:bg-primary hover:fill-secondary_dark" />
                                            </button>
                                        </form>
                                    </div>
                                    <Link href={`/edit/${piece.id.toString()}`} className="">
                                        <FaEdit className="h-10 w-10 rounded-lg bg-secondary fill-primary p-1.5 hover:bg-primary hover:fill-secondary_dark" />
                                    </Link>
                                    <form action={handleSetInactive} className="flex h-fit w-fit">
                                        <input type="hidden" name="id" value={piece.id.toString()} />
                                        <button type="submit" className="h-full w-full">
                                            <MdDeleteForever className="h-10 w-10 rounded-lg bg-secondary fill-red-700 p-1 hover:bg-primary hover:fill-red-900" />
                                        </button>
                                    </form>
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-secondary_dark">{piece.title}</h3>
                                    </div>
                                </div>
                            );
                        })}
                    {prioritized_pieces.length > 0 &&
                        activeTab === 'priority' &&
                        prioritized_pieces.map((piece, i) => {
                            const last_piece = prioritized_pieces[i - 1] ?? prioritized_pieces[prioritized_pieces.length - 1];
                            const next_piece = prioritized_pieces[i + 1] ?? prioritized_pieces[0];

                            return (
                                <div
                                    key={piece.id.toString()}
                                    className="flex w-full flex-row items-center space-x-4 rounded-lg border-b-2 border-primary_dark bg-primary p-1 hover:bg-secondary_light"
                                >
                                    <div className="flex max-h-24 min-h-24 min-w-24 max-w-24 items-center justify-center rounded bg-secondary p-1">
                                        <Image
                                            src={piece.image_path}
                                            alt={piece.title}
                                            width={piece.width}
                                            height={piece.height}
                                            className="h-[5.5rem] w-[5.5rem] object-contain"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <form action={handlePriorityChange}>
                                            <input type="hidden" name="currId" value={piece.id.toString()} />
                                            <input type="hidden" name="currPriorityId" value={piece.p_id.toString()} />
                                            <input type="hidden" name="nextId" value={last_piece.id.toString()} />
                                            <input type="hidden" name="nextPriorityId" value={last_piece.p_id.toString()} />
                                            <button type="submit">
                                                <IoIosArrowForward className="h-8 w-8 -rotate-90 transform cursor-pointer rounded-lg bg-secondary fill-primary hover:bg-primary hover:fill-secondary_dark" />
                                            </button>
                                        </form>

                                        <form action={handlePriorityChange}>
                                            <input type="hidden" name="currId" value={piece.id.toString()} />
                                            <input type="hidden" name="currPriorityId" value={piece.p_id.toString()} />
                                            <input type="hidden" name="nextId" value={next_piece.id.toString()} />
                                            <input type="hidden" name="nextPriorityId" value={next_piece.p_id.toString()} />
                                            <button type="submit">
                                                <IoIosArrowForward className="h-8 w-8 rotate-90 transform cursor-pointer rounded-lg bg-secondary fill-primary hover:bg-primary hover:fill-secondary_dark" />
                                            </button>
                                        </form>
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-secondary_dark">{piece.title}</h3>
                                    </div>
                                </div>
                            );
                        })}
                    {deletedPieces.length > 0 &&
                        activeTab === 'deleted' &&
                        deletedPieces.map((piece) => (
                            <div
                                key={piece.id.toString()}
                                className="flex w-full flex-row items-center space-x-4 rounded-lg border-b-2 border-primary_dark bg-primary p-1 hover:bg-secondary_light"
                            >
                                <div className="flex max-h-24 min-h-24 min-w-24 max-w-24 items-center justify-center rounded bg-secondary p-1">
                                    <Image
                                        src={piece.image_path}
                                        alt={piece.title}
                                        width={piece.width}
                                        height={piece.height}
                                        className="h-[5.5rem] w-[5.5rem] object-contain"
                                    />
                                </div>
                                <form action={handleSetActive} className="flex h-fit w-fit">
                                    <input type="hidden" name="id" value={piece.id.toString()} />
                                    <button type="submit" className="h-full w-full">
                                        <MdRestore className="h-10 w-10 rounded-lg bg-secondary fill-green-700 p-1 hover:bg-primary hover:fill-green-900" />
                                    </button>
                                </form>
                                <div className="flex-grow">
                                    <h3 className="font-bold text-secondary_dark">{piece.title}</h3>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
