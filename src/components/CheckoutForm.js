import Link from 'next/link'
import Image from 'next/image'
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router'

import { CircularProgress } from '@material-ui/core';
import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';

import styles from '../../styles/CheckoutForm.module.scss'

import { edit_details, create_piece, upload_image, get_upload_url } from '../../lib/api_calls'

const CheckoutForm = ({ id, last_oid, next_oid, piece, set_piece, set_image_url }) => {

    const file_input_ref = useRef(null);

    const router = useRouter()
    const refresh_data = () => {
      router.replace(router.asPath)
    }

    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState(false)
    const [uploaded, setUploaded] = useState(false)

    //set_image_url(piece['image_path'])

    console.log("Current Piece Details:")
    console.log(piece)

    
    const [description, set_description] = useState(piece['description'].replace("<br>","\n"));

    useEffect(() => {
        set_description(piece['description'].replace("<br>","\n"))
    }, [piece['description'].replace("<br>","\n")]);

    useEffect(() => {
        setUploaded(false)
    }, [false]);

    async function handleSubmit(event) {
        event.preventDefault()
    
        setLoading(true)
        setSubmitted(false)
        
        // capture data from form
        const title       = event.target.elements.title.value;
        const description = event.target.elements.description.value;
        const type        = event.target.elements.type.value;
        const sold        = event.target.elements.sold.value;
        const price       = event.target.elements.price.value;
        const real_width  = event.target.elements.width.value;
        const real_height = event.target.elements.height.value;
        console.log(`Title: ${title} | Type: ${type} | Sold: ${sold} | Price: ${price} | Real Width: ${width} | Height: ${height}`)
        console.log("Description (Next Line):")
        console.log(description)

        // perform checks on inputted data
        
        if (title) {
            console.log("Attempting to Edit Piece Details...")
            if (!uploaded) {
                const response = await edit_details(id, title, description, type, sold, price, real_width, real_height)
    
                console.log(`Edit Piece Response: ${response}`)
                
                set_description(description.replace("<br>","\n"))
                refresh_data();

                if (response) { setError(false); setSubmitted(true); }
                else { setError(true) }
            }
            else {
                const width = piece["width"];
                const height = piece["height"];
                const response = await create_piece(title, description, type, sold, price, real_width, real_height, piece['image_path'], width, height)
    
                console.log(`Edit Piece Response: ${response}`)
                
                set_description(description.replace("<br>","\n"))
                refresh_data();

                if (response) { setError(false); setSubmitted(true); }
                else { setError(true) }
            }
        }
        else {
            setError(true)
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
                    <input id="full_name" className={styles.input_textbox} defaultValue={`Enter Full Name...`}/>
                </div>


                <div className={styles.input_container}>
                    <div className={styles.input_label_container}>
                        <div className={styles.input_label}>Phone #</div>
                    </div>
                    <input id="phone" className={styles.input_textbox} defaultValue={`Enter Phone Number...`}/>
                </div>

                <div className={styles.input_container}>
                    <div className={styles.input_label_container}>
                        <div className={styles.input_label}>Email</div>
                    </div>
                    <input id="email" className={styles.input_textbox} defaultValue={`Enter Email Address...`}/>
                </div>

                <div className={styles.input_container}>
                    <div className={styles.input_label_container}>
                        <div className={styles.input_label}>Address</div>
                    </div>
                    <input id="address" className={styles.input_textbox} defaultValue={`Enter Address...`}/>
                </div>

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