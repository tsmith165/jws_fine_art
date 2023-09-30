import { prisma } from '@/lib/prisma';

import XLSX from 'xlsx';

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req, res) {
    try {
        const passed_json = req.body;

        console.log(`Passed JSON (Next Line):`);
        console.log(passed_json);

        const format = passed_json['format'] !== 'xlsx' ? 'None' : 'xlsx';
        const theme = passed_json['theme'] !== undefined ? passed_json['theme'] : 'None';
        console.log(`Theme: ${theme}`);

        var pieces = null;
        if (theme !== 'None') {
            pieces = await prisma.piece.findMany({
                where: {
                    theme: theme,
                },
                orderBy: {
                    o_id: 'desc',
                },
            });
        } else {
            pieces = await prisma.piece.findMany({ orderBy: { o_id: 'desc' } });
        }

        if (format === 'xlsx') {
            const simplifiedPieces = pieces.map((piece) => ({
                id: piece.id,
                o_id: piece.o_id,
                class_name: piece.class_name,
                title: piece.title,
                image_path: piece.image_path,
                width: piece.width,
                height: piece.height,
                description: piece.description,
                piece_type: piece.piece_type,
                sold: piece.sold ? 'Yes' : 'No',
                price: piece.price,
                instagram: piece.instagram,
                real_width: piece.real_width,
                real_height: piece.real_height,
                active: piece.active ? 'Yes' : 'No',
                theme: piece.theme,
                available: piece.available ? 'Yes' : 'No',
                framed: piece.framed ? 'Yes' : 'No',
                comments: piece.comments || '',
            }));

            const ws = XLSX.utils.json_to_sheet(simplifiedPieces);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Pieces');

            const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

            res.status(200).end(buffer);
        } else {
            res.status(200).json({ pieces });
        }
    } catch (e) {
        console.log(`Error: ${e}`);
        res.status(500);
        res.json({ error: 'Unable to fetch pieces' });
    } finally {
        //await prisma.$disconnect();
        console.log('End Pieces API Call');
        res.end();
    }
}
