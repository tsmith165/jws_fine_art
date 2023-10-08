import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/authMiddleware";

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

export async function POST(req) {
    console.log("Authenticating...");

    const isAuthenticated = await authenticate(req);
    
    // Return early if not authenticated.
    if (!isAuthenticated) {
        return Response.json({ error: "Authentication failed" }, { status: 401 });
    }

    const passed_json = await req.json();

    if (!passed_json) {
        console.error(`Request body is undefined`);
        return Response.json({ error: "Request body is undefined" }, { status: 400 });
    }

    const curr_id_list = passed_json?.curr_id_list;
    const swap_id_list = passed_json?.swap_id_list;
  
    if (curr_id_list == undefined || swap_id_list == undefined) {
        console.error("curr_id_list or swap_id_list not passed in. Status: 406");
        return Response.json({ error: "Missing curr_id_list or swap_id_list" }, { status: 406 });
    }

    console.log(`Auth Successful. Attempting to reorder pieces...`);
    console.log(`Cur ID List: ${curr_id_list}`);
    console.log(`Swap ID List: ${swap_id_list}`);

    if (parseInt(curr_id_list[0]) < 0 && parseInt(swap_id_list[0]) < 0) {
        console.log("Not swapping invalid IDs");
        return Response.json({ success: false });
    } else {
        const first_swap_output = await swap_o_ids(curr_id_list[0], swap_id_list[1]);
        console.log(`First Swap Output (Next Line):`);
        console.log(first_swap_output);

        const second_swap_output = await swap_o_ids(swap_id_list[0], curr_id_list[1]);
        console.log(`Second Swap Output (Next Line):`);
        console.log(second_swap_output);

        return Response.json({ success: true });
    }
}
