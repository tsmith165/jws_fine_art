import logger from '@/lib/logger';
import PROJECT_CONSTANTS from '@/lib/constants';

import React from 'react';
import NextImage from 'next/image';

import { create_pending_transaction, create_stripe_checkout_session } from '@/lib/api_calls';

import PageLayout from '@/components/layout/PageLayout';
import InputComponent from '@/components/components/InputComponent';

import mobile_styles from '@/styles/pages/DetailsMobile.module.scss';
import desktop_styles from '@/styles/pages/DetailsDesktop.module.scss';

import checkout_styles from '@/styles/pages/Checkout.module.scss';
import form_styles from '@/styles/forms/Form.module.scss';

import CircularProgress from '@mui/material/CircularProgress';

import { useLoadScript } from '@react-google-maps/api'; // Google Maps API

import { loadStripe } from '@stripe/stripe-js'; // Stripe API
const stripePromise = loadStripe(
    'pk_live_51IxP3oAuEqsFZjntawC5wWgSCTRmnkkxJhlICQmU8xH03qoS7mp2Dy7DHvKMb8uwPwxkf4sVuER5dqaLESIV3Urm00f0Hs2jsj',
);

class Checkout extends React.Component {
    constructor(props) {
        super(props);

        this.router = props.router;

        logger.debug(`ID PROP: ${this.props.id}`);
        const passed_o_id = this.props.id;

        const piece_list = this.props.piece_list;
        const num_pieces = piece_list.length;

        logger.debug(`getServerSideProps piece_list length: ${num_pieces} | Data (Next Line):`);
        logger.debug(piece_list);

        var piece_position = 0;
        for (var i = 0; i < piece_list.length; i++) {
            if (piece_list[i]['o_id'].toString() == passed_o_id.toString()) {
                logger.debug(
                    `Found piece at position ${i} | o_id: ${piece_list[i]['o_id']} | passed_o_id: ${passed_o_id}`,
                );
                piece_position = i;
            }
        }
        var current_piece = piece_list[piece_position];

        /* prettier-ignore-start */
        var db_id  = num_pieces < 1 ? -1 : current_piece.id    !== undefined  ? current_piece.id : -1;
        var o_id   = num_pieces < 1 ? '' : current_piece.o_id  !== undefined  ? current_piece.o_id : '';
        var title  = num_pieces < 1 ? '' : current_piece.title !== undefined  ? current_piece.title : '';
        var price  = num_pieces < 1 ? '' : current_piece.price !== undefined  ? current_piece.price : '';
        var width  = num_pieces < 1 ? '' : current_piece.width !== undefined  ? current_piece.width : '';
        var height = num_pieces < 1 ? '' : current_piece.height !== undefined ? current_piece.height : '';
        var piece_type  = num_pieces < 1 ? '' : current_piece.piece_type !== undefined ? current_piece.piece_type : piece_type;
        var real_width  = num_pieces < 1 ? '' : current_piece.real_width !== undefined ? current_piece.real_width : '';
        var real_height = num_pieces < 1 ? '' : current_piece.real_height !== undefined ? current_piece.real_height : '';
        var image_path  = num_pieces < 1 ? '' : current_piece.image_path !== undefined ? `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${current_piece.image_path}` : '';
        var instagram   = num_pieces < 1 ? '' : current_piece.instagram !== undefined ? current_piece.instagram : '';
        /* prettier-ignore-end */

        this.state = {
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
            image_jsx: null,
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
        };

        this.address_change = this.address_change.bind(this);
        this.check_fields = this.check_fields.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.update_field_value = this.update_field_value.bind(this);
    }

    async componentDidMount() {
        const styles = this.state.window_width < 769 ? mobile_styles : desktop_styles;
        const piece_position = this.state.piece_position;

        var image_jsx = piece_position < 0 ? null : (
            <div key={`image_${piece_position}`} className={styles.centered_image_container}>
                <NextImage
                    id={`centered_image_${piece_position}`}
                    className={styles.centered_image}
                    src={`${PROJECT_CONSTANTS.AWS_BUCKET_URL}${this.state.current_piece.image_path}`}
                    alt={this.state.title}
                    priority={true}
                    width={this.state.width}
                    height={this.state.height}
                    quality={100}
                />
            </div>
        )
       
        logger.debug(`Setting state with Piece Position: ${this.state.piece_position}`);
        this.setState({
            loading: false,
            window_width: window.innerWidth,
            window_height: window.innerHeight,
            image_jsx: image_jsx,
        });

        window.addEventListener("resize", this.handleResize); // Add event listener
    }

    handleResize() {
        logger.debug(`Window Width: ${window.innerWidth} | Height: ${window.innerHeight}`);
        this.setState({
            window_width: window.innerWidth,
            window_height: window.innerHeight
        });
    }


