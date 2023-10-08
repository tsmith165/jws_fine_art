import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/authMiddleware";

export async function POST(req) {
    console.log("Authenticating...");

    const isAuthenticated = await authenticate(req);
    
    // Return early if not authenticated.
    if (!isAuthenticated) {
        return Response.json({ error: "Authentication failed" }, { status: 401 });
    }

    const id = req.query.id.toString();
    console.log(`Auth Successful. Start DELETE PIECE API for ID: ${id}`);
    
    try {
        const delete_output = await prisma.piece.delete({
            where: {
                id: parseInt(id)
            }
        });

        console.log(`DELETE PIECE Output (Next Line):`);
        console.log(delete_output);
        return Response.json(delete_output);
    } catch (error) {
        console.error(`Error while deleting piece: ${error.message}`);
        return Response.json({ error: "Failed to delete piece." }, { status: 500 });
    }
}
