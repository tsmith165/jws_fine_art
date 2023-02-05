import { NextApiRequest, NextApiResponse } from "next";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { generate_upload_url } from "../../../lib/s3_api_calls"

const secret = process.env.SECRET;

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

  console.log(`Auth Successful.  Attempting to get upload URL...`);

  const passed_json = req.body

  console.log(`Passed JSON (Next Line):`)
  console.log(passed_json);

  const image_name = passed_json.image_name

  const url = await generate_upload_url(image_name)

  console.log(`Upload URL (Next Line): ${url}`);
  res.json({url})
  
  res.end()
}
