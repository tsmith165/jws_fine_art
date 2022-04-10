import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import { getToken } from "next-auth/jwt"

const secret = process.env.SECRET;

export default async function handler(req, res) {
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
        console.log(`Attempting to CREATE NEW PIECE...`)

        const passed_json = req.body

        console.log(`Passed JSON (Next Line):`)
        console.log(passed_json);

        const last_oid_json = (await prisma.$queryRaw`select max(o_id) from "Piece"`)
        console.log(`LAST OID (Next Line):`)
        console.log(last_oid_json);
        
        const last_oid = parseInt(last_oid_json[0]['max'])
        const next_oid = last_oid + 1;

        const last_id_json = (await prisma.$queryRaw`select max(id) from "Piece"`)
        console.log(`LAST ID (Next Line):`)
        console.log(last_id_json);
        

        const last_id = parseInt(last_oid_json[0]['max'])
        const next_id = last_oid + 1;

        passed_json['id'] = next_id;
        passed_json['o_id'] = next_oid;
        passed_json['class_name'] = passed_json['title'].toString().toLowerCase().replace(" ","_");

        if (passed_json['image_path'].includes(".com")) {
          passed_json['image_path'] = passed_json['image_path'].split(".com")[1]
        }

        console.log(`Final JSON (Next Line):`)
        console.log(passed_json);
        
        const create_output = await prisma.piece.create({
          data: {
            id: next_id,
            o_id: next_oid,
            class_name: passed_json['title'].toString().toLowerCase().replace(" ","_"), 
            title: passed_json.title,
            image_path: passed_json.image_path,
            width: parseInt(passed_json.width), 
            height: parseInt(passed_json.height),
            description: passed_json.description.split('\n').join("<br>"), 
            type: passed_json.type, 
            sold: passed_json.sold == "Sold" ? true : false,
            price: parseInt(passed_json.price), 
            real_width: parseFloat(passed_json.real_width), 
            real_height: parseFloat(passed_json.real_height),
            active: true,
            instagram: passed_json.instagram
          }
        });
  
        console.log(`Create Output (Next Line):`);
        console.log(create_output)
        res.json(create_output)
      }
    }
  }
  res.end()
}
