import Link from 'next/link'
import React, { useState } from 'react';
import { useRouter } from 'next/router'

import { CircularProgress } from '@material-ui/core';
import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';
import ArrowBackRoundedIcon from '@material-ui/icons/ArrowBackRounded';

import styles from '../../styles/EditDetailsForm.module.scss'

import { edit_details } from '../../lib/api_calls'

const EditDetailsForm = ({ id, last_oid, next_oid, piece }) => {

    const router = useRouter()
    const refresh_data = () => {
      router.replace(router.asPath)
    }

    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState(false)
    const [description, setDescription] = useState(piece['description'].replace("<br>","\n"))

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
        const width       = event.target.elements.width.value;
        const height      = event.target.elements.height.value;
        console.log(`Title: ${title} | Type: ${type} | Sold: ${sold} | Price: ${price} | Width: ${width} | Height: ${height}`)
        console.log("Description (Next Line):")
        console.log(description)

        // perform checks on inputted data
        
        if (title) {
            console.log("Attempting to Edit Piece Details...")
            const response = await edit_details(id, title, description, type, sold, price, width, height)
    
            console.log(`Edit Piece Response: ${response}`)
            
            setDescription(description.replace("<br>","\n"))
            refresh_data();
    
            if (response) { setError(false); setSubmitted(true); }
            else { setError(true) }
        }
        else {
            setError(true)
        }
        setLoading(false)
    }

    function updateDescription (event) {
        event.preventDefault();
        setDescription(event.target.value);
    }

    console.log(`Creating Piece (Next Line):`)
    console.log(piece)

    return (
        <div className={styles.edit_details_form_container}>
            <form method="post" onSubmit={handleSubmit}>
                

                <div className={styles.edit_details_title_container}>
                    <Link href={`/edit/${last_oid}`} passHref={true}>
                        <ArrowForwardIosRoundedIcon className={`${styles.detailsTitleArrow} ${styles.imgHorVert}`} />
                    </Link>
                    <input type="text" className={styles.edit_details_title_input} id="title" defaultValue={piece['title']}/>
                    <Link href={`/edit/${next_oid}`} passHref={true}>
                        <ArrowForwardIosRoundedIcon className={styles.detailsTitleArrow}  />
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
                        <option defaultValue="Oil On Canvas" selected={ (piece['type'] == "Oil On Canvas") ? true : false }>Oil On Canvas</option>
                        <option defaultValue="Oil On Cradled Panel" selected={ (piece['type'] == "Oil On Cradled Panel") ? true : false }>Oil On Cradled Panel</option>
                        <option defaultValue="Intaglio On Paper" selected={ (piece['type'] == "Intaglio On Paper") ? true : false }>Intaglio On Paper</option>
                        <option defaultValue="Linocut On Paper" selected={ (piece['type'] == "Linocut On Paper") ? true : false }>Linocut On Paper</option>
                        <option defaultValue="Pastel On Paper" selected={ (piece['type'] == "Pastel On Paper") ? true : false }>Pastel On Paper</option>
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
                        <input className={`${styles.input_textbox} ${styles.input_split}`} id="width" defaultValue={piece['width']}/>
                    </div> 
                    <div className={`${styles.input_container_split} ${styles.split_right}`}>
                        <div className={`${styles.input_label_container} ${styles.input_label_split}`}>
                            <div className={styles.input_label}>Height</div>
                        </div>
                        <input className={`${styles.input_textbox} ${styles.input_split}`} id="height" defaultValue={piece['height']}/>
                    </div> 
                </div>

                <div className={styles.submit_container}>
                    <button type="button" className={styles.upload_button}>Upload</button>
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