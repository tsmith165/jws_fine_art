'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import NextImage from 'next/image';

import { loadStripe } from '@stripe/stripe-js';
import { useLoadScript } from '@react-google-maps/api';
import CircularProgress from '@mui/material/CircularProgress';

import logger from '@/lib/logger';
import PROJECT_CONSTANTS from '@/lib/constants';
import { create_pending_transaction, create_stripe_checkout_session, fetchDiscountRate } from '@/lib/api_calls';
import { handleButtonLabelClickGTagEvent } from '@/lib/analytics';

import InputComponent from '@/components/wrappers/InputComponent';

const stripePromise = loadStripe(
    'pk_live_51IxP3oAuEqsFZjntawC5wWgSCTRmnkkxJhlICQmU8xH03qoS7mp2Dy7DHvKMb8uwPwxkf4sVuER5dqaLESIV3Urm00f0Hs2jsj',
);
const INTERNATIONAL_SHIPPING_RATE = 25;

const Checkout = (props) => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: 'AIzaSyAQTCNGxtlglxAOC-CjqhKc2nroYKmPS7s',
        libraries: ['places'],
    });

    const router = useRouter();
    const pathname = usePathname();
    const passed_o_id = pathname.split('/').slice(-1)[0];
    console.log(`LOADING CHECKOUT PAGE - Piece ID: ${passed_o_id}`);

    // State initializations and other necessary logic...
    const piece_list = props.piece_list;
    const num_pieces = piece_list.length;

    console.log(`getServerSideProps piece_list length: ${num_pieces} | Data (Next Line):`);
    console.log(piece_list);

    var piece_position = 0;
    for (var i = 0; i < piece_list.length; i++) {
        if (piece_list[i]['o_id'].toString() == passed_o_id.toString()) {
            console.log(`Found piece at position ${i} | o_id: ${piece_list[i]['o_id']} | passed_o_id: ${passed_o_id}`);
            piece_position = i;
        }
    }
    var current_piece = piece_list[piece_position];

    /* prettier-ignore-start */
    var db_id = num_pieces < 1 ? -1 : current_piece.id !== undefined ? current_piece.id : -1;
    var o_id = num_pieces < 1 ? '' : current_piece.o_id !== undefined ? current_piece.o_id : '';
    var title = num_pieces < 1 ? '' : current_piece.title !== undefined ? current_piece.title : '';
    var price = num_pieces < 1 ? '' : current_piece.price !== undefined ? current_piece.price : '';
    var width = num_pieces < 1 ? '' : current_piece.width !== undefined ? current_piece.width : '';
    var height = num_pieces < 1 ? '' : current_piece.height !== undefined ? current_piece.height : '';
    var piece_type = num_pieces < 1 ? '' : current_piece.piece_type !== undefined ? current_piece.piece_type : piece_type;
    var real_width = num_pieces < 1 ? '' : current_piece.real_width !== undefined ? current_piece.real_width : '';
    var real_height = num_pieces < 1 ? '' : current_piece.real_height !== undefined ? current_piece.real_height : '';
    var image_path =
        num_pieces < 1
            ? ''
            : current_piece.image_path !== undefined
            ? `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${current_piece.image_path}`
            : '';
    var instagram = num_pieces < 1 ? '' : current_piece.instagram !== undefined ? current_piece.instagram : '';
    /* prettier-ignore-end */

    const [state, setState] = useState({
        window_width: null,
        window_height: null,
        debug: false,
        loading: true,
        url_o_id: passed_o_id,
        piece_list: piece_list,
        current_piece: current_piece,
        piece_position: piece_position,
        db_id: db_id,
        o_id: o_id,
        width: width,
        height: height,
        title: title,
        price: price,
        instagram: instagram,
        price: price,
        address: '',
        international: null,
        error: '',
        error_found: false,
        discount_rate: 0.0,
    });

    useEffect(() => {
        const handleResize = () => {
            console.log(`Window Width: ${window.innerWidth} | Height: ${window.innerHeight}`);
            setState({
                ...state,
                window_width: window.innerWidth,
                window_height: window.innerHeight,
            });
        };

        const fetchDiscountRateAsync = async () => {
            const response = await fetchDiscountRate();
            console.log(`Discount Rate: ${response}`);
            setState((prevState) => ({ ...prevState, discount_rate: response }));
        };
        fetchDiscountRateAsync();

        window.addEventListener('resize', handleResize);

        const piece_position = state.piece_position;

        console.log(`Setting state with Piece Position: ${state.piece_position}`);
        setState({
            ...state,
            loading: false,
            window_width: window.innerWidth,
            window_height: window.innerHeight,
        });

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const address_change = (updated_address) => {
        if (typeof updated_address === 'string') {
            var is_international = true;
            if (updated_address.toString().includes('USA')) is_international = false;

            console.log(`Updating Address: ${updated_address} | International: ${is_international}`);
            setState((prevState) => ({ ...prevState, address: updated_address, international: is_international }));
        }
    };

    const check_fields = (field_array) => {
        var error_found = false;
        var error_reason = '';
        for (var i = 0; i < field_array.length; i++) {
            let field_name = field_array[i][0];
            let field_value = field_array[i][1];
            let field_lenth = field_value.toString().length;
            let min_length = field_array[i][2];

            if (field_lenth < min_length) {
                error_reason = `${field_name} requirement not met.  Please enter valid ${field_name} with length > ${min_length}...`;
                console.error(error_reason);
                error_found = true;
            }
        }
        setState((prevState) => ({ ...prevState, error: error_found, error_reason: error_reason }));
        return error_found;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        console.log('Checkout Form Submit Recieved');

        setState((prevState) => ({ ...prevState, loading: true, submitted: false }));

        // capture data from form
        const full_name = event.target.elements.full_name.value;
        const phone = event.target.elements.phone.value;
        const email = event.target.elements.email.value;

        console.log(`Full Name: ${full_name} | Phone Number: ${phone} | E-Mail: ${email} `);
        console.log(`Address: ${state.address} | International: ${state.international}`);

        const error_found = await check_fields([
            ['Full Name', full_name, 3],
            ['Email', email, 8],
            ['Phone', phone, 6],
            ['Address', state.address, 10],
        ]);

        if (error_found) {
            console.error(`Could not check out due to an error...`);
            setState((prevState) => ({ ...prevState, loading: false, submitted: false, error_found: true }));
            return;
        }

        console.log('Attempting to Check Out...');

        console.log('Creating a Pending Transaction ...');
        const pending_response = await create_pending_transaction(
            state.db_id,
            state.title,
            full_name,
            phone,
            email,
            state.address,
            state.international,
        );

        console.log(`Pending Transaction Response (Next Line):`);
        console.log(pending_response);

        if (!pending_response) {
            console.error('No Response From Create Pending Transaction.  Cannot check out...');
            return;
        }

        console.log(`Creating stripe session with piece :`, state.current_piece);

        // Create Stripe Checkout Session
        console.log(
            `Creating a Stripe Checkout Session with image: ${`${PROJECT_CONSTANTS.AWS_BUCKET_URL}${state.current_piece['image_path']}`}`,
        );
        const price_with_shipping = state.price + (state.international == true ? INTERNATIONAL_SHIPPING_RATE : 0);

        const session = await create_stripe_checkout_session(
            state.db_id,
            state.o_id,
            state.title,
            `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${state.current_piece['image_path']}`,
            state.width,
            state.height,
            price_with_shipping,
            full_name,
            phone,
            email,
            state.address,
            state.international,
        );
        console.log(`Stripe Response :`, session);
        console.log(`Session ID: ${session.id}`);

        var redirect_to_stripe = true;
        if (redirect_to_stripe) {
            const stripe = await stripePromise;
            console.log('Stripe (Next Line):');
            console.log(stripe);

            const result = await stripe.redirectToCheckout({
                sessionId: session.id,
            });
            if (result.error) {
                // If `redirectToCheckout` fails due to a browser or network
                // error, display the localized error message to your customer
                // using `result.error.message`.
            }
        }

        setState((prevState) => ({ ...prevState, loading: false, submitted: true }));
    };

    const update_field_value = (field, new_value_object) => {
        const key_name = field.toLowerCase();
        const new_value = new_value_object.value;
        console.log(`Setting state on key: ${key_name} | Value: ${new_value}`);

        setState(
            (prevState) => ({ ...prevState, [key_name]: new_value }),
            () => console.log(`Updated key value: ${state[key_name]}`),
        );
    };

    // CHECK THAT GOOGLE MAPS API IS LOADED
    if (loadError) {
        return <div>Error loading Google Maps API: {loadError.message}</div>;
    }

    if (!isLoaded) {
        return <div>Loading Google Maps API...</div>;
    }

    // BEGIN RENDER JSX
    logger.extra(`Loading: ${state.loading} | Submitted: ${state.submitted}`);

    // Price Label JSX
    const price_with_shipping = state.price + (state.international == true ? INTERNATIONAL_SHIPPING_RATE : 0);
    const price_label = (
        <button
            type="submit"
            className={'flex flex-row rounded-md bg-dark'}
            onClick={() =>
                handleButtonLabelClickGTagEvent(
                    'checkout_purchase_button_click',
                    'Checkout Purchase Button',
                    'Checkout Purchase Button Clicked',
                )
            }
        >
            <NextImage
                className={'p-2.5'}
                src="/stripe_purchase_tan-221_50.png"
                alt="View Stripe Info"
                priority={true}
                width={133}
                height={30}
            />
            {state.discount_rate > 0.0 ? (
                <div className="group flex flex-row space-x-2.5 rounded-r-md bg-primary px-2.5 hover:bg-dark hover:text-primary">
                    <div className={`py-2.5 text-lg font-bold text-dark line-through decoration-red-500  group-hover:text-primary`}>
                        {`$${price_with_shipping}`}
                    </div>
                    <div className={`py-2.5 text-lg font-bold text-red-500 `}>
                        {`$${price_with_shipping - price_with_shipping * state.discount_rate}`}
                    </div>
                </div>
            ) : (
                <div className={`p-2.5 text-lg font-bold text-dark hover:text-primary`}>{`$${price_with_shipping}`}</div>
            )}
        </button>
    );

    // Shipping Message JSX
    const shipping_jsx =
        state.international != null ? (
            <div className={'flex flex-wrap'}>
                {state.international == true ? (
                    <div className={'mr-2.5 mt-2.5 text-xl text-primary'}>
                        Pieces ship within 5 days. International shipping costs $25 and can take up to 1 month.
                    </div>
                ) : (
                    <div className={'mr-2.5 mt-2.5 text-xl text-primary'}>
                        Pieces ship within 5 days. Domestic shipping can take up to a week.
                    </div>
                )}
            </div>
        ) : null;

    const submit_loader_spinner = <CircularProgress color="inherit" className={''} />;
    const submit_successful_jsx = <div className={'text-lg font-bold leading-8 text-light'}>Checkout submit successful.</div>;
    const submit_unsuccessful_jsx = <div className={'text-lg font-bold leading-8 text-red-700'}>Checkout submit was not successful.</div>;

    const loader_container =
        state.loading == true
            ? submit_loader_spinner
            : state.submitted == true
            ? submit_successful_jsx
            : state.error_found == true
            ? submit_unsuccessful_jsx
            : null;

    const submit_container = loader_container === null ? null : <div className={'flex flex-row px-2.5 py-4'}>{loader_container}</div>;

    return (
        <div className={'flex h-full w-full flex-col overflow-y-auto md:flex-row'}>
            <div className={'h-fit bg-dark md:h-full md:w-2/3'}>
                <div key={`image_${piece_position}`} className={'flex h-full items-center justify-center'}>
                    <NextImage
                        id={`centered_image_${piece_position}`}
                        className={'h-full w-full object-contain'}
                        src={`${PROJECT_CONSTANTS.AWS_BUCKET_URL}${state.current_piece.image_path}`}
                        alt={state.title}
                        priority={true}
                        width={state.width}
                        height={state.height}
                        quality={100}
                    />
                </div>
            </div>
            <div className={'h-fit bg-grey md:h-full md:w-1/3'}>
                <form method="post" onSubmit={handleSubmit} className={'flex !h-max w-full flex-col'}>
                    <div className={'flex w-full justify-center bg-light p-0'}>
                        <div className={'py-4 text-2xl font-bold text-dark'}>{state.title == '' ? `` : `"${state.title}"`}</div>
                    </div>
                    <div className="h-full w-full space-y-2.5 p-2.5">
                        <div className={'flex h-fit w-full flex-wrap'}>
                            <InputComponent input_type="input_autocomplete" value={state.address} address_change={address_change} />
                        </div>

                        <div className={'flex h-fit w-full flex-wrap'}>
                            <InputComponent
                                input_type="input_textbox"
                                name="Full Name"
                                id="full_name"
                                placeholder="Enter Full Name..."
                                update_field_value={update_field_value}
                            />
                        </div>

                        <div className={'flex h-fit w-full flex-wrap'}>
                            <InputComponent
                                input_type="input_textbox"
                                name="Phone #"
                                id="phone"
                                placeholder="Enter Phone Number..."
                                update_field_value={update_field_value}
                            />
                        </div>

                        <div className={'flex h-fit w-full flex-wrap'}>
                            <InputComponent
                                input_type="input_textbox"
                                name="Email"
                                id="email"
                                placeholder="Enter Email Address..."
                                update_field_value={update_field_value}
                            />
                        </div>

                        <div className={'flex flex-row flex-wrap'}>
                            {price_label}
                            {shipping_jsx}
                        </div>

                        {submit_container}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
