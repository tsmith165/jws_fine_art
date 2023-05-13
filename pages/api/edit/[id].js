import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/authMiddleware";

export default async function handler(req, res) {
  if(req.method !== 'POST') {
    console.log("Request.method != POST.  Status: 402")
    res.status(402)
  }

  await authenticate(req, res, async () => {
    const id = req.query.id.toString();
    console.log(`Auth Successful.  Start EDIT API for ID: ${id}`);
  
    const passed_json = req.body
  
    console.log(`Passed JSON Piece Type: ${passed_json.piece_type} | Full JSON (Next Line):`)
    console.log(passed_json);
    
    const update_output = await prisma.piece.update({
      where: { id: parseInt(id) },
      data: passed_json
    });
  
    console.log(`Update Output (Next Line):`);
    console.log(update_output)
    res.json(update_output)
    res.end()
  });
}
