import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { getToken } from "next-auth/jwt"
import { generate_upload_url } from "../../../lib/s3_api_calls"

const secret = process.env.SECRET;

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
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
        console.log(`Request.method == POST - Attempting to get upload URL...`)

        const passed_json = req.body

        console.log(`Passed JSON (Next Line):`)
        console.log(passed_json);

        const image_name = passed_json.image_name

        const url = await generate_upload_url(image_name)

        console.log(`Upload URL (Next Line): ${url}`);
        res.json({url})

      }
    }
  }
  res.end()
}
