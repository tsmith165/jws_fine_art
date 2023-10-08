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
  console.log(`Auth Successful. Start PROMOTE API for ID: ${id}`);

  try {
    const update_output = await prisma.user.update({
      where: {
        id: id
      },
      data: {
        role: "ADMIN"
      }
    });
    console.log(`Update Output (Next Line):`);
    console.log(update_output);
    return Response.json(update_output);
  } catch (error) {
    console.error(`Error while promoting user: ${error.message}`);
    return Response.json({ error: "Failed to promote user." }, { status: 500 });
  }
}
