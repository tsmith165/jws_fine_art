import { fetchPieces } from '@/app/actions';
import ExcelJS from 'exceljs';
import { Buffer } from 'buffer';

export async function exportPieces(): Promise<Buffer> {
    const pieces = await fetchPieces();

    if (pieces.length > 0) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Pieces');

        worksheet.columns = Object.keys(pieces[0]).map((key) => ({ header: key, key }));
        pieces.forEach((piece) => worksheet.addRow(piece));

        const uint8Array = await workbook.xlsx.writeBuffer();
        const buffer = Buffer.from(uint8Array);

        return buffer;
    } else {
        throw new Error('No pieces found to export');
    }
}
