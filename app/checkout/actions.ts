'use server';
import { prisma } from '@/lib/prisma';
import PROJECT_CONSTANTS from '@/lib/constants';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2020-08-27',
});
const INTERNATIONAL_SHIPPING_RATE = 25;

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

    const piece = await prisma.piece.findUnique({
        where: { id: parseInt(piece_id) },
    });

    if (!piece) {
        throw new Error('Piece not found');
    }

    console.log('Creating a Pending Transaction ...');
    const pending_response = await create_pending_transaction(piece.id, piece.title, full_name, phone, email, address, is_international);

    console.log(`Pending Transaction Response (Next Line):`);
    console.log(pending_response);

    if (!pending_response) {
        console.error('No Response From Create Pending Transaction.  Cannot check out...');
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
        success_url: `${PROJECT_CONSTANTS.LOCAL_SITE_URL}/checkout/success`,
        cancel_url: `${PROJECT_CONSTANTS.LOCAL_SITE_URL}/checkout/cancel/${piece.id}`,
        client_reference_id: piece.id.toString(),
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
    const pending_transaction_output = await prisma.pending.create({
        data: {
            piece_db_id,
            piece_title,
            full_name,
            phone,
            email,
            address,
            international,
        },
    });
    return pending_transaction_output;
}
