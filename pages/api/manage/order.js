import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { clerkClient, getAuth } from "@clerk/nextjs/server";

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
  if(req.method !== 'POST') {
    console.log("Request.method != POST.  Status: 402")
    res.status(402)
  }

  if (!req.body) {
    // NO REQ.BODY JSON PASSED IN
    console.log("Request.body not passed in.  Status: 405")
    res.status(405)
  } 

  const passed_json = req.body
  console.log(`Passed JSON (Next Line):`)
  console.log(passed_json);

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
  
  if (passed_json.curr_id_list == undefined || passed_json.swap_id_list == undefined) {
    // NO REQ.BODY JSON PASSED IN
    console.log("Request.body not passed in.  Status: 406")
    res.status(406)
  }

  console.log(`Auth Successful.  Attempting to reorder pieces...`);

  const curr_id_list = passed_json.curr_id_list
  const swap_id_list = passed_json.swap_id_list

  console.log(`Cur ID List: ${curr_id_list}`)
  console.log(`Swap ID List: ${swap_id_list}`)

  if (parseInt(curr_id_list[0]) < 0 && parseInt(swap_id_list[0]) < 0) {
    console.log("Not swapping invalid IDs")
  } else {
    const first_swap_output = await swap_o_ids(curr_id_list[0], swap_id_list[1]);
    console.log(`Frist Swap Output (Next Line):`);
    console.log(first_swap_output)

    const second_swap_output = await swap_o_ids(swap_id_list[0], curr_id_list[1]);
    console.log(`Second Swap Output (Next Line):`);
    console.log(second_swap_output)

    res.json({success: true})
  }
  res.end()
}
