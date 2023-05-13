import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/authMiddleware";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    console.log("Request.method != DELETE. Status: 405");
    res.status(405).end();
    return;
  }

  await authenticate(req, res, async () => {
    console.log("Auth Successful. Start DELETE EXTRA IMAGE API");

    const { piece_id, index_to_delete, image_type_to_edit } = req.body;

    console.log("Passed JSON (Next Line):");
    console.log(req.body);

    const piece = await prisma.piece.findUnique({
      where: { id: parseInt(piece_id) },
      select: { [image_type_to_edit]: true },
    });

    if (!piece) {
      res.status(404).json({ message: "Piece not found" }).end();
      return;
    }

    const extra_images = JSON.parse(piece[image_type_to_edit]);
    extra_images.splice(index_to_delete, 1);

    const update_output = await prisma.piece.update({
      where: { id: parseInt(piece_id) },
      data: { [image_type_to_edit]: JSON.stringify(extra_images) },
    });

    console.log("Update Output (Next Line):");
    console.log(update_output);
    res.json(update_output);
    res.end();
  });
}
