import { buffer } from "micro";
import Stripe from "stripe";

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

            if (event.type === "payment_intent.payment_failed") {
                const payment_data = event.data.object;
                // Handle unsuccessful payment
                console.log("Payment UNSUCCSESSFUL. Stripe Response (Next Line):")
                console.log(payment_data)

            } else if (event.type === "payment_intent.succeeded") {
                const payment_data = event.data.object;
                // Handle successful payment
                console.log("Payment SUCCSESSFUL. Stripe Response (Next Line):")
                console.log(payment_data)

            } else {
                console.warn(`Unhandled Stripe event type: ${event.type} |  Data (Next Line):`);
                const unhandled_data = event.data.object;
                console.log(unhandled_data)
            }

        } catch (err) {
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