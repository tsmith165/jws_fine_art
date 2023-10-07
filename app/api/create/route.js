import { prisma } from '@/lib/prisma';
import { authenticate } from "@/lib/authMiddleware";

export async function POST(req) {
    console.log(`Authenticating...`);

    const isAuthenticated = await authenticate(req);

    // Return early if not authenticated.
    if (!isAuthenticated) {
        return Response.json({ error: "Authentication failed" }, { status: 401 });
    }

    console.log(`Authentication Successful.`);

    const passed_json = await req.json();

    if (passed_json === undefined) {
        console.error(`Request body is undefined`);
        return Response.json({ error: "Request body is undefined" }, { status: 400 });
    }

    console.log(`Attempting to CREATE NEW PIECE...`);

    const last_oid_json = await prisma.$queryRaw`select max(o_id) from "Piece"`;
    console.log(`LAST OID (Next Line):`);
    console.log(last_oid_json);

    const last_oid = parseInt(last_oid_json[0]['max']);
    const next_oid = last_oid + 1;
    const next_id = last_oid + 1;

    passed_json['id'] = next_id;
    passed_json['o_id'] = next_oid;
    passed_json['class_name'] = passed_json['title'].toString().toLowerCase().replace(' ', '_');

    if (passed_json['image_path'].includes('.com')) {
        passed_json['image_path'] = passed_json['image_path'].split('.com')[1];
    }

    console.log(`Final JSON (Next Line):`);
    console.log(passed_json);

    const passed_json_description = passed_json.description === undefined ? '' : passed_json.description.includes('\n') ? passed_json.description.split('\n').join('<br>') : '';

    const create_output = await prisma.piece.create({
        data: {
            id: next_id,
            o_id: next_oid,
            class_name: passed_json['title'].toString().toLowerCase().replace(' ', '_'),
            title: passed_json.title,
            image_path: passed_json.image_path,
            width: parseInt(passed_json.width),
            height: parseInt(passed_json.height),
            description: passed_json_description,
            piece_type: passed_json.piece_type,
            sold: passed_json.sold == 'Sold' ? true : false,
            price: parseInt(passed_json.price),
            real_width: parseFloat(passed_json.real_width),
            real_height: parseFloat(passed_json.real_height),
            active: true,
            instagram: passed_json.instagram,
            framed: passed_json.framed == 'True' ? true : false,
            comments: passed_json.comments,
        },
    });

    console.log(`Create Output (Next Line):`);
    console.log(create_output);
    return Response.json(create_output);
}
