import PROJECT_CONSTANTS from '@/lib/constants';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { create_pending_transaction, create_stripe_checkout_session } from '@/lib/api_calls';

import PageLayout from '@/components/layout/PageLayout';

import styles from '@/styles/pages/Details.module.scss';
import form_styles from '@/styles/forms/CheckoutForm.module.scss';

import CircularProgress from '@mui/material/CircularProgress';

import PlacesAutocomplete from 'react-places-autocomplete';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
    'pk_live_51IxP3oAuEqsFZjntawC5wWgSCTRmnkkxJhlICQmU8xH03qoS7mp2Dy7DHvKMb8uwPwxkf4sVuER5dqaLESIV3Urm00f0Hs2jsj',
);
const libraries = ['places'];

class Checkout extends React.Component {
    constructor(props) {
        super(props);

        this.router = props.router;

        console.log(`ID PROP: ${this.props.id}`);
        const passed_o_id = this.props.id;

        const piece_list = this.props.piece_list;
        const piece_list_length = piece_list.length;

        console.log(`getServerSideProps piece_list length: ${piece_list_length} | Data (Next Line):`);
        console.log(piece_list);

        var current_piece = null;
        var piece_position = 0;
        var piece_db_id = null;
        var piece_o_id = props.id;

        for (var i = 0; i < piece_list.length; i++) {
            if (piece_list[i]['o_id'].toString() == passed_o_id.toString()) {
                piece_position = i;
            }
        }

        var title = '';
        var type = '';
        var description = '';
        var sold = false;
        var price = 9999;
        var width = '';
        var height = '';
        var real_width = '';
        var real_height = '';
        var image_path = '';
        var instagram = '';
        var image_jsx = null;

        if (piece_position > 0) {
            const current_piece = piece_list[piece_position];

            piece_db_id = current_piece['id'] !== undefined ? current_piece['id'] : '';
            piece_o_id = current_piece['o_id'] !== undefined ? current_piece['o_id'] : '';
            title = current_piece['title'] !== undefined ? current_piece['title'] : '';
            type = current_piece['type'] !== undefined ? current_piece['type'] : 'Oil On Canvas';
            sold = current_piece['sold'] !== undefined ? current_piece['sold'] : 'False';
            description = current_piece['description'] !== undefined ? current_piece['description'] : '';
            price = current_piece['price'] !== undefined ? current_piece['price'] : '';
            width = current_piece['width'] !== undefined ? current_piece['width'] : '';
            height = current_piece['height'] !== undefined ? current_piece['height'] : '';
            real_width = current_piece['real_width'] !== undefined ? current_piece['real_width'] : '';
            real_height = current_piece['real_height'] !== undefined ? current_piece['real_height'] : '';
            image_path =
                current_piece['image_path'] !== undefined
                    ? `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${current_piece['image_path']}`
                    : '';
            instagram = current_piece['instagram'] !== undefined ? current_piece['instagram'] : '';

            image_jsx = (
                <div key={`image_${i}`} className={styles.details_image_container}>
                    <Image
                        id={`details_image_${i}`}
                        className={styles.details_image}
                        src={`${PROJECT_CONSTANTS.AWS_BUCKET_URL}${current_piece['image_path']}`}
                        alt={current_piece['title']}
                        // height={this.state.piece_details['height']}
                        priority={i > piece_position - 3 && i < piece_position + 3 ? true : false}
                        layout="fill"
                        objectFit="contain"
                        quality={100}
                        onClick={(e) => {
                            e.preventDefault();
                            this.setState({ full_screen: !this.state.full_screen });
                        }}
                    />
                </div>
            );
        }

        this.state = {
            debug: false,
            loading: true,
            url_o_id: passed_o_id,
            piece_list: piece_list,
            current_piece: current_piece,
            piece_position: piece_position,
            piece_db_id: piece_db_id,
            piece_o_id: piece_o_id,
            image_jsx: image_jsx,
            piece_details: {
                title: title,
                type: type,
                description: description,
                sold: sold,
                price: price,
                width: width,
                height: height,
                real_width: real_width,
                real_height: real_height,
                image_path: image_path,
                instagram: instagram,
            },
            description: description,
            price: price,
            address: '',
            international: false,
            error: '',
            error_found: false,
        };

        this.address_change = this.address_change.bind(this);
        this.check_fields = this.check_fields.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async componentDidMount() {
        this.setState({ loading: false });
    }

    async address_change(updated_address) {
        console.log(updated_address);
        console.log(typeof updated_address);
        if (typeof updated_address === 'string') {
            var is_international = true;
            if (updated_address.toString().includes('USA')) is_international = false;

            console.log(`Address: ${updated_address}`);
            console.log(`International: ${is_international}`);

            this.setState({ address: updated_address, international: is_international });
        }
    }

    async check_fields(field_array) {
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
        this.setState({ ...this.state, error: error_found, error_reason: error_reason });
        return error_found;
    }

    async handleSubmit(event) {
        event.preventDefault();

        console.log('Checkout Form Submit Recieved');

        this.setState({ loading: true, submitted: false });

        // capture data from form
        const full_name = event.target.elements.full_name.value;
        const phone = event.target.elements.phone.value;
        const email = event.target.elements.email.value;

        console.log(`Full Name: ${full_name} | Phone Number: ${phone} | E-Mail: ${email} `);
        console.log(`Address: ${this.state.address} | International: ${this.state.international}`);

        const error_found = await this.check_fields([
            ['Full Name', full_name, 3],
            ['Email', email, 8],
            ['Phone', phone, 6],
            ['Address', this.state.address, 10],
        ]);

        if (error_found) {
            console.error(`Could not check out due to an error...`);
            return;
        }

        console.log('Attempting to Check Out...');

        console.log('Creating a Pending Transaction ...');
        const pending_response = await create_pending_transaction(
            this.state.piece_db_id,
            this.state.piece_details['title'],
            full_name,
            phone,
            email,
            this.state.address,
            this.state.international,
        );

        console.log(`Pending Transaction Response (Next Line):`);
        console.log(pending_response);

        if (!pending_response) {
            console.error('No Response From Create Pending Transaction.  Cannot check out...');
            return;
        }

        // Create Stripe Checkout Session
        console.log(
            `Creating a Stripe Checkout Session with image: ${`${PROJECT_CONSTANTS.AWS_BUCKET_URL}${this.state.current_piece['image_path']}`}`,
        );
        const stripe_response = await create_stripe_checkout_session(
            this.state.piece_db_id,
            this.state.piece_details['title'],
            `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${this.state.current_piece['image_path']}`,
            this.state.piece_details['width'],
            this.state.piece_details['height'],
            this.state.piece_details['price'],
            full_name,
            phone,
            email,
            this.state.address,
            this.state.international,
        );
        const json = await stripe_response.json();

        console.log(`Creating Stripe Checkout Session Response JSON (Next Line):`);
        console.log(json);

        const session = json;

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

        this.setState({ loading: false });
    }

    render() {
        console.log('CURRENT PIECE DETAILS (Next Line):');
        console.log(this.state.piece_details);

        var loader_jsx = null;
        if (this.state.loading == true) {
            loader_jsx = <CircularProgress color="inherit" className={form_styles.loader} />;
        } else if (this.state.submitted == true) {
            loader_jsx = <div className={form_styles.submit_label}>Piece Details Update was successful...</div>;
        } else if (this.state.error == true) {
            loader_jsx = (
                <div className={form_styles.submit_label_failed}>Piece Details Update was NOT successful...</div>
            );
        } else if (this.state.uploaded == true) {
            loader_jsx = <div className={form_styles.submit_label}>Image Upload was successful...</div>;
        } else if (this.state.upload_error == true) {
            loader_jsx = <div className={form_styles.submit_label_failed}>Image Upload was NOT successful...</div>;
        }

        const title = this.state.piece_details['title'] != null ? this.state.piece_details['title'] : '';
        return (
            <PageLayout page_title={title == '' ? `` : `Checkout - ${title}`} use_maps_api={true}>
                <div className={styles.details_container}>
                    <div className={styles.details_container_left}>
                        <div className={styles.details_image_outer_container}>
                            <div className={styles.details_image_container}>{this.state.image_jsx}</div>
                        </div>
                    </div>
                    <div className={styles.details_container_right}>
                        <div className={form_styles.checkout_form_container}>
                            <form method="post" onSubmit={this.handleSubmit}>
                                {/* Title Container */}
                                <div className={form_styles.checkout_title_container}>
                                    <div className={form_styles.title}>{title == '' ? `` : `"${title}"`}</div>
                                </div>

                                {/* Address Autocomplete Input */}
                                {!this.state.loading ? (
                                    <PlacesAutocomplete
                                        value={this.state.address}
                                        onChange={this.address_change}
                                        onSelect={this.address_change}
                                    >
                                        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                                            <div className={form_styles.autocomplete_container}>
                                                <div className={form_styles.input_container_autocomplete}>
                                                    <div className={form_styles.input_label_container}>
                                                        <b className={form_styles.input_label}>Address</b>
                                                    </div>
                                                    <input
                                                        {...getInputProps({
                                                            placeholder: 'Enter Address...',
                                                            className: `${form_styles.input_autocomplete}`,
                                                            autoComplete: 'rutjfkde',
                                                        })}
                                                    />
                                                </div>
                                                <div className={form_styles.autocomplete_dropdown_container}>
                                                    {suggestions.map((suggestion) => {
                                                        // inline style for demonstration purpose
                                                        const style = suggestion.active
                                                            ? { backgroundColor: '#42a5f5', cursor: 'pointer' }
                                                            : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                                        return (
                                                            <div
                                                                key={suggestion.placeId}
                                                                className={form_styles.input_suggestion}
                                                                {...getSuggestionItemProps(suggestion, { style })}
                                                            >
                                                                {suggestion.description}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </PlacesAutocomplete>
                                ) : null}

                                {/* Full Name Container */}
                                <div className={form_styles.input_container}>
                                    <div className={form_styles.input_label_container}>
                                        <div className={form_styles.input_label}>Full Name</div>
                                    </div>
                                    <input
                                        id="full_name"
                                        className={form_styles.input_textbox}
                                        placeholder={`Enter Full Name...`}
                                        autoComplete="off"
                                    />
                                </div>

                                {/* Phone Number Container */}
                                <div className={form_styles.input_container}>
                                    <div className={form_styles.input_label_container}>
                                        <div className={form_styles.input_label}>Phone #</div>
                                    </div>
                                    <input
                                        id="phone"
                                        className={form_styles.input_textbox}
                                        placeholder={`Enter Phone Number...`}
                                        autoComplete="off"
                                    />
                                </div>

                                {/* Email Container */}
                                <div className={form_styles.input_container}>
                                    <div className={form_styles.input_label_container}>
                                        <div className={form_styles.input_label}>Email</div>
                                    </div>
                                    <input
                                        id="email"
                                        className={form_styles.input_textbox}
                                        placeholder={`Enter Email Address...`}
                                        autoComplete="off"
                                    />
                                </div>

                                <div className={form_styles.submit_container}>
                                    <div className={form_styles.price_label}>{`$${this.state.price}`}</div>

                                    <button type="submit" className={form_styles.submit_button}>
                                        Checkout
                                    </button>

                                    <div className={form_styles.loader_container}>{loader_jsx}</div>
                                </div>
                                <div className={form_styles.submit_container}>
                                    <Link href="https://stripe.com">
                                        <Image
                                            src="/powered_by_stripe_blue_background_small.png"
                                            alt="View Stripe Info"
                                            priority={true}
                                            width={150}
                                            height={50}
                                        />
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </PageLayout>
        );
    }
}

export default Checkout;
