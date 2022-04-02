import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { getToken } from "next-auth/jwt"

const secret = process.env.SECRET;

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
    const id: string = req.query.id.toString();
    console.log(`Start DELETE PIECE API for ID: ${id}`);

    const token = await getToken({ req, secret })

    if (!token) {
        // NO TOKEN FOUND
        console.log("No token found.  Status: 401")
        res.status(401)
    } else {
        // SIGNED IN
        console.log("JSON Web Token", JSON.stringify(token, null, 2))

        if (token.role !== 'ADMIN') {
            // USER ROLE NOT ADMIN
            console.log("User Not Authorized.  Status: 403")
            res.status(403)
        }
        else {
            if(req.method !== 'POST') {
                // REQUEST METHOD NOT POST
                console.log("Request.method != POST.  Status: 402")
                res.status(402)
            } else {
                console.log(`Attempting to DELETE PIECE with ID: ${id}...`)
                const delete_output = await prisma.piece.delete({
                    where: {
                        id: parseInt(id)
                    }
                })
          
                console.log(`DELETE PIECE Output (Next Line):`);
                console.log(delete_output)
                res.json(delete_output)
            }
        }
    }
    res.end()
}
