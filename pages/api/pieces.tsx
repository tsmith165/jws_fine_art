import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const prisma = new PrismaClient({log: ["query"]});

  try {
    const pieces = await prisma.piece.findMany();
    res.status(200);
    res.json({ pieces });
  } catch(e) {
    res.status(500);
    res.json({ error: "Unable to fetch pieces" })
  } finally {
    await prisma.$disconnect();
  }
}
