import React from 'react';
import Image from 'next/image'
import Link from 'next/link'

import { fetch_pieces, create_pending_transaction, create_stripe_checkout_session } from '../../../../lib/api_calls';

import PageLayout from '../../../../src/components/layout/PageLayout'

import styles from '../../../../styles/pages/Details.module.scss'
import form_styles from '../../../../styles/forms/CheckoutForm.module.scss'

import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';
import { CircularProgress } from '@material-ui/core';

import PlacesAutocomplete from "react-places-autocomplete";
import { loadStripe } from "@stripe/stripe-js";

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";
const stripePromise = loadStripe("pk_live_51IxP3oAuEqsFZjntawC5wWgSCTRmnkkxJhlICQmU8xH03qoS7mp2Dy7DHvKMb8uwPwxkf4sVuER5dqaLESIV3Urm00f0Hs2jsj");
const libraries = ["places"];


class CheckoutPage extends React.Component {
    constructor(props) {
        super(props);

        this.router = props.router

        console.log(`ID PROP: ${props.id}`)

        // Don't call this.setState() here!
        this.state = {
            debug: false,
            url_o_id: props.id,
            pieces: null,
            piece_position: null,
            piece_db_id: null,
            current_piece: null,
            piece_details: {
                title:       '',
                type:        '',
                description: '',
                sold:        '',
                price:       '',
                width:       0,
                height:      0,
                real_width:  '',
                real_height: '',
                image_path:  '',
                instagram:   '',
            },
            image_url: '',
            next_oid: null,
            last_oid: null,
            price: 0,
            price_html: null,
            sold: false,
            sold_html: null,
            description: '',
            address: '',
            international: false,
            loaded: false
        }; 

        this.fetch_pieces_from_api = this.fetch_pieces_from_api.bind(this);
        this.update_current_piece = this.update_current_piece.bind(this);
        this.get_piece_from_path_o_id = this.get_piece_from_path_o_id.bind(this);
        this.address_change = this.address_change.bind(this);
        this.check_fields = this.check_fields.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        // this.fetch_pieces_from_api()
    }

    async componentDidMount() {
        await this.fetch_pieces_from_api()
    }

    async fetch_pieces_from_api() {
        console.log(`-------------- Fetching Initial Server List --------------`)
        const pieces = await fetch_pieces();

        // console.log('Pieces output (Next Line):')
        // console.log(pieces)

        this.update_current_piece(pieces, this.state.url_o_id)
    }

    async update_current_piece(pieces, o_id) {
        const pieces_length = pieces.length;

        console.log(`Piece Count: ${pieces_length} | Searching for URL_O_ID: ${o_id}`)
        const [piece_position, current_piece] = await this.get_piece_from_path_o_id(pieces, o_id);
        const piece_db_id = current_piece['id']

        console.log(`Piece Position: ${piece_position} | Piece DB ID: ${piece_db_id} | Data (Next Line):`)
        console.log(current_piece)

        const next_oid = (piece_position + 1 > pieces_length - 1) ? pieces[0]['o_id']                 : pieces[piece_position + 1]['o_id'];
        const last_oid = (piece_position - 1 < 0)                 ? pieces[pieces_length - 1]['o_id'] : pieces[piece_position - 1]['o_id'];
        
        console.log(`Updating to new selected piece with Postition: ${piece_position} | DB ID: ${piece_db_id} | O_ID: ${o_id} | NEXT_O_ID: ${next_oid} | LAST_O_ID: ${last_oid}`)

        const piece_details = {
            title:       current_piece['title'],
            type:        current_piece['type'],
            description: current_piece['description'],
            sold:        current_piece['sold'],
            price:       current_piece['price'],
            width:       current_piece['width'],
            height:      current_piece['height'],
            real_width:  current_piece['real_width'],
            real_height: current_piece['real_height'],
            image_path:  `${baseURL}${current_piece['image_path']}`,
            instagram:   current_piece['instagram']
        }

        const sold = current_piece["sold"]
        const sold_html = (sold == true) ? 
            ( 
                <b className={styles.piece_sold}>Sold</b> 
            ) : ( 
                <Link href={`/checkout/${o_id}`}>
                    <button className={styles.buy_now_button}>Buy</button>
                </Link> 
            )
    
        const price = current_piece['price']
        const price_html = (current_piece["sold"] == false) ? ( <b className={styles.price_text}>{`$${current_piece['price']}`}</b> ) : ( null )

        const image_url = piece_details.image_path
        console.log(`Setting Details Image Path: ${image_url}`)

        const description = current_piece['description'].split('<br>').join("\n");

        console.log("CURRENT PIECE DETAILS (Next Line):")
        console.log(piece_details)

        console.log(`Piece sold: ${piece_details['sold']} | Piece Type: ${piece_details['type']}`)

        this.setState({
            pieces: pieces,
            piece_position: piece_position,
            piece_db_id: piece_db_id, 
            piece: current_piece, 
            piece_details: piece_details, 
            image_url: image_url,
            next_oid: next_oid, 
            last_oid: last_oid, 
            sold: sold, 
            sold_html: sold_html, 
            price: price, 
            price_html: price_html, 
            description: description
        }, async () => {
            if (this.state.url_o_id != o_id) {
                this.router.push(`/checkout/${o_id}`) 
            }
        })
    }

