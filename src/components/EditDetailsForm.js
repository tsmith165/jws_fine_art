import Link from 'next/link'
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router'

import { CircularProgress } from '@material-ui/core';
import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';
import ArrowBackRoundedIcon from '@material-ui/icons/ArrowBackRounded';

import styles from '../../styles/EditDetailsForm.module.scss'

import { edit_details, create_piece, upload_image, get_upload_url } from '../../lib/api_calls'

const EditDetailsForm = ({ id, last_oid, next_oid, piece, set_piece, set_image_url }) => {

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

    async function onFileChange(event) {
        event.preventDefault()
        console.log("FILE INPUT CHANGED....")

        var selected_file = event.target.files[0];
        console.log(`Selected File: ${selected_file.name} | Size: ${selected_file.size}`);

        const s3_upload_url = await get_upload_url(selected_file.name.toString().toLowerCase().replace(" ","_"))
        console.log(`Got Upload URL: ${s3_upload_url}`)

        const new_image_path = await upload_image(s3_upload_url, selected_file)
        console.log(`Got Upload Reponse: ${new_image_path}`)

        var image = new Image();

        image.src = new_image_path;

        //Validate the File Height and Width.
        image.onload = function () {
            console.log(`WIDTH: ${this.width} | HEIGHT: ${this.height}`)

            const new_piece_details = {
                title: 'Enter Title...',
                description: 'Enter Description...',
                sold: '',
                price: '',
                width: this.width,
                height: this.height,
                real_width: '',
                real_height: '',
                image_path: new_image_path
            }
    
            set_piece(new_piece_details)
            //set_description('')
            //set_image_url(new_image_path)

            setUploaded(true)
        };

    }

    function showFileUpload(event) {
        event.preventDefault();
        file_input_ref.current.click()
    }

    function updateDescription (event) {
        event.preventDefault();
        set_description(event.target.value);
    }

    console.log(`Creating Piece (Next Line):`)
    console.log(piece)

    return (
        <div className={styles.edit_details_form_container}>
            <form method="post" onSubmit={handleSubmit}>
                

                <div className={styles.edit_details_title_container}>
                    <Link href={`/edit/${last_oid}`} passHref={true}>
                        <ArrowForwardIosRoundedIcon className={`${styles.details_title_arrow} ${styles.img_hor_vert}`} />
                    </Link>
                    <input type="text" className={styles.edit_details_title_input} id="title" defaultValue={piece['title']}/>
                    <Link href={`/edit/${next_oid}`} passHref={true}>
                        <ArrowForwardIosRoundedIcon className={styles.details_title_arrow}  />
                    </Link>
                </div>
                
                <div className={styles.edit_details_description_container}>
                    <textarea className={styles.edit_details_description_textarea} id="description" value={description} onChange={updateDescription}/>
                </div>

                <div className={styles.input_container}>
                    <div className={styles.input_label_container}>
                        <div className={styles.input_label}>Type</div>
                    </div>
                    <select id="type" className={styles.input_select}>
                        <option value="Oil On Canvas" defaultValue={ (piece['type'] == "Oil On Canvas") ? true : false }>Oil On Canvas</option>
                        <option value="Oil On Cradled Panel" defaultValue={ (piece['type'] == "Oil On Cradled Panel") ? true : false }>Oil On Cradled Panel</option>
                        <option value="Intaglio On Paper" defaultValue={ (piece['type'] == "Intaglio On Paper") ? true : false }>Intaglio On Paper</option>
                        <option value="Linocut On Paper" defaultValue={ (piece['type'] == "Linocut On Paper") ? true : false }>Linocut On Paper</option>
                        <option value="Pastel On Paper" defaultValue={ (piece['type'] == "Pastel On Paper") ? true : false }>Pastel On Paper</option>
                    </select>
                </div>
                <div className={styles.input_container}>
                    <div className={styles.input_label_container}>
                        <div className={styles.input_label}>Sold</div>
                    </div>
                    <select id="sold" className={styles.input_select}>
                        <option defaultValue="True" selected={ (piece['sold'] == true) ? true : false }>Sold</option>
                        <option defaultValue="False" selected={ (piece['sold'] == false) ? true : false }>Not Sold</option>
                        {/*<option defaultValue="NFS">Not For Sale</option>*/}
                    </select>
                </div>
                <div className={styles.input_container}>
                    <div className={styles.input_label_container}>
                        <div className={styles.input_label}>Price</div>
                    </div>
                    <input id="price" className={styles.input_textbox} defaultValue={piece['price']}/>
                </div>
                <div className={styles.input_container_split_container}>         
                    <div className={`${styles.input_container_split} ${styles.split_left}`}>
                        <div className={`${styles.input_label_container} ${styles.input_label_split}`}>
                            <div className={styles.input_label}>Width</div>
                        </div>
                        <input className={`${styles.input_textbox} ${styles.input_split}`} id="width" defaultValue={piece['real_width']}/>
                    </div> 
                    <div className={`${styles.input_container_split} ${styles.split_right}`}>
                        <div className={`${styles.input_label_container} ${styles.input_label_split}`}>
                            <div className={styles.input_label}>Height</div>
                        </div>
                        <input className={`${styles.input_textbox} ${styles.input_split}`} id="height" defaultValue={piece['real_height']}/>
                    </div> 
                </div>

                <div className={styles.submit_container}>
                    <button type="button" className={styles.upload_button} onClick={showFileUpload} >Upload</button>
                    <input type="file" ref={file_input_ref} className={styles.upload_file_input} onChange={onFileChange} />

                    <button type="submit" className={styles.submit_button}>Submit</button>
                    <div className={styles.loader_container}>
                        {loading == false ? ( 
                            submitted == false ? (
                                error == false ? ( 
                                    null
                                ) : (
                                    <div className={styles.submit_label_failed}>Piece Details Update was NOT successful...</div>
                                )
                            ) : (
                                <div className={styles.submit_label}>Piece Details Update was successful...</div>
                            )
                        ) : (
                                <CircularProgress color="inherit" className={styles.loader}/>
                            ) 
                            
                        }
                    </div>
                </div>
            </form>
        </div>
    )
}

export default EditDetailsForm;