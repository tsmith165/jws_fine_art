import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/authMiddleware";

export async function POST(req) {
  console.log(`Authenticating...`);

  const isAuthenticated = await authenticate(req);

  // Return early if not authenticated.
  if (!isAuthenticated) {
    return Response.json({ error: "Authentication failed" }, { status: 401 });
  }

  const id = req.query.id.toString();
  console.log(`Auth Successful. Start DELETE API for ID: ${id}`);

  try {
    const delete_output = await prisma.user.delete({
      where: {
        id: id
      }
    });
    
    console.log(`DELETE USER Output (Next Line):`);
    console.log(delete_output);

    return Response.json(delete_output);
  } catch (error) {
    console.error(`Error while deleting user: ${error.message}`);
    return Response.json({ error: "Failed to delete user." }, { status: 500 });
  }
}
