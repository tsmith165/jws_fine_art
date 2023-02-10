import Link from 'next/link'
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router'

import { CircularProgress } from '@material-ui/core';
import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';

import styles from '../../../styles/forms/EditDetailsForm.module.scss'

import { edit_details, create_piece, upload_image, get_upload_url } from '../../../lib/api_calls'

const EditDetailsForm = ({ id, last_oid, next_oid, piece, pieces, set_state, update_current_piece }) => {

    async function handleSubmit(event) {
        event.preventDefault()
    
        setLoading(true)
        setSubmitted(false)
        
        // capture data from form
        const title       = event.target.elements.title.value;
        const type        = event.target.elements.type.value;
        const sold        = event.target.elements.sold.value;
        const price       = event.target.elements.price.value;
        const instagram   = event.target.elements.instagram.value;
        const real_width  = event.target.elements.width.value;
        const real_height = event.target.elements.height.value;
    
        console.log(`Title: ${title} | Real Width: ${real_width} | Height: ${real_height}`)
        console.log(`Type: ${type} | Sold: ${sold} | Price: ${price} | Instagram Path: ${instagram}`)
        console.log(`Image Path: ${piece['image_path']} | Px Width: ${piece['width']} | Px Height: ${piece['height']}`)
        console.log("Description (Next Line):")
        console.log(description)
    
        // perform checks on inputted data
        
        if (title) {
            console.log("Attempting to Edit Piece Details...")
            if (!uploaded) {
                const response = await edit_details(id, title, description, type, sold, price, instagram, piece['width'], piece['height'], real_width, real_height)
    
                console.log(`Edit Piece Response (Next Line):`)
                console.log(response)
                
                refresh_data();
    
                if (response) { setError(false); setSubmitted(true); }
                else { 
                    console.log('Edit Piece - No Response - Setting error = true')
                    setError(true) 
                }
            }
            else {
                const response = await create_piece(title, description, type, sold, price, instagram, piece["width"], piece["height"], real_width, real_height, piece['image_path']);
    
                console.log(`Edit Piece Response (Next Line):`)
                console.log(response)
                
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

        try {
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
                    image_path: new_image_path,
                    instagram: ''
                }
        
                set_state({piece: new_piece_details})
                //set_description('')
                //set_state({image_url: new_image_path})
        
                setUploaded(true)
                setUploadError(false)
            }
        } catch {
            setUploaded(false)
            setUploadError(true)
        }
    
    }
    
    function showFileUpload(event) {
        event.preventDefault();
        file_input_ref.current.click()
    }
    
    function updateDescription (event) {
        event.preventDefault();
        var content = event.target.value;
        set_description(content);
        // console.log(`Current Description: ${description}`)
    }

    const file_input_ref = useRef(null);

    const router = useRouter()
    const refresh_data = () => {
      router.replace(router.asPath)
    }

    const text_area_ref = useRef(null);
    const [description, set_description] = useState( piece['description'] );
    useEffect(() => {
        set_description(piece['description'])
    }, [piece['description']]);
    
    useEffect(() => {
        text_area_ref.current.style.height = "0px";
        const scrollHeight = text_area_ref.current.scrollHeight + 5;
        text_area_ref.current.style.height = scrollHeight + "px";
    }, [description]);

    //console.log("Current Description (Next Line):");
    //console.log(description);


    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState(false)
    const [uploaded, setUploaded] = useState(false)
    const [upload_error, setUploadError] = useState(false)

    useEffect(() => {
        setLoading(false)
        setSubmitted(false)
        setError(false)
        setUploaded(false)
        setUploadError(false)
    }, [false, false, false, false, false]);

    console.log(`Loading: ${loading} | Submitted: ${submitted} | Error: ${error} | Uploaded: ${uploaded}`)

    const loader_jsx = null;
    if (loading == true) {
        loader_jsx = ( 
            <CircularProgress color="inherit" className={styles.loader}/> 
        );
    } else if (submitted == true) {
        loader_jsx = ( 
            <div className={styles.submit_label}>Piece Details Update was successful...</div>
        );
    } else if (error == true) {
        loader_jsx = ( 
            <div className={styles.submit_label_failed}>Piece Details Update was NOT successful...</div>
        );
    } else if (uploaded == true) {
        loader_jsx = ( 
            <div className={styles.submit_label}>Image Upload was successful...</div>
        );
    } else if (upload_error == true) {
        loader_jsx = ( 
            <div className={styles.submit_label_failed}>Image Upload was NOT successful...</div>
        );
    }

    var [sold, set_sold] = useState((piece['sold'] == true) ? "True" : "False")
    useEffect(() => {
        set_sold((piece['sold'] == true) ? "True" : "False")
    }, [piece['sold']]);
    
    console.log(`SOLD STATE: ${sold}`)

    var [type, set_type] = useState(piece['type'])
    useEffect(() => {
        set_type(piece['type'])
    }, [piece['type']]);
    
    console.log(`TYPE STATE: ${sold}`)
    

    return (
        <div className={styles.edit_details_form_container}>
            <form method="post" onSubmit={handleSubmit}>
                <div className={styles.title_container}>
                    <ArrowForwardIosRoundedIcon className={`${styles.title_arrow} ${styles.img_hor_vert}`} onClick={(e) => { e.preventDefault(); update_current_piece(last_oid, pieces)}} />
                    <input type="text" className={styles.title_input} id="title" defaultValue={piece['title']} key={piece['title']}/>
                    <ArrowForwardIosRoundedIcon className={styles.title_arrow} onClick={(e) => { e.preventDefault(); update_current_piece(next_oid, pieces)}}/>
                </div>

                <div className={styles.edit_details_description_container}>
                    <textarea className={styles.edit_details_description_textarea} ref={text_area_ref} id="description" defaultValue={description.split('<br>').join("\n") } onChange={updateDescription}/>
                </div>

                {/* Piece Type Select */}
                <div className={styles.input_container}>
                    <div className={styles.input_label_container}>
                        <div className={styles.input_label}>Type</div>
                    </div>
                    <select id="type" className={styles.input_select} value={ type } onChange={ (e) => set_type(e.target.value) }>
                        <option value="Oil On Canvas">Oil On Canvas</option>
                        <option value="Oil On Cradled Panel">Oil On Cradled Panel</option>
                        <option value="Intaglio On Paper">Intaglio On Paper</option>
                        <option value="Linocut On Paper">Linocut On Paper</option>
                        <option value="Pastel On Paper">Pastel On Paper</option>
                    </select>
                </div>

                {/* Sold Select */}
                <div className={styles.input_container}>
                    <div className={styles.input_label_container}>
                        <div className={styles.input_label}>Sold</div>
                    </div>
                    <select id="sold" className={styles.input_select} value={ sold } onChange={ (e) => set_sold(e.target.value) }>
                        <option value="True">Sold</option>
                        <option value="False">Not Sold</option>
                        {/*<option defaultValue="NFS">Not For Sale</option>*/}
                    </select>
                </div>

                {/* Price Textbox */}
                <div className={styles.input_container}>
                    <div className={styles.input_label_container}>
                        <div className={styles.input_label}>Price</div>
                    </div>
                    <input id="price" className={styles.input_textbox} defaultValue={piece['price']} key={piece['price']}/>
                </div>

                {/* Instagram Link Textbox */}
                <div className={styles.input_container}>
                    <div className={styles.input_label_container}>
                        <div className={styles.input_label}>Instagram</div>
                    </div>
                    <input id="instagram" className={styles.input_textbox} defaultValue={piece['instagram']} key={piece['instagram']}/>
                </div>

                {/* Split Container For real_width / real_height */}
                <div className={styles.input_container_split_container}>         
                    <div className={`${styles.input_container_split} ${styles.split_left}`}>
                        <div className={`${styles.input_label_container} ${styles.input_label_split}`}>
                            <div className={styles.input_label}>Width</div>
                        </div>
                        <input className={`${styles.input_textbox} ${styles.input_split}`} id="width" defaultValue={piece['real_width']} key={piece['real_width']}/>
                    </div> 
                    <div className={`${styles.input_container_split} ${styles.split_right}`}>
                        <div className={`${styles.input_label_container} ${styles.input_label_split}`}>
                            <div className={styles.input_label}>Height</div>
                        </div>
                        <input className={`${styles.input_textbox} ${styles.input_split}`} id="height" defaultValue={piece['real_height']} key={piece['real_height']}/>
                    </div> 
                </div>

                <div className={styles.submit_container}>
                    <button type="button" className={styles.upload_button} onClick={showFileUpload} >Upload</button>
                    <input type="file" ref={file_input_ref} className={styles.upload_file_input} onChange={onFileChange} />

                    <button type="submit" className={styles.submit_button}>Submit</button>
                    <div className={styles.loader_container}>
                        {loader_jsx}
                    </div>
                </div>
            </form>
        </div>
    )
}

export default EditDetailsForm;