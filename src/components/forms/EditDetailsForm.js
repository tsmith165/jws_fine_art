import Link from 'next/link'
import React from 'react';

import { CircularProgress } from '@material-ui/core';
import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';

import styles from '../../../styles/forms/EditDetailsForm.module.scss'

import { edit_details, create_piece, upload_image, get_upload_url } from '../../../lib/api_calls'

class EditDetailsForm extends React.Component {
    constructor(props) {
        super(props);

        this.router = this.props.router
        
        this.state = {
            debug: false,
            url_o_id: this.props.id,
            pieces: null,
            piece_details: {
                title:       '',
                type:        '',
                description: '',
                sold:        '',
                price:       '',
                width:       '',
                height:      '',
                real_width:  '',
                real_height: '',
                image_path:  '',
                instagram:   '',
            },
            last_oid: this.props.last_oid,
            next_oid: this.props.next_oid,
            description: '',
            loading: false,
            submitted: false,
            error: false,
            uploaded: false,
            upload_error: false,
            sold: "False",
            type: 'Oil On Canvas'
        }

        this.set_page_piece_details = this.props.set_page_piece_details.bind(this);

        this.set_piece_details = this.set_piece_details.bind(this);
        this.update_current_piece = this.update_current_piece.bind(this);
       
        this.showFileUpload = this.showFileUpload.bind(this);
        this.updateDescription = this.updateDescription.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onFileChange = this.onFileChange.bind(this);
        this.refresh_data = this.refresh_data.bind(this);
        
        this.file_input_ref = React.createRef(null);
        this.text_area_ref = React.createRef(null);
    }

    async componentDidMount() {
        this.text_area_ref.current.style.height = "0px";
        const scrollHeight = this.text_area_ref.current.scrollHeight + 5;
        this.text_area_ref.current.style.height = scrollHeight + "px";
    }

    async set_piece_details(piece_details) {
        this.setState({piece_details: piece_details, image_url: piece_details['image_path']})
    }

    async update_current_piece() {
        console.log(`Searching for URL_O_ID: ${this.state.url_o_id}`)
        const piece_id = await this.get_piece_id_from_path_o_id();

        const current_piece = pieces[piece_id]

        console.log(current_piece)

        const pieces_length = pieces.length;
        const next_oid = (piece_id + 1 > pieces_length - 1) ? pieces[0]['o_id']                 : pieces[piece_id + 1]['o_id'];
        const last_oid = (piece_id - 1 < 0)                 ? pieces[pieces_length - 1]['o_id'] : pieces[piece_id - 1]['o_id'];

        console.log(`Updating to new selected piece with ID: ${piece_id} | O_ID: ${o_id} | NEXT_O_ID: ${next_oid} | LAST_O_ID: ${last_oid}`)

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

        const image_url = piece_details.image_path

        console.log("CURRENT PIECE DETAILS (Next Line):")
        console.log(piece_details)

        this.setState({pieces: pieces, piece_id: piece_id, piece: current_piece, next_oid: next_oid, last_oid: last_oid, piece_details: piece_details, image_url: image_url})

        this.router.push(`/edit/${o_id}`)
    }

    async get_piece_id_from_path_o_id() {
        for (var i=0; i < this.state.pieces.length; i++) {
            if (this.state.pieces[i]['o_id'].toString() == this.state.url_o_id.toString()) {
                return i
            }
        }
    }

    async handleSubmit(event) {
        event.preventDefault()
        
        this.setState({loading: true, submitted: false});
        
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
        console.log(`Image Path: ${this.state.piece_details['image_path']} | Px Width: ${this.state.piece_details['width']} | Px Height: ${this.state.piece_details['height']}`)
        console.log("Description (Next Line):")
        console.log(this.state.description)
    
        // perform checks on inputted data
        if (title) {
            console.log("Attempting to Edit Piece Details...")
            if (!uploaded) {
                const response = await edit_details(id, title, this.state.description, type, sold, price, instagram, this.state.piece_details['width'], this.state.piece_details['height'], real_width, real_height)
    
                console.log(`Edit Piece Response (Next Line):`)
                console.log(response)
                
                refresh_data();
    
                if (response) { this.setState({loading: false, error: false, submitted: true}); }
                else { 
                    console.log('Edit Piece - No Response - Setting error = true')
                    this.setState({loading: false, error: true}); 
                }
            }
            else {
                const response = await create_piece(title, description, type, sold, price, instagram, this.state.piece["width"], this.state.piece["height"], real_width, real_height, this.state.piece['image_path']);
    
                console.log(`Edit Piece Response (Next Line):`)
                console.log(response)
                
                refresh_data();
    
                if (response) { this.setState({loading: false, error: false, submitted: true}); }
                else { this.setState({loading: false, error: true}); }
            }
        }
        else {
            this.setState({loading: false, error: true});
        }
    }

