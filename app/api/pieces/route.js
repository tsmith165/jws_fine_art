import { prisma } from "@/lib/prisma";
import XLSX from 'xlsx';

export async function POST(req) {
    try {
        const passed_json = await req.json()

        if (passed_json === undefined) {
            console.error(`Request body is undefined`);
            return Response.json({ error: "Request body is undefined" }, { status: 400 });
        }

        const format = passed_json?.format !== 'xlsx' ? 'None' : 'xlsx';
        const theme = passed_json?.swap_id_list !== undefined ? passed_json?.swap_id_list : 'None';
        console.log(`Passed Theme: ${theme} | Format: ${format}`);

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

            const headers = {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            };

            return new Response(buffer, { status: 200, headers }); 

        } else {
            return Response.json({ pieces }, { status: 200 }); 
        }
    } catch (e) {
        console.log(`Error: ${e}`);
        return Response.json({ error: 'Unable to fetch pieces' }, { status: 500 }); 
    }
}
