import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { getToken } from "next-auth/jwt"

const secret = process.env.SECRET;

async function swap_o_ids(id, o_id) {
  console.log(`Attempting to swap o_ids for id: ${id} | swap_o_id ${o_id}`)
  const swap_output = await prisma.piece.update({
    where: {
      id: id
    },
    data: {
      o_id: o_id
    }
  });
  return swap_output
}

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
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
        // USER SIGNED IN AND HAS ROLE ADMIN
        console.log(`REQ.BODY (Next Line):`)
        console.log(req.body);


        if (!req.body) {
          // NO REQ.BODY JSON PASSED IN
          console.log("Request.body not passed in.  Status: 405")
          res.status(405)
        } else {
          const passed_json = req.body
          console.log(`Passed JSON (Next Line):`)
          console.log(passed_json);
          
          if (passed_json.curr_id_list == undefined && passed_json.swap_id_list == undefined) {
            // NO REQ.BODY JSON PASSED IN
            console.log("Request.body not passed in.  Status: 406")
            res.status(406)
          }
          else {
            const curr_id_list = passed_json.curr_id_list
            const swap_id_list = passed_json.swap_id_list

            console.log(`Cur ID List: ${curr_id_list}`)
            console.log(`Swap ID List: ${swap_id_list}`)

            if (parseInt(curr_id_list[0]) < 0 && parseInt(swap_id_list[0]) < 0) {

            } else {
              const first_swap_output = await swap_o_ids(curr_id_list[0], swap_id_list[1]);
              console.log(`Frist Swap Output (Next Line):`);
              console.log(first_swap_output)

              const second_swap_output = await swap_o_ids(swap_id_list[0], curr_id_list[1]);
              console.log(`Second Swap Output (Next Line):`);
              console.log(second_swap_output)

              res.json({success: true})
            }
          }
        }
      }
    }
  }
  res.end()
}
