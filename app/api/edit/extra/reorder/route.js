import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/authMiddleware";

export async function PUT(req) {
    console.log("Authenticating...");

    const isAuthenticated = await authenticate(req);
    
    // Return early if not authenticated.
    if (!isAuthenticated) {
        return Response.json({ error: "Authentication failed" }, { status: 401 });
    }
    
    console.log("Authentication Successful. Start REORDER EXTRA IMAGES API");

    const passed_json = await req.json();

    if (!passed_json) {
        console.error(`Request body is undefined`);
        return Response.json({ error: "Request body is undefined" }, { status: 400 });
    }
  
    const piece_id = passed_json?.piece_id;
    const extra_images = passed_json?.extra_images;
    const image_type_to_edit = passed_json?.image_type_to_edit;
    console.log(`Passed piece_id: ${piece_id} | extra_images: ${extra_images} | image_type_to_edit: ${image_type_to_edit}`);

    try {
        const update_output = await prisma.piece.update({
            where: { id: parseInt(piece_id) },
            data: { [image_type_to_edit]: JSON.stringify(extra_images) },
        });

        console.log("Update Output (Next Line):");
        console.log(update_output);
        return Response.json({ update_output });
    } catch (err) {
        console.error(`Error reordering extra images: ${err.message}`);
        return Response.json({ error: 'Failed to reorder extra images' }, { status: 500 });
    }
}
