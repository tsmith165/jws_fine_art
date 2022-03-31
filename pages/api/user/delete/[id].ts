import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { getToken } from "next-auth/jwt"

const secret = process.env.SECRET;

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
  const id: string = req.query.id.toString();
  console.log(`Start DELETE API for ID: ${id}`);

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
      if(req.method !== 'DELETE') {
        console.log("Request.method != DELETE.  Status: 402")
        res.status(402)
      } else {
        console.log(`Attempting to add role as "USER" for ${id}...`)
        const delete_output = await prisma.user.delete({
            where: {
                id: id
            }
        })
  
        console.log(`Delete Output (Next Line):`);
        console.log(delete_output)
        res.json(delete_output)
      }
    }
  }
  res.end()
}
