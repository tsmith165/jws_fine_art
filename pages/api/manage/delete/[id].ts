import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { clerkClient, getAuth } from "@clerk/nextjs/server";

export default async function handler(req:NextApiRequest, res: NextApiResponse) {

    if(req.method !== 'POST') {
        console.log("Request.method != POST.  Status: 402")
        res.status(402)
    }
    
    const { userId } = getAuth(req);
    const user = userId ? await clerkClient.users.getUser(userId) : null;
    
    if (!user) {
        console.log("No user token found.  Status: 401")
        res.status(401)
    } 
    if (!('publicMetadata' in user)) {
        console.log("User does not have publicMetadata.  Status: 403 - User (Next Line):")
        console.log(user)
        res.status(403)
    }
    if (!('role' in user.publicMetadata)) {
        console.log(`User does not have a role.  Status: 403 - User metadata: ${user.publicMetadata}`)
        console.log(user)
        res.status(403)
    }
    if (user.publicMetadata.role !== 'ADMIN') {
        console.log(`User does not have role admin.  Status: 403 - User role: ${user.publicMetadata.role}`)
        res.status(403)
    }

    const id: string = req.query.id.toString();
    console.log(`Auth Successful.  Start DELETE PIECE API for ID: ${id}`);
    
    const delete_output = await prisma.piece.delete({
        where: {
            id: parseInt(id)
        }
    })

    console.log(`DELETE PIECE Output (Next Line):`);
    console.log(delete_output)
    res.json(delete_output)

    res.end()
}
