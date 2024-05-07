import { fetchPieces } from '@/app/actions';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const Admin: React.FC = () => {
    const exportPiecesAsXLSX = async () => {
        try {
            const pieces = await fetchPieces();

            if (pieces.length > 0) {
                const worksheet = XLSX.utils.json_to_sheet(pieces);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Pieces');
                const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                saveAs(data, 'pieces.xlsx');
                console.log('Successfully exported pieces as XLSX');
            } else {
                console.log('No pieces found to export');
            }
        } catch (error) {
            console.error('Failed to export pieces:', error);
        }
    };

    return (
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
                            className={'text-dark cursor-pointer rounded-md border-none bg-secondary_light px-2 py-5 font-lato uppercase'}
                            onClick={exportPiecesAsXLSX}
                        >
                            Export Pieces as XLSX
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
