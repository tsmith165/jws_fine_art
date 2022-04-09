import { buffer } from "micro";
import Stripe from "stripe";
import { prisma } from "../../../lib/prisma";
import moment from "moment";

export const config = {
    api: {
        bodyParser: false,
    },
};

const handler = async (req, res) => {
    console.log("Recieved Stripe Web Hook API Request")
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    if (req.method === "POST") {
        console.log("REQUEST.METHOD == POST")

        const buff = await buffer(req);
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        let event;

        try {
            if (!sig || !webhookSecret) return;

            console.log("Verifying Signature From Webhook...")
            event = stripe.webhooks.constructEvent(buff, sig, webhookSecret);

            console.log('STRIPE EVENT (NEXT LINE):')
            console.log(event);
    
            const stripe_id = event["data"]["object"]["charges"]["data"][0]["id"];
            const metadata = event["data"]["object"]["charges"]["data"][0]["metadata"];
    
            console.log(`ID: ${stripe_id}`);
            console.log(`METADATA: ${JSON.stringify(metadata)}`);

            if (event.type === "payment_intent.payment_failed") {
                const payment_data = event.data.object;
                // Handle unsuccessful payment
                console.log("Payment UNSUCCSESSFUL. Handle unverified transaction (no current handling)...")

            } else if (event.type === "payment_intent.succeeded") {
                const payment_data = event.data.object;
                // Handle successful payment
                console.log("Payment SUCCSESSFUL!  Creating Verified Transaction...")
    
                console.log(`Querying pending transactions for Piece DB ID: ${metadata.product_id} | Full Name: ${metadata.full_name}`)
                const pending_transaction_data = await prisma.pending.findFirst({
                    where: {
                      piece_db_id: parseInt(metadata.product_id),
                      full_name: metadata.full_name
                    }
                });

                console.log("Pending Transaction Data (Next Line):")
                console.log(pending_transaction_data)
                
                console.log("Creating Verified Transaction...")
                const create_output = await prisma.verified.create({
                    data: {
                        piece_db_id: parseInt(metadata.product_id),
                        full_name: metadata.full_name,
                        piece_title: pending_transaction_data.piece_title,
                        phone: pending_transaction_data.phone,
                        email: pending_transaction_data.email,
                        address: pending_transaction_data.address,
                        international: pending_transaction_data.international,
                        image_path: metadata.image_path, 
                        image_width: parseInt(metadata.image_width), 
                        image_height: parseInt(metadata.image_height), 
                        date: new Date(), 
                        stripe_id: stripe_id, 
                        price: parseInt(metadata.price_id)
                    }
                });

                console.log("Pending Transaction Create Output (Next Line):")
                console.log(create_output)


                console.log("Setting Piece As Sold...")
                const update_output = await prisma.piece.update({
                    where: {
                        id: parseInt(metadata.product_id)
                    },
                    data: {
                        sold: true
                    }
                });

                console.log("Set Sold Update Output (Next Line):")
                console.log(update_output)

            } else {
                console.warn(`Unhandled Stripe event type: ${event.type} |  Data (Next Line):`);
                const unhandled_data = event.data.object;
                console.log(unhandled_data)
            }

        } catch (err) {
            console.error(`Webhook Error: ${err.message}`)
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        res.json({ received: true });
    } else {
        console.log(`REQUEST.METHOD != POST | CURRENT: ${req.method}`)
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
};

export default handler;