import { buffer } from 'micro';
import Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { db, piecesTable, pendingTransactionsTable, verifiedTransactionsTable } from '@/db/db';
import { Pieces, PendingTransactions, VerifiedTransactions } from '@/db/schema';

interface WebhookEvent {
    id: string;
    type: string;
    data: {
        object: {
            id: string;
            object: string;
            amount: number;
            metadata: {
                product_id: string;
                full_name: string;
                image_path: string;
                image_width: string;
                image_height: string;
                price_id: string;
            };
        };
    };
}

export async function POST(request: Request) {
    console.log('Received Stripe Web Hook API Request');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });

    const buff = await buffer(request);
    const sig = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;

    try {
        if (!sig || !webhookSecret) {
            return new Response(JSON.stringify({ error: 'Invalid signature or webhook secret' }), { status: 400 });
        }

        console.log('Verifying Signature From Webhook...');
        event = stripe.webhooks.constructEvent(buff.toString(), sig, webhookSecret);

        console.log('STRIPE EVENT (NEXT LINE):');
        console.log(event);

        const stripeEvent = event as unknown as WebhookEvent;
        const metadata = stripeEvent.data.object.metadata;
        const stripe_id = stripeEvent.data.object.id;

        console.log(`ID: ${stripe_id}`);
        console.log(`METADATA: ${JSON.stringify(metadata)}`);

        if (event.type === 'payment_intent.payment_failed') {
            const payment_data = stripeEvent.data.object;
            // Handle unsuccessful payment
            console.log('Payment UNSUCCSESSFUL. Handle unverified transaction (no current handling)...');
        } else if (event.type === 'payment_intent.succeeded') {
            const payment_data = stripeEvent.data.object;
            // Handle successful payment
            console.log('Payment SUCCSESSFUL!  Creating Verified Transaction...');

            console.log(`Querying pending transactions for Piece DB ID: ${metadata.product_id} | Full Name: ${metadata.full_name}`);
            const pending_transaction_data = await db
                .select()
                .from(pendingTransactionsTable)
                .where(eq(pendingTransactionsTable.piece_db_id, parseInt(metadata.product_id)))
                .where(eq(pendingTransactionsTable.full_name, metadata.full_name))
                .limit(1);

            console.log('Pending Transaction Data (Next Line):');
            console.log(pending_transaction_data);

            if (pending_transaction_data.length === 0) {
                throw new Error('Pending transaction not found');
            }

            console.log('Creating Verified Transaction...');
            const create_output = await db.insert(verifiedTransactionsTable).values({
                piece_db_id: parseInt(metadata.product_id),
                full_name: metadata.full_name,
                piece_title: pending_transaction_data[0].piece_title,
                phone: pending_transaction_data[0].phone,
                email: pending_transaction_data[0].email,
                address: pending_transaction_data[0].address,
                international: pending_transaction_data[0].international,
                image_path: metadata.image_path,
                image_width: parseInt(metadata.image_width),
                image_height: parseInt(metadata.image_height),
                date: new Date(),
                stripe_id: stripe_id,
                price: parseInt(metadata.price_id),
            });

            console.log('Pending Transaction Create Output (Next Line):');
            console.log(create_output);

            console.log('Setting Piece As Sold...');
            const update_output = await db
                .update(piecesTable)
                .set({ sold: true })
                .where(eq(piecesTable.id, parseInt(metadata.product_id)));

            console.log('Set Sold Update Output (Next Line):');
            console.log(update_output);
        } else {
            console.warn(`Unhandled Stripe event type: ${event.type} |  Data (Next Line):`);
            const unhandled_data = stripeEvent.data.object;
            console.log(unhandled_data);
        }
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), { status: 400 });
    }

    return new Response(JSON.stringify({ received: true }));
}
