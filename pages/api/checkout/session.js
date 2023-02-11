//import { NextApiRequest, NextApiResponse } from "next";
//import { prisma } from "../../../lib/prisma";

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";
const YOUR_DOMAIN = `https://jwsfineart.com`;

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
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

            const attrs_to_check = ['piece_db_id', 'piece_title', 'image_path', 'width', 'height', 'price', 'full_name', 'phone', 'email', 'address', 'international' ]
            var attr_errors_found = false
            for (var i = 0; i < attrs_to_check.length; i++) {
                let attr = attrs_to_check[i]
                if (passed_json[attr] == undefined) {
                    console.error(`Failed to pass in attribute: ${attr}`)
                    attr_errors_found = true
                }
            }

            if (attr_errors_found) {
                console.error("Request.body not fully passed in.  Exit status: 406")
                res.status(406)
                res.end()
            }

            // Create Stripe Session

            const piece_db_id   = passed_json.piece_db_id;
            const piece_title   = passed_json.piece_title;
            const image_path    = passed_json.image_path;
            const width         = passed_json.width;
            const height        = passed_json.height;
            const price         = passed_json.price;
            const full_name     = passed_json.full_name;
            const phone         = passed_json.phone;
            const email         = passed_json.email;
            const address       = passed_json.address;
            const international = passed_json.international;

            var price_int = parseInt(price.toString().replace("$",""))
            const converted_price = `${price_int}00`;

            if (international == true || international == 'true') {
                console.log(`Adding $30 to current price of ${price_int}`)
                price_int = price_int + 30;
                console.log(`Price after adding international shipping: ${price_int}`)
            }

            var full_image_url = `${image_path}`
            console.log(`Piece Title: ${piece_title} | Price: ${converted_price} | Image Path: ${full_image_url}`)

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
                    }
                ],
                payment_intent_data: {
                    metadata: {
                        product_id: piece_db_id,
                        full_name: full_name,
                        price_id: price,
                        image_path: full_image_url,
                        image_width: width,
                        image_height: height
        
                    }
                },
                mode: 'payment',
                success_url: `${YOUR_DOMAIN}/success/${piece_db_id}`,
                cancel_url: `${YOUR_DOMAIN}/cancel/${piece_db_id}`,
            }

            console.log("Attempting to create checkout session with following params (Next Line):")
            console.log(params)
            const checkout_session = await stripe.checkout.sessions.create(params);

            console.log(`Session ID: ${checkout_session.id}`)
        
            res.status(200).json({ id: checkout_session.id });
        }
    }
  res.end()
}
