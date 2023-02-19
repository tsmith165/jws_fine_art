import { prisma } from "../../../lib/prisma";

async function create_pending_transaction(passed_json) { 
  console.log(`Attempting to craete pending transaction for piece_db_id: ${passed_json.piece_db_id}`)
  const pending_transaction_output = await prisma.pending.create({
    data: passed_json
  });
  return pending_transaction_output
}

export default async function handler(req, res) {
    console.log("CREATE PENDING TRANSACTION")

    if(req.method !== 'POST') {
        // REQUEST METHOD NOT POST
        console.log("Request.method != POST.  Status: 402")
        res.status(402)
    } else {
        // REQUEST METHOD IS POST
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

            if ( passed_json.piece_db_id == undefined || 
                 passed_json.piece_title == undefined ||
                 passed_json.full_name == undefined ||
                 passed_json.phone == undefined ||
                 passed_json.email == undefined ||
                 passed_json.address == undefined ||
                 passed_json.international == undefined
            ) {
                // NO REQ.BODY JSON PASSED IN
                console.log("Request.body not fully passed in.  Status: 406")
                res.status(406)
            }
            else {
                // Create Pending Transaction
                const pending_transaction_output = await create_pending_transaction(passed_json)
                console.log(`Pending Transaction Output (Next Line):`);
                console.log(pending_transaction_output)
  
                res.json({success: true})
            }
        }
    }
  res.end()
}
