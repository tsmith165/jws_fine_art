import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { getToken } from "next-auth/jwt"

const secret = process.env.SECRET;

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
  const id: string = req.query.id.toString();
  console.log(`Start EDIT API for ID: ${id}`);

  const token = await getToken({ req, secret })

  if (!token) {
    console.log("No token found.  Status: 401")
    res.status(401)
  } else {
    // Signed in
    console.log("JSON Web Token", JSON.stringify(token, null, 2))

    if (token.role !== 'ADMIN') {
      console.log("User Not Authorized.  Status: 403")
      res.status(403)
    }
    else {
      if(req.method !== 'POST') {
        console.log("Request.method != POST.  Status: 402")
        res.status(402)
      } else {
        console.log(`Attempting to edit details for piece ID: ${id}...`)

        const passed_json = req.body

        console.log(`Passed JSON (Next Line):`)
        console.log(passed_json);
        
        const update_output = await prisma.piece.update({
          where: {
            id: parseInt(id)
          },
          data: passed_json
        });
  
        console.log(`Update Output (Next Line):`);
        console.log(update_output)
        res.json(update_output)
      }
    }
  }
  res.end()
}