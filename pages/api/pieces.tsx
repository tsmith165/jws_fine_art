import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req: NextApiRequest, res: NextApiResponse) {
  try {
    const pieces = await prisma.piece.findMany();
    res.status(200);
    res.json({ pieces });
  } catch(e) {
    res.status(500);
    res.json({ error: "Unable to fetch pieces" })
  } finally {
    //await prisma.$disconnect();
    console.log("End Pieces API Call");
    res.end();
  }
}
