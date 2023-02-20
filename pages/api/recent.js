import { prisma } from "@/lib/prisma";

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req, res) {
  try {
    const piece = await prisma.piece.findFirst({
      orderBy: { id: 'desc' },
  })
    res.status(200);
    res.json({ piece });
  } catch(e) {
    res.status(500);
    res.json({ error: "Unable to fetch pieces" })
  } finally {
    //await prisma.$disconnect();
    console.log("End Pieces API Call");
    res.end();
  }
}
