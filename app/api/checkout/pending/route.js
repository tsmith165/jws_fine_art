import { prisma } from '@/lib/prisma';

async function create_pending_transaction(passed_json) {
    console.log(`Attempting to create pending transaction for piece_db_id: ${passed_json.piece_db_id}`);
    const pending_transaction_output = await prisma.pending.create({
        data: passed_json,
    });
    return pending_transaction_output;
}

export async function POST(req) {
    console.log('CREATE PENDING TRANSACTION');

    const passed_json = await req.json();

    if (!passed_json) {
        console.error(`Request body is undefined`);
        return Response.json({ error: "Request body is undefined" }, { status: 400 });
    }

    console.log('Current req.body: ', passed_json)

    if (
        !passed_json.piece_db_id ||
        !passed_json.piece_title ||
        !passed_json.full_name ||
        !passed_json.phone ||
        !passed_json.email ||
        !passed_json.address ||
        passed_json.international === undefined
    ) {
        // NO REQ.BODY JSON PASSED IN
        console.log('Request.body not fully passed in. Status: 406');
        return Response.json({ error: "Incomplete request body" }, { status: 406 });
    } else {
        // Create Pending Transaction
        const pending_transaction_output = await create_pending_transaction({
            piece_db_id: passed_json.piece_db_id, 
            piece_title: passed_json.piece_title, 
            full_name: passed_json.full_name, 
            phone: passed_json.phone, 
            email: passed_json.email, 
            address: passed_json.address, 
            international: passed_json.international
        });
        console.log(`Pending Transaction Output (Next Line):`);
        console.log(pending_transaction_output);
        return Response.json({ success: true });
    }
}