    async address_change(updated_address) {
        if (typeof updated_address === 'string') {
            var is_international = true;
            if (updated_address.toString().includes('USA')) is_international = false;

            logger.debug(`Updating Address: ${updated_address} | International: ${is_international}`);
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
                logger.error(error_reason);
                error_found = true;
            }
        }
        this.setState({ ...this.state, error: error_found, error_reason: error_reason });
        return error_found;
    }

    async handleSubmit(event) {
        event.preventDefault();

        logger.debug('Checkout Form Submit Recieved');

        this.setState({ loading: true, submitted: false }, async () => {
            // capture data from form
            const full_name = event.target.elements.full_name.value;
            const phone = event.target.elements.phone.value;
            const email = event.target.elements.email.value;

            logger.debug(`Full Name: ${full_name} | Phone Number: ${phone} | E-Mail: ${email} `);
            logger.debug(`Address: ${this.state.address} | International: ${this.state.international}`);

            const error_found = await this.check_fields([
                ['Full Name', full_name, 3],
                ['Email', email, 8],
                ['Phone', phone, 6],
                ['Address', this.state.address, 10],
            ]);

            if (error_found) {
                logger.error(`Could not check out due to an error...`);
                this.setState({ loading: false, submitted: false, error_found: true });
                return;
            }

            logger.debug('Attempting to Check Out...');

            logger.debug('Creating a Pending Transaction ...');
            const pending_response = await create_pending_transaction(
                this.state.db_id,
                this.state.title,
                full_name,
                phone,
                email,
                this.state.address,
                this.state.international,
            );

            logger.debug(`Pending Transaction Response (Next Line):`);
            logger.debug(pending_response);

            if (!pending_response) {
                logger.error('No Response From Create Pending Transaction.  Cannot check out...');
                return;
            }

            logger.debug(`Creating stripe session with piece (Next Line):\n${this.state.current_piece}`);

            // Create Stripe Checkout Session
            logger.debug(
                `Creating a Stripe Checkout Session with image: ${`${PROJECT_CONSTANTS.AWS_BUCKET_URL}${this.state.current_piece['image_path']}`}`,
            );
            const stripe_response = await create_stripe_checkout_session(
                this.state.db_id,
                this.state.o_id,
                this.state.title,
                `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${this.state.current_piece['image_path']}`,
                this.state.width,
                this.state.height,
                this.state.price,
                full_name,
                phone,
                email,
                this.state.address,
                this.state.international,
            );
            const json = await stripe_response.json();

            logger.debug(`Creating Stripe Checkout Session Response JSON (Next Line):`);
            logger.debug(json);

            const session = json;

            logger.debug(`Session ID: ${session.id}`);

            var redirect_to_stripe = true;
            if (redirect_to_stripe) {
                const stripe = await stripePromise;
                logger.debug('Stripe (Next Line):');
                logger.debug(stripe);

                const result = await stripe.redirectToCheckout({
                    sessionId: session.id,
                });
                if (result.error) {
                    // If `redirectToCheckout` fails due to a browser or network
                    // error, display the localized error message to your customer
                    // using `result.error.message`.
                }
            }

            this.setState({ loading: false, submitted: true });
        });
    }

    async update_field_value(field, new_value_object) {
        const key_name = field.toLowerCase();
        const new_value = new_value_object.value;
        logger.debug(`Setting state on key: ${key_name} | Value: ${new_value}`);

        this.setState(prevState => ({ ...prevState, [key_name]: new_value }), () => logger.debug(`Updated key value: ${this.state[key_name]}`));
    }

    render() {

        logger.debug(`Loading: ${this.state.loading} | Submitted: ${this.state.submitted}`)

        const styles = this.state.window_width < 769 ? mobile_styles : desktop_styles;

        // Main Image Container JSX
        const image_container = (
            <div className={styles.centered_image_outer_container}>
                <div className={styles.centered_image_container}>{this.state.image_jsx}</div>
            </div>
        );
        
        // Title Container JSX
        const title_container = (
            <div className={checkout_styles.checkout_title_container}>
                <div className={checkout_styles.title}>{this.state.title == '' ? `` : `"${this.state.title}"`}</div>
            </div>
        );
        
        // Price Label JSX
        const price_label = (
            <button type="submit" className={checkout_styles.price_wrapper}>
                <div className={checkout_styles.price_label_wrapper}>
                    <NextImage
                        className={checkout_styles.price_label_stripe_image}
                        src="/stripe_checkout_tan-221_50.png"
                        alt="View Stripe Info"
                        priority={true}
                        width={133}
                        height={30}
                    />
                </div>
                <div className={checkout_styles.price_text}>{`$${this.state.price}`}</div>
            </button>
        );
        
        // Shipping Message JSX
        const shipping_jsx = this.state.international != null ? (
            <div className={checkout_styles.checkout_shipping_container}>
                {this.state.international == true ? (
                    <div className={checkout_styles.checkout_shipping_label}>
                        Pieces ship within 5 days. International shipping can take up to 1 month.
                    </div>
                ) : (
                    <div className={checkout_styles.checkout_shipping_label}>
                        Pieces ship within 5 days. Domestic shipping can take up to a week.
                    </div>
                )}
            </div>
        ) : null;

        const submit_loader_spinner = ( <CircularProgress color="inherit" className={form_styles.loader} /> );
        const submit_successful_jsx = ( <div className={form_styles.submit_label}>Checkout submit successful.</div> );
        const submit_unsuccessful_jsx = ( <div className={form_styles.submit_label_failed}>Checkout submit was not successful.</div>);
        const loader_container = (
            ( this.state.loading == true ) ? submit_loader_spinner : 
            ( this.state.submitted == true ) ? submit_successful_jsx : 
            (this.state.error_found == true ) ? submit_unsuccessful_jsx : 
            null 
        );
        logger.debug(`Loader Container: ${loader_container}`)
        const submit_container = loader_container != null ? (
            <div className={form_styles.submit_container}>
                {loader_container}
            </div>
        ) : null;

        const places_autocomplete_input_jsx = (
            <div className={form_styles.input_container}>
                <InputComponent input_type="input_autocomplete" value={this.state.address} address_change={this.address_change}/>
            </div>
        )

        const full_name_textbox_jsx = (
            <div className={form_styles.input_container}>
                <InputComponent input_type="input_textbox" name="Full Name" id="full_name" placeholder="Enter Full Name..." update_field_value={this.update_field_value}/>
            </div>
        )
        
        const phone_number_textbox_jsx = (
            <div className={form_styles.input_container}>
            <InputComponent input_type="input_textbox" name="Phone #" id="phone" placeholder="Enter Phone Number..." update_field_value={this.update_field_value}/>
            </div>
        );
        const email_textbox_jsx = (
            <div className={form_styles.input_container}>
                <InputComponent input_type="input_textbox" name="Email" id="email" placeholder="Enter Email Address..." update_field_value={this.update_field_value}/>
            </div>
        );

        const title = this.state.title != null ? this.state.title : '';

        if (this.state.window_width < 769) {
            return (
                <PageLayout page_title={title == '' ? `` : `Checkout - ${title}`}>
                    <div className={styles.details_container}>
                        {image_container}
                        <div className={checkout_styles.checkout_form_container}>
                            <form method="post" onSubmit={this.handleSubmit}>

                                {title_container /* Title Container */}

                                {places_autocomplete_input_jsx /* Places Autocomplete Container */}

                                {full_name_textbox_jsx /* Full Name Container */}

                                {phone_number_textbox_jsx /* Phone Number Container */}
                                
                                {email_textbox_jsx /* Email Container */}
                                

                                <div className={checkout_styles.price_container}>
                                    {price_label}
                                    {shipping_jsx}
                                </div>

                                {submit_container}
                            </form>
                        </div>
                    </div>
                </PageLayout>
            );
        }

        return (
            <PageLayout page_title={title == '' ? `` : `Checkout - ${title}`}>
                <div className={styles.details_container}>
                    <div className={styles.details_container_left}>
                        {image_container}
                    </div>
                    <div className={styles.details_container_right}>
                        <div className={checkout_styles.checkout_form_container}>
                            <form method="post" onSubmit={this.handleSubmit}>

                                {title_container /* Title Container */}

                                {places_autocomplete_input_jsx /* Places Autocomplete Container */}

                                {full_name_textbox_jsx /* Full Name Container */}

                                {phone_number_textbox_jsx /* Phone Number Container */}
                                
                                {email_textbox_jsx /* Email Container */}

                                <div className={checkout_styles.price_container}>
                                    {price_label}
                                    {shipping_jsx}
                                </div>

                                {submit_container}
                            </form>
                        </div>
                    </div>
                </div>
            </PageLayout>
        );
    }
}

function useGoogleMapsLoader() {
    return useLoadScript({
        googleMapsApiKey: 'AIzaSyAQTCNGxtlglxAOC-CjqhKc2nroYKmPS7s',
        libraries: ['places'],
    });
}

function withLoadScript(WrappedComponent) {
    return function (props) {
        const { isLoaded, loadError } = useGoogleMapsLoader();

        if (loadError) {
            return <div>Error loading Google Maps API: {loadError.message}</div>;
        }

        if (!isLoaded) {
            return <div>Loading Google Maps API...</div>;
        }

        return <WrappedComponent {...props} />;
    };
}

export default withLoadScript(Checkout);