    async get_piece_from_path_o_id(pieces, o_id) {
        for (var i=0; i < pieces.length; i++) {
            if (pieces[i]['o_id'].toString() == o_id.toString()) {
                return [i, pieces[i]]
            }
        }
    }

    async address_change(updated_address) {
        console.log(updated_address);
        console.log(typeof updated_address)
        if (typeof updated_address === 'string') {
            var is_international = true;
            if (updated_address.toString().includes('USA')) is_international = false;
            
            console.log(`Address: ${updated_address}`);
            console.log(`International: ${is_international}`);

            this.setState({address: updated_address, international: is_international})
        }
    };

    async check_fields(field_array) {
        var error_found = false
        var error_reason = ''
        for (var i=0; i < field_array.length; i++) {
            let field = field_array[i][0]
            let field_lenth = field.length
            let min_length = field_array[i][1]

            if (field_lenth < min_length) {
                error_reason = `${field} requirement not met.  Please enter valid ${field}...}`
                console.error(error_reason)
                error_found = true
            }
        }
        this.setState({error: error_found, error_reason: error_reason})
        return error_found
    }

    async handleSubmit(event) {
        event.preventDefault()
        
        console.log("Checkout Form Submit Recieved")

        this.setState({ loading: true, submitted: false })
        
        // capture data from form
        const full_name = event.target.elements.full_name.value;
        const phone     = event.target.elements.phone.value;
        const email     = event.target.elements.email.value;

        console.log(`Full Name: ${full_name} | Phone Number: ${phone} | E-Mail: ${email} `)
        console.log(`Address: ${this.state.address} | International: ${this.state.international}`)

        const error_found = await this.check_fields([[full_name, 3], [email, 8], [phone, 8], [this.state.address, 10]])
        
        if (error_found) {
            console.error(`Could not check out due to an error...`) 
            return 
        }

        console.log("Attempting to Check Out...")

        console.log("Creating a Pending Transaction ...")
        const pending_response = await create_pending_transaction(this.state.piece_db_id, this.state.piece_details['title'], full_name, phone, email, this.state.address, this.state.international)

        console.log(`Pending Transaction Response (Next Line):`)
        console.log(pending_response)
    
        if (!pending_response) { 
            console.error("No Response From Create Pending Transaction.  Cannot check out...")
            return
        } 
        
        // Create Stripe Checkout Session
        console.log("Creating a Stripe Checkout Session...")
        const stripe_response = await create_stripe_checkout_session(this.state.piece_db_id, this.state.piece_details['title'], this.state.image_url, this.state.piece_details['width'], this.state.piece_details['height'], this.state.piece_details['price'], full_name, phone, email, this.state.address, this.state.international)
        const json = await stripe_response.json();

        console.log(`Creating Stripe Checkout Session Response JSON (Next Line):`);
        console.log(json);

        const session = json;

        console.log(`Session ID: ${session.id}`)

        var redirect_to_stripe = true;
        if (redirect_to_stripe) {
            const stripe = await stripePromise;
            console.log("Stripe (Next Line):");
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

        this.setState({loading: false})
    }

    render() {
        console.log("CURRENT PIECE DETAILS (Next Line):")
        console.log(this.state.piece_details)

        var loader_jsx = null;
        if (this.state.loading == true) {
            loader_jsx = ( <CircularProgress color="inherit" className={form_styles.loader}/> );
        } else if (this.state.submitted == true) {
            loader_jsx = ( <div className={form_styles.submit_label}>Piece Details Update was successful...</div> );
        } else if (this.state.error == true) {
            loader_jsx = ( <div className={form_styles.submit_label_failed}>Piece Details Update was NOT successful...</div> );
        } else if (this.state.uploaded == true) {
            loader_jsx = ( <div className={form_styles.submit_label}>Image Upload was successful...</div> );
        } else if (this.state.upload_error == true) {
            loader_jsx = ( <div className={form_styles.submit_label_failed}>Image Upload was NOT successful...</div> );
        }

        const title = (this.state.piece_details['title'] != null) ? (this.state.piece_details['title']) : ('')
        return (
            <PageLayout page_title={ (title == '') ? (``) : (`Checkout - ${title}`) } use_maps_api={true}>
                <div className={styles.details_container}>
                    <div className={styles.details_container_left}>
                        <div className={styles.details_image_container}>

                            { (this.state.image_url == '') ? (null) : (
                                <Image
                                    className={styles.details_image}
                                    src={`${this.state.image_url}`}
                                    alt={this.state.piece_details['title']}
                                    // width={this.state.piece_details['width']}
                                    // height={this.state.piece_details['height']}
                                    priority={true}
                                    layout='fill'
                                    objectFit='contain'
                                    quality={100}
                                />
                            )}

                        </div>
                    </div>
                    <div className={styles.details_container_right}>
                        <div className={form_styles.checkout_form_container}>
                            <form method="post" onSubmit={this.handleSubmit}>

                                { /* Title Container */ }
                                <div className={form_styles.checkout_title_container}>
                                    <ArrowForwardIosRoundedIcon className={`${form_styles.title_arrow} ${form_styles.img_hor_vert}`} onClick={(e) => { e.preventDefault(); this.update_current_piece(this.state.pieces, this.state.last_oid)}} />
                                    <div className={form_styles.title}>{ (title == '') ? (``) : (`"${title}"`) }</div>
                                    <ArrowForwardIosRoundedIcon className={form_styles.title_arrow} onClick={(e) => { e.preventDefault(); this.update_current_piece(this.state.pieces, this.state.next_oid)}}/>
                                </div>
                                
                                { /* Full Name Container */ }
                                <div className={form_styles.input_container}>
                                    <div className={form_styles.input_label_container}>
                                        <div className={form_styles.input_label}>Full Name</div>
                                    </div>
                                    <input id="full_name" className={form_styles.input_textbox} placeholder={`Enter Full Name...`}/>
                                </div>

                                { /* Phone Number Container */ }
                                <div className={form_styles.input_container}>
                                    <div className={form_styles.input_label_container}>
                                        <div className={form_styles.input_label}>Phone #</div>
                                    </div>
                                    <input id="phone" className={form_styles.input_textbox} placeholder={`Enter Phone Number...`}/>
                                </div>

                                { /* Email Container */ }
                                <div className={form_styles.input_container}>
                                    <div className={form_styles.input_label_container}>
                                        <div className={form_styles.input_label}>Email</div>
                                    </div>
                                    <input id="email" className={form_styles.input_textbox} placeholder={`Enter Email Address...`}/>
                                </div>

                                {/* Address Autocomplete Input */}
                                { (this.state.loaded) ? (
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
                                                        className: `${form_styles.location_search_input} ${form_styles.input_autocomplete}`,
                                                        autoComplete: "rutjfkde"
                                                    })}
                                                    />
                                                </div>
                                                <div className={form_styles.autocomplete_dropdown_container}>
                                                    {suggestions.map(suggestion => {
                                                        
                                                        // inline style for demonstration purpose
                                                        const style = suggestion.active
                                                        ? { backgroundColor: '#42a5f5', cursor: 'pointer' }
                                                        : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                                        return (
                                                        <div key={suggestion.placeId} className={form_styles.input_suggestion} {...getSuggestionItemProps(suggestion, { style, })} >
                                                            {suggestion.description}
                                                        </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </PlacesAutocomplete>
                                ) : ( null ) }

                                <div className={form_styles.submit_container}>
                                    <div className={form_styles.price_label}>{`$${this.state.piece_details['price']}`}</div>

                                    <button type="submit" className={form_styles.submit_button}>Checkout</button>

                                    <div className={form_styles.loader_container}>
                                        {loader_jsx}
                                    </div>
                                </div>
                                <div className={form_styles.submit_container}>
                                    <Link href='https://stripe.com'>
                                        <Image src='/powered_by_stripe_blue_background.png' height="70px" width="160px" />
                                    </Link>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
            </PageLayout>
        )
    }
}

export default CheckoutPage;
