import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/authMiddleware";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    console.log("Request.method != PUT. Status: 405");
    res.status(405).end();
    return;
  }

  await authenticate(req, res, async () => {
    console.log("Auth Successful. Start REORDER EXTRA IMAGES API");

    console.log("Passed JSON (Next Line):");
    console.log(req.body);

    const { piece_id, extra_images, image_type_to_edit } = req.body;

    console.log("Passed JSON piece_id:", piece_id, "extra_images:", extra_images);
  
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