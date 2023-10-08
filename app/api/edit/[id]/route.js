import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/authMiddleware";

export async function POST(req) {
    console.log(`Authenticating...`);
    
    const isAuthenticated = await authenticate(req);
    
    // Return early if not authenticated.
    if (!isAuthenticated) {
        return Response.json({ error: "Authentication failed" }, { status: 401 });
    }
    
    console.log(`Authentication Successful.`);

    console.log(`Request URL: ${req.url}`);
    const id = req.url.split('/').pop();
    console.log(`Starting EDIT API for ID: ${id}`);

    const passed_json = await req.json();
    console.log(`Passed JSON:`, passed_json);
    
    if (!passed_json) {
        console.error(`Request body is undefined`);
        return Response.json({ error: "Request body is undefined" }, { status: 400 });
    }
    
    const piece_type = passed_json?.piece_type;
    console.log(`Passed JSON Piece Type: ${piece_type} | Full JSON (Next Line):`);
    console.log(passed_json);
    
    try {
        const update_output = await prisma.piece.update({
            where: { id: parseInt(id) },
            data: passed_json
        });

        console.log(`Update Output (Next Line):`);
        console.log(update_output);
        return Response.json({ update_output });
    } catch (err) {
        console.error(`Error updating piece: ${err.message}`);
        return Response.json({ error: 'Failed to update piece' }, { status: 500 });
    }
}
