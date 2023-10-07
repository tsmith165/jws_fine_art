import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const piece = await prisma.piece.findFirst({
      orderBy: { id: 'desc' },
    });

    return Response.json({ piece });
  } catch(e) {
    console.log(`Error: ${e}`);
    return Response.json({ error: "Unable to fetch pieces" }, { status: 500 });
  } finally {
    console.log("End Pieces API Call");
  }
}
