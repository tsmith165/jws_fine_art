import Link from 'next/link'
import Image from 'next/image'
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router'

import PlacesAutocomplete from "react-places-autocomplete";
import { loadStripe } from "@stripe/stripe-js";


import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';

import styles from '../../styles/CheckoutForm.module.scss'

import { create_pending_transaction, create_stripe_checkout_session } from '../../lib/api_calls'


const stripePromise = loadStripe("pk_live_51IxP3oAuEqsFZjntawC5wWgSCTRmnkkxJhlICQmU8xH03qoS7mp2Dy7DHvKMb8uwPwxkf4sVuER5dqaLESIV3Urm00f0Hs2jsj");
const libraries = ["places"];

const CheckoutForm = ({ id, last_oid, next_oid, piece, set_piece, set_image_url }) => {

    const router = useRouter()
    const refresh_data = () => {
      router.replace(router.asPath)
    }

    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState(false)
    const [address, setAddress] = useState('')
    const [international, setInternational] = useState(false)

    //set_image_url(piece['image_path'])

    console.log("Current Piece Details:")
    console.log(piece)


    function handle_change(updated_address) {
        console.log(updated_address);
        console.log(typeof updated_address)
        if (typeof updated_address === 'string') {
            var temp_international = true;
            if (updated_address.toString().includes('USA')) temp_international = false;
            
            console.log(`Address: ${updated_address}`);
            console.log(`International: ${temp_international}`);

            setAddress(updated_address)
            setInternational(temp_international)
        }
    };

    async function handleSubmit(event) {
        event.preventDefault()
        
        console.log("Checkout Form Submit Recieved")

        setLoading(true)
        setSubmitted(false)
        
        // capture data from form
        const full_name = event.target.elements.full_name.value;
        const phone     = event.target.elements.phone.value;
        const email     = event.target.elements.email.value;

        console.log(`Full Name: ${full_name} | Phone Number: ${phone} | E-Mail: ${email} `)
        console.log(`Address: ${address} | International: ${international}`)

        if (address.length < 10) {
            console.log("Address requirement not met.  Please enter address...")
            //this.setState({address: "", error: 'Address invalid.  Please enter valid address.'})
            setError(true)
        }
        else if (full_name.length < 3) {
            console.log("Name requirement not met.  Please enter name...")
            //this.setState({name: "", error: 'Name invalid.  Please enter valid name.'})
            setError(true)
        }
        else if (email.length < 8) {
            console.log("Email requirement not met.  Please enter email...")
            //this.setState({email: "", error: 'Email invalid.  Please enter valid email.'})
            setError(true)
        }
        else if (phone.length < 8) {
            console.log("Phone requirement not met.  Please enter phone number...")
            //this.setState({phone: "", error: 'Phone Number invalid.  Please enter valid phone number.'})
            setError(true)
        }
        else {
            console.log("Attempting to Check Out...")

            console.log("Creating a Pending Transaction ...")
            const response = await create_pending_transaction(piece['id'], piece['title'], full_name, phone, email, address, international)
    
            console.log(`Pending Transaction Response (Next Line):`)
            console.log(response)
        
            if (!response) { 
                console.log("No Response From Create Pending Transaction...")
            } else { 
                // Create Stripe Checkout Session
                console.log("Creating a Stripe Checkout Session...")
                const response = await create_stripe_checkout_session(piece['id'], piece['title'], piece['image_path'], piece['width'], piece['height'], piece['price'], full_name, phone, email, address, international)    
                const json = await response.json();

                console.log(`Creating Stripe Checkout Session Response JSON (Next Line):`)
                console.log(json)

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
            }
        }

        setLoading(false)
    }

    console.log(`Creating Piece (Next Line):`)
    console.log(piece)

    return (
        <div className={styles.edit_details_form_container}>
            <form method="post" onSubmit={handleSubmit}>
                

                <div className={styles.edit_details_title_container}>
                    <Link href={`/checkout/${last_oid}`} passHref={true}>
                        <ArrowForwardIosRoundedIcon className={`${styles.detailsTitleArrow} ${styles.imgHorVert}`} />
                    </Link>
                    <div className={styles.details_title}>{piece['title']}</div>
                    <Link href={`/checkout/${next_oid}`} passHref={true}>
                        <ArrowForwardIosRoundedIcon className={styles.detailsTitleArrow}  />
                    </Link>
                </div>
                

                <div className={styles.input_container}>
                    <div className={styles.input_label_container}>
                        <div className={styles.input_label}>Full Name</div>
                    </div>
                    <input id="full_name" className={styles.input_textbox} placeholder={`Enter Full Name...`}/>
                </div>


                <div className={styles.input_container}>
                    <div className={styles.input_label_container}>
                        <div className={styles.input_label}>Phone #</div>
                    </div>
                    <input id="phone" className={styles.input_textbox} placeholder={`Enter Phone Number...`}/>
                </div>

                <div className={styles.input_container}>
                    <div className={styles.input_label_container}>
                        <div className={styles.input_label}>Email</div>
                    </div>
                    <input id="email" className={styles.input_textbox} placeholder={`Enter Email Address...`}/>
                </div>

                {/* Address Autocomplete Input */}
                <PlacesAutocomplete
                    value={address}
                    onChange={handle_change}
                    onSelect={handle_change}
                >
                    {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                        <div className={styles.autocomplete_container}>
                            <div className={styles.input_container_autocomplete}>
                                <div className={styles.input_label_container}>
                                    <b className={styles.input_label}>Address</b>
                                </div>
                                <input
                                {...getInputProps({
                                    placeholder: 'Enter Address...',
                                    className: `${styles.location_search_input} ${styles.input_autocomplete}`,
                                    autoComplete: "rutjfkde"
                                })}
                                />
                            </div>
                            <div className={styles.autocomplete_dropdown_container}>
                                {suggestions.map(suggestion => {
                                    
                                    // inline style for demonstration purpose
                                    const style = suggestion.active
                                    ? { backgroundColor: '#42a5f5', cursor: 'pointer' }
                                    : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                    return (
                                    <div className={styles.input_suggestion}
                                        {...getSuggestionItemProps(suggestion, {
                                        
                                        style,
                                        })}
                                    >
                                    {suggestion.description}
                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </PlacesAutocomplete>

                <div className={styles.submit_container}>
                    <div className={styles.price_label}>{`$${piece['price']}`}</div>

                    <button type="submit" className={styles.submit_button}>Checkout</button>

                    <Link href='https://stripe.com' passHref={true}>
                        <Image src='/powered_by_stripe_blue_background.png' height="70px" width="160px" />
                    </Link>
                </div>
            </form>
        </div>
    )
}

export default CheckoutForm;