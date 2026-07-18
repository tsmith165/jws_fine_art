import { Download, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import { fetchPieces } from '@/app/actions';

const DataBackup: React.FC = () => {
    const [isExporting, setIsExporting] = useState(false);

    const exportPiecesAsXLSX = async () => {
        setIsExporting(true);
        try {
            const pieces = await fetchPieces();

            if (pieces.length > 0) {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Pieces');

                worksheet.columns = Object.keys(pieces[0]).map((key) => ({ header: key, key }));
                pieces.forEach((piece) => worksheet.addRow(piece));

                const buffer = await workbook.xlsx.writeBuffer();
                const data = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                saveAs(data, 'pieces.xlsx');
            }
        } catch (error) {
            console.error('Failed to export pieces:', error);
        }
        setIsExporting(false);
    };

    return (
        <div className="owner-tool-action">
            <button className="owner-button" onClick={exportPiecesAsXLSX} disabled={isExporting}>
                {isExporting ? <LoaderCircle className="owner-spin" size={16} /> : <Download size={16} />}
                {isExporting ? 'Preparing export…' : 'Download XLSX backup'}
            </button>
        </div>
    );
};

export default DataBackup;
