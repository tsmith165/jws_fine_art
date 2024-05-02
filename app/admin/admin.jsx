'use client';

import { fetch_pieces } from '@/lib/api_calls';

function Admin(props) {
    const exportPiecesAsXLSX = async () => {
        try {
            const response = await fetch_pieces('None', 'xlsx');

            if (response) {
                console.log('Successfully exported pieces as XLSX');
            } else {
                console.error('Failed to export pieces:', response.statusText);
            }
        } catch (error) {
            console.error('Failed to export pieces:', error);
        }
    };

    return (
        <SignedIn>
            <div className={'flex justify-center'}>
                <div className={'flex h-full w-full flex-col items-center overflow-x-hidden p-5'}>
                    <div className={'w-full rounded-md border-2 border-primary_dark pb-5'}>
                        <div
                            className={
                                'h-[40px] w-full rounded-tl-sm rounded-tr-sm bg-primary_dark px-1 py-2 font-lato text-lg text-secondary_light'
                            }
                        >
                            Data Backup
                        </div>
                        <div className={'w-full rounded-bl-sm rounded-br-sm bg-primary p-5'}>
                            <button
                                className={
                                    'text-dark cursor-pointer rounded-md border-none bg-secondary_light px-2 py-5 font-lato uppercase'
                                }
                                onClick={exportPiecesAsXLSX}
                            >
                                Export Pieces as XLSX
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </SignedIn>
    );
}

export default Admin;
