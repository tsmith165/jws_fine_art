import PROJECT_CONSTANTS from '@/lib/constants';
import { prisma } from '@/lib/prisma';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    const passed_json = await req.json();

    if (!passed_json) {
        console.error(`Request body is undefined`);
        return Response.json({ error: "Request body is undefined" }, { status: 400 });
    }

    console.log('Checkout Session Passed JSON: ', passed_json)

    const attrs_to_check = [
        'piece_db_id',
        'piece_title',
        'image_path',
        'width',
        'height',
        'price',
        'full_name',
        'phone',
        'email',
        'address',
        'international',
    ];
    const missingAttrs = attrs_to_check.filter(attr => passed_json[attr] === undefined);

    if (missingAttrs.length > 0) {
        console.error('Request.body not fully passed in. Missing attributes:', missingAttrs.join(', '));
        return Response.json({ error: `Missing attributes: ${missingAttrs.join(', ')}` }, { status: 406 });
    }

    // Create Stripe Session
    const piece_db_id = passed_json.piece_db_id;
    const piece_o_id = passed_json.piece_o_id;
    const piece_title = passed_json.piece_title;
    const image_path = passed_json.image_path;
    const width = passed_json.width;
    const height = passed_json.height;
    const price = passed_json.price;
    const full_name = passed_json.full_name;
    const phone = passed_json.phone;
    const email = passed_json.email;
    const address = passed_json.address;
    const international = passed_json.international;

    const piece_info_from_db = await prisma.piece.findFirst({
        where: { id: parseInt(piece_db_id) },
    });

    console.log('Piece Info from DB:', piece_info_from_db);
    const price_from_db = piece_info_from_db.price;

    var price_int = parseInt(price_from_db.toString().replace('$', ''));

    if (international == true || international == 'true') {
        console.log(`Adding $30 to current price of ${price_int}`);
        price_int = price_int + 30;
        console.log(`Price after adding international shipping: ${price_int}`);
    }

    const converted_price = `${price_int}00`;
    console.log('Using price from DB: ', converted_price);

    var full_image_url = `${image_path}`;
    console.log(`Piece Title: ${piece_title} | Price: ${converted_price} | Image Path: ${full_image_url}`);

    const success_url = `https://${PROJECT_CONSTANTS.SITE_URL}/checkout/success/${piece_o_id}`;
    const cancel_url = `https://${PROJECT_CONSTANTS.SITE_URL}/checkout/cancel/${piece_o_id}`;

    console.log(`Using success_url: ${success_url}`);
    console.log(`Using cancel_url: ${cancel_url}`);

    const params = {
        payment_method_types: ['card'],
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: piece_title,
                        images: [full_image_url],
                    },
                    unit_amount: converted_price,
                },
            },
        ],
        payment_intent_data: {
            metadata: {
                product_id: piece_db_id,
                full_name: full_name,
                price_id: price,
                image_path: full_image_url,
                image_width: width,
                image_height: height,
            },
        },
        mode: 'payment',
        success_url: success_url,
        cancel_url: cancel_url,
    };

    console.log('Attempting to create checkout session with following params (Next Line):');
    console.log(params);

    const checkout_session = await stripe.checkout.sessions.create(params);

    console.log(`Session ID: ${checkout_session.id}`);

    return Response.json({ id: checkout_session.id });
}