    async onFileChange(event) {
        event.preventDefault()
        console.log("FILE INPUT CHANGED....")

        try {
            var selected_file = event.target.files[0];
            console.log(`Selected File: ${selected_file.name} | Size: ${selected_file.size}`);
        
            const s3_upload_url = await get_upload_url(selected_file.name.toString().toLowerCase().replace(" ","_"))
            console.log(`Got Upload URL: ${s3_upload_url}`)
        
            const new_image_path = await upload_image(s3_upload_url, selected_file)
            console.log(`Got Upload Reponse: ${new_image_path}`)
            
            console.log(`Loading image at path: ${new_image_path}`)
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
                console.log("Updating state with uploaded piece details (Next Line):")
                console.log(new_piece_details)
                
                this.setState({uploaded: true, upload_error: false});
                this.set_piece_details(new_piece_details)

            }
        } catch {
             this.setState({uploaded: false, upload_error: true});
        }
    }

    showFileUpload(event) {
        event.preventDefault();
        this.file_input_ref.current.click()
    }

    updateDescription(event) {
        event.preventDefault();
        var content = event.target.value;
        this.setState({description: content});
        // console.log(`Current Description: ${this.state.description}`)
    }

    refresh_data() {
        this.router.replace(router.asPath)
    }

    render() {
        if (this.state.pieces != null) {
            this.update_current_piece()

            // console.log('Form Pieces output (Next Line):')
            // console.log(this.state.pieces)
        }

        console.log(`Loading: ${this.state.loading} | Submitted: ${this.state.submitted} | Error: ${this.state.error} | Uploaded: ${this.state.uploaded}`)

        var loader_jsx = null;
        if (this.state.loading == true) {
            loader_jsx = ( 
                <CircularProgress color="inherit" className={styles.loader}/> 
            );
        } else if (this.state.submitted == true) {
            loader_jsx = ( 
                <div className={styles.submit_label}>Piece Details Update was successful...</div>
            );
        } else if (this.state.error == true) {
            loader_jsx = ( 
                <div className={styles.submit_label_failed}>Piece Details Update was NOT successful...</div>
            );
        } else if (this.state.uploaded == true) {
            loader_jsx = ( 
                <div className={styles.submit_label}>Image Upload was successful...</div>
            );
        } else if (this.state.upload_error == true) {
            loader_jsx = ( 
                <div className={styles.submit_label_failed}>Image Upload was NOT successful...</div>
            );
        }

        return (
            <div className={styles.edit_details_form_container}>
                <form method="post" onSubmit={this.handleSubmit}>
                    <div className={styles.title_container}>
                        <ArrowForwardIosRoundedIcon className={`${styles.title_arrow} ${styles.img_hor_vert}`} onClick={(e) => { e.preventDefault(); this.update_current_piece(this.state.last_oid, this.state.pieces)}} />
                        <input type="text" className={styles.title_input} id="title" defaultValue={this.state.piece_details['title']} key={this.state.piece_details['title']}/>
                        <ArrowForwardIosRoundedIcon className={styles.title_arrow} onClick={(e) => { e.preventDefault(); this.update_current_piece(this.state.next_oid, this.state.pieces)}}/>
                    </div>

                    <div className={styles.edit_details_description_container}>
                        <textarea className={styles.edit_details_description_textarea} ref={this.text_area_ref} id="description" defaultValue={this.state.description.split('<br>').join("\n") } onChange={this.updateDescription}/>
                    </div>

                    {/* Piece Type Select */}
                    <div className={styles.input_container}>
                        <div className={styles.input_label_container}>
                            <div className={styles.input_label}>Type</div>
                        </div>
                        <select id="type" className={styles.input_select} value={ this.state.type } onChange={ (e) => set_type(e.target.value) }>
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
                        <select id="sold" className={styles.input_select} value={ this.state.sold } onChange={ (e) => set_sold(e.target.value) }>
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
                        <input id="price" className={styles.input_textbox} defaultValue={this.state.piece_details['price']} key={this.state.piece_details['price']}/>
                    </div>

                    {/* Instagram Link Textbox */}
                    <div className={styles.input_container}>
                        <div className={styles.input_label_container}>
                            <div className={styles.input_label}>Instagram</div>
                        </div>
                        <input id="instagram" className={styles.input_textbox} defaultValue={this.state.piece_details['instagram']} key={this.state.piece_details['instagram']}/>
                    </div>

                    {/* Split Container For real_width / real_height */}
                    <div className={styles.input_container_split_container}>         
                        <div className={`${styles.input_container_split} ${styles.split_left}`}>
                            <div className={`${styles.input_label_container} ${styles.input_label_split}`}>
                                <div className={styles.input_label}>Width</div>
                            </div>
                            <input className={`${styles.input_textbox} ${styles.input_split}`} id="width" defaultValue={this.state.piece_details['real_width']} key={this.state.piece_details['real_width']}/>
                        </div> 
                        <div className={`${styles.input_container_split} ${styles.split_right}`}>
                            <div className={`${styles.input_label_container} ${styles.input_label_split}`}>
                                <div className={styles.input_label}>Height</div>
                            </div>
                            <input className={`${styles.input_textbox} ${styles.input_split}`} id="height" defaultValue={this.state.piece_details['real_height']} key={this.state.piece_details['real_height']}/>
                        </div> 
                    </div>

                    <div className={styles.submit_container}>
                        <button type="button" className={styles.upload_button} onClick={this.showFileUpload} >Upload</button>
                        <input type="file" ref={this.file_input_ref} className={styles.upload_file_input} onChange={this.onFileChange} />

                        <button type="submit" className={styles.submit_button}>Submit</button>
                        <div className={styles.loader_container}>
                            {loader_jsx}
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}

export default EditDetailsForm;