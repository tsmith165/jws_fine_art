// File: /app/api/checkout/webhook/route.ts

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
    console.log('Received Stripe Webhook Request');
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

        console.log('Stripe Event:', event);

        const stripeEvent = event as unknown as WebhookEvent;
        const metadata = stripeEvent.data.object.metadata;
        const stripeId = stripeEvent.data.object.id;

        console.log(`ID: ${stripeId}`);
        console.log(`Metadata:`, metadata);

        if (event.type === 'payment_intent.payment_failed') {
            // Handle unsuccessful payment
            console.log('Payment Unsuccessful. Handle unverified transaction (no current handling)...');
        } else if (event.type === 'payment_intent.succeeded') {
            // Handle successful payment
            console.log('Payment Successful! Creating Verified Transaction...');

            console.log(`Querying pending transactions for Piece DB ID: ${metadata.product_id} | Full Name: ${metadata.full_name}`);
            const pendingTransactionData = await db
                .select()
                .from(pendingTransactionsTable)
                .where(eq(pendingTransactionsTable.piece_db_id, parseInt(metadata.product_id, 10)))
                .where(eq(pendingTransactionsTable.full_name, metadata.full_name))
                .limit(1);

            console.log('Pending Transaction Data:', pendingTransactionData);

            if (pendingTransactionData.length === 0) {
                throw new Error('Pending transaction not found');
            }

            console.log('Creating Verified Transaction...');
            const createOutput = await db.insert(verifiedTransactionsTable).values({
                piece_db_id: parseInt(metadata.product_id, 10),
                full_name: metadata.full_name,
                piece_title: pendingTransactionData[0].piece_title,
                phone: pendingTransactionData[0].phone,
                email: pendingTransactionData[0].email,
                address: pendingTransactionData[0].address,
                international: pendingTransactionData[0].international,
                image_path: metadata.image_path,
                image_width: parseInt(metadata.image_width, 10),
                image_height: parseInt(metadata.image_height, 10),
                date: new Date(),
                stripe_id: stripeId,
                price: parseInt(metadata.price_id, 10),
            });

            console.log('Pending Transaction Create Output:', createOutput);

            console.log('Setting Piece As Sold...');
            const updateOutput = await db
                .update(piecesTable)
                .set({ sold: true })
                .where(eq(piecesTable.id, parseInt(metadata.product_id, 10)));

            console.log('Set Sold Update Output:', updateOutput);
        } else {
            console.warn(`Unhandled Stripe event type: ${event.type}`);
            const unhandledData = stripeEvent.data.object;
            console.log('Unhandled Event Data:', unhandledData);
        }
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), { status: 400 });
    }

    return new Response(JSON.stringify({ received: true }));
}
