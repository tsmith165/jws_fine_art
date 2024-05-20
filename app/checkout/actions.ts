'use server';
import { db, piecesTable, pendingTransactionsTable } from '@/db/db';
import { eq, desc, sql } from 'drizzle-orm';

import PROJECT_CONSTANTS from '@/lib/constants';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-04-10',
});
const INTERNATIONAL_SHIPPING_RATE = 25;

interface MaxIdResult {
    value: number | null;
}

export async function runStripePurchase(data: FormData) {
    const piece_id = data.get('piece_id')?.toString();
    const full_name = data.get('full_name')?.toString() || '';
    const phone = data.get('phone')?.toString() || '';
    const email = data.get('email')?.toString() || '';
    const address = data.get('address')?.toString() || '';
    const is_international = address.includes('USA') ? false : true;

    if (!piece_id) {
        throw new Error('Piece ID is required');
    }

    const piece_data = await db
        .select()
        .from(piecesTable)
        .where(eq(piecesTable.id, parseInt(piece_id)))
        .orderBy(desc(piecesTable.o_id))
        .limit(1);

    if (!piece_data.length) {
        throw new Error('Piece not found');
    }
    const piece = piece_data[0];

    console.log('Creating a Pending Transaction ...');
    const pending_response = await create_pending_transaction(piece.id, piece.title, full_name, phone, email, address, is_international);

    console.log(`Pending Transaction Response (Next Line):`);
    console.log(pending_response);

    if (!pending_response) {
        console.error('No Response From Create Pending Transaction. Cannot check out...');
        return;
    }

    console.log(`Creating stripe session with piece:`, piece);

    // Create Stripe Checkout Session
    console.log(`Creating a Stripe Checkout Session with image: ${piece.image_path}`);
    const price_with_shipping = piece.price + (is_international ? INTERNATIONAL_SHIPPING_RATE : 0);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    unit_amount: price_with_shipping * 100, // Amount in cents
                    product_data: {
                        name: piece.title,
                        images: [piece.image_path],
                    },
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `https://${PROJECT_CONSTANTS.SITE_URL}/checkout/success/${piece.id}`,
        cancel_url: `https://${PROJECT_CONSTANTS.SITE_URL}/checkout/cancel/${piece.id}`,
        client_reference_id: piece.id.toString(),
        metadata: {
            product_id: piece.id.toString(),
            full_name: full_name,
            image_path: piece.image_path,
            image_width: piece.width.toString(),
            image_height: piece.height.toString(),
            price_id: piece.price.toString(),
        },
    });

    console.log(`Stripe Response:`, session);
    console.log(`Session ID: ${session.id}`);

    return {
        success: true,
        redirectUrl: session.url,
    };
}

export async function create_pending_transaction(
    piece_db_id: number,
    piece_title: string,
    full_name: string,
    phone: string,
    email: string,
    address: string,
    international: boolean,
) {
    console.log(`Attempting to create pending transaction for piece_db_id: ${piece_db_id}`);
    // Fetch the current maximum ID from the PendingTransactions table
    const maxIdResult: MaxIdResult[] = await db
        .select({ value: sql`max(${pendingTransactionsTable.id})`.mapWith(Number) })
        .from(pendingTransactionsTable);

    const maxId = maxIdResult[0].value ?? 0; // If max_id is null, set it to 0

    // Calculate the next ID
    const nextId = maxId + 1;

    // Insert the new record with the next ID
    const pending_transaction_output = await db.insert(pendingTransactionsTable).values({
        id: nextId,
        piece_db_id,
        piece_title,
        full_name,
        phone,
        email,
        address,
        international,
    });
    return pending_transaction_output;
}
