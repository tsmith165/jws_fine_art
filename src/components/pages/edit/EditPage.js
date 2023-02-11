import React from 'react';
import NextImage from 'next/image'

import { fetch_pieces, edit_details, create_piece, upload_image, get_upload_url } from '../../../../lib/api_calls';

import PageLayout from '../../../../src/components/layout/PageLayout'
// import EditDetailsForm from '../../../../src/components/forms/EditDetailsForm'

import styles from '../../../../styles/pages/Details.module.scss'
import form_styles from '../../../../styles/forms/EditDetailsForm.module.scss'

import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';
import { CircularProgress } from '@material-ui/core';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

class EditPage extends React.Component {
    constructor(props) {
        super(props);

        this.router = this.props.router

        console.log(`ID PROP: ${this.props.id}`)

        // Don't call this.setState() here!
        this.state = {
            debug: false,
            url_o_id: this.props.id,
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
                width:       '',
                height:      '',
                real_width:  '',
                real_height: '',
                image_path:  '',
                instagram:   '',
            },
            next_oid: null,
            last_oid: null,
            image_url: '',
            description: '',
            loading: false,
            submitted: false,
            error: false,
            uploaded: false,
            upload_error: false,
            sold: "False",
            type: 'Oil On Canvas'
        }; 

        this.fetch_pieces = this.fetch_pieces_from_api.bind(this);
        this.set_page_piece_details = this.set_page_piece_details.bind(this);
        this.delay = this.delay.bind(this);

        // File Upload
        this.showFileUpload = this.showFileUpload.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onFileChange = this.onFileChange.bind(this);
        this.refresh_data = this.refresh_data.bind(this);
        
        // Refrences
        this.file_input_ref = React.createRef(null);
        this.text_area_ref = React.createRef(null);
    }

    async componentDidMount() {
        await this.fetch_pieces_from_api()
    }

    async fetch_pieces_from_api() {
        console.log(`-------------- Fetching Initial Server List --------------`)
        const pieces = await fetch_pieces();

        console.log('Pieces fetched in state (Next Line):')
        console.log(pieces)

        this.setState({pieces: pieces}, async () => {await this.update_current_piece(this.state.url_o_id)})
    }

    async set_page_piece_details(piece_details) {
        this.setState({piece_details: piece_details, image_url: piece_details['image_path']})
    }

    async update_current_piece(o_id) {
        const pieces_length = this.state.pieces.length;

        console.log(`Piece Count: ${pieces_length} | Searching for URL_O_ID: ${o_id}`)
        const [piece_position, current_piece] = await this.get_piece_from_path_o_id(o_id);
        const piece_db_id = current_piece['id']

        console.log(`Piece Position: ${piece_position} | Piece DB ID: ${piece_db_id} | Data (Next Line):`)
        console.log(current_piece)

        const next_oid = (piece_position + 1 > pieces_length - 1) ? this.state.pieces[0]['o_id']                 : this.state.pieces[piece_position + 1]['o_id'];
        const last_oid = (piece_position - 1 < 0)                 ? this.state.pieces[pieces_length - 1]['o_id'] : this.state.pieces[piece_position - 1]['o_id'];

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

        const image_url = piece_details.image_path

        console.log("CURRENT PIECE DETAILS (Next Line):")
        console.log(piece_details)

        console.log(`Piece sold: ${piece_details['sold']} | Piece Type: ${piece_details['type']}`)

        this.setState({
            piece_position: piece_position,
            piece_db_id: piece_db_id, 
            piece: current_piece, 
            piece_details: piece_details, 
            next_oid: next_oid, 
            last_oid: last_oid, 
            image_url: image_url, 
            description: piece_details['description'], 
            sold: (piece_details['sold'] == true) ? "True" : "False", 
            type: piece_details['type']
        }, async () => {
            this.router.push(`/edit/${o_id}`) 
        })
    }

    async get_piece_from_path_o_id(o_id) {
        for (var i=0; i < this.state.pieces.length; i++) {
            if (this.state.pieces[i]['o_id'].toString() == o_id.toString()) {
                return [i, this.state.pieces[i]]
            }
        }
    }

    async handleSubmit(event) {
        console.log(`Submitting piece`)
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
    
        if (title) {
            console.log("--------------- Attempting To Edit Piece Details ---------------")
            console.log(`Editing Piece DB ID: ${this.state.piece_db_id} | Title: ${title} | Sold: ${sold}`)
            if (!this.state.uploaded) {
                const response = await edit_details(this.state.piece_db_id, title, this.state.description, type, sold, price, instagram, this.state.piece_details['width'], this.state.piece_details['height'], real_width, real_height)
    
                console.log(`Edit Piece Response (Next Line):`)
                console.log(response)
                
                this.fetch_pieces_from_api();
    
                if (response) { this.setState({loading: false, error: false, submitted: true}); }
                else { 
                    console.log('Edit Piece - No Response - Setting error = true')
                    this.setState({loading: false, error: true}); 
                }
            }
            else {
                console.log("--------------- Attempting To Create New Piece ---------------")
                console.log(`Creating piece with Title: ${title} | Sold: ${sold} | Price: ${price} | Image Path: ${this.state.piece_details['image_path']}`)
                const response = await create_piece(title, this.state.description, type, sold, price, instagram, this.state.piece_details["width"], this.state.piece_details["height"], real_width, real_height, this.state.piece_details['image_path']);
    
                console.log(`Create Piece Response (Next Line):`)
                console.log(response)
                
                this.fetch_pieces_from_api();
    
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

        var uploaded_image_path = ''
        try {
            var selected_file = event.target.files[0];
            console.log(`Selected File: ${selected_file.name} | Size: ${selected_file.size}`);
        
            const s3_upload_url = await get_upload_url(selected_file.name.toString().toLowerCase().replace(" ","_"))
            console.log(`Got Upload URL: ${s3_upload_url}`)
        
            uploaded_image_path = await upload_image(s3_upload_url, selected_file)
            console.log(`Got Upload Reponse: ${uploaded_image_path}`)
            
        }  catch (err) {
            this.setState({uploaded: false, upload_error: true});
            console.error(`S3 Image Upload Error: ${err.message}`)
            return;
        }
        
        if (uploaded_image_path == '') {
            console.error(`Failed to upload image.  Cannot load file...`)
            return;
        }

        try {
            var image = new Image();
            image.src = uploaded_image_path;
        
            //Validate the File Height and Width.
            image.onload = () => {
                console.log(`WIDTH: ${image.width} | HEIGHT: ${image.height}`)
        
                const uploaded_piece_details = {
                    title: 'Enter Title...',
                    description: 'Enter Description...',
                    sold: '',
                    price: '',
                    width: image.width,
                    height: image.height,
                    real_width: '',
                    real_height: '',
                    image_path: uploaded_image_path,
                    instagram: ''
                }
                console.log("Updating state with uploaded piece details (Next Line):")
                console.log(uploaded_piece_details)
                
                this.setState({uploaded: true, upload_error: false, piece_details: uploaded_piece_details, image_url: uploaded_image_path});
            }
        }  catch (err) {
            this.setState({uploaded: false, upload_error: true});
            console.error(`Image Load Error: ${err.message}`)
            return;
        }
    }

    delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    showFileUpload(event) {
        event.preventDefault();
        this.file_input_ref.current.click()
    }

    refresh_data() {
        this.router.replace(this.router.asPath)
    }

    render() {
        console.log(`Loading: ${this.state.loading} | Submitted: ${this.state.submitted} | Error: ${this.state.error} | Uploaded: ${this.state.uploaded}`)

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
            <PageLayout page_title={`Edit Details - ${title}`}>
                <div className={styles.details_container}>
                    <div className={styles.details_container_left}>
                        <div className={styles.details_image_container}>

                            <NextImage
                                className={styles.details_image}
                                src={this.state.image_url}
                                alt={this.state.piece_details['title']}
                                width={this.state.piece_details['width']}
                                height={this.state.piece_details['height']}
                                priority={true}
                                layout='fill'
                                objectFit='contain'
                                quality={100}
                            />

                        </div>
                    </div>
                    <div className={styles.details_container_right}>
                        <div className={form_styles.edit_details_form_container}>
                            <form method="post" onSubmit={this.handleSubmit}>
                                <div className={form_styles.title_container}>
                                    <ArrowForwardIosRoundedIcon className={`${form_styles.title_arrow} ${form_styles.img_hor_vert}`} onClick={(e) => { e.preventDefault(); this.update_current_piece(this.state.last_oid)}} />
                                    <input type="text" className={form_styles.title_input} id="title" defaultValue={this.state.piece_details['title']} key={this.state.piece_details['title']}/>
                                    <ArrowForwardIosRoundedIcon className={form_styles.title_arrow} onClick={(e) => { e.preventDefault(); this.update_current_piece(this.state.next_oid)}}/>
                                </div>

                                <div className={form_styles.edit_details_description_container}>
                                    <textarea 
                                        className={form_styles.edit_details_description_textarea} 
                                        ref={this.text_area_ref} 
                                        id="description" 
                                        value={this.state.description.split('<br>').join("\n") } 
                                        onChange={(e) => { e.preventDefault(); this.setState({ description: e.target.value }) }}
                                    />
                                </div>

                                {/* Piece Type Select */}
                                <div className={form_styles.input_container}>
                                    <div className={form_styles.input_label_container}>
                                        <div className={form_styles.input_label}>Type</div>
                                    </div>
                                    <select id="type" className={form_styles.input_select} value={ this.state.type } onChange={ (e) => this.setState({type: e.target.value}) }>
                                        <option value="Oil On Canvas">Oil On Canvas</option>
                                        <option value="Oil On Cradled Panel">Oil On Cradled Panel</option>
                                        <option value="Intaglio On Paper">Intaglio On Paper</option>
                                        <option value="Linocut On Paper">Linocut On Paper</option>
                                        <option value="Pastel On Paper">Pastel On Paper</option>
                                    </select>
                                </div>

                                {/* Sold Select */}
                                <div className={form_styles.input_container}>
                                    <div className={form_styles.input_label_container}>
                                        <div className={form_styles.input_label}>Sold</div>
                                    </div>
                                    <select id="sold" className={form_styles.input_select} value={ this.state.sold } onChange={ (e) => this.setState({sold: e.target.value}) }>
                                        <option value="True">Sold</option>
                                        <option value="False">Not Sold</option>
                                        {/*<option defaultValue="NFS">Not For Sale</option>*/}
                                    </select>
                                </div>

                                {/* Price Textbox */}
                                <div className={form_styles.input_container}>
                                    <div className={form_styles.input_label_container}>
                                        <div className={form_styles.input_label}>Price</div>
                                    </div>
                                    <input id="price" className={form_styles.input_textbox} defaultValue={this.state.piece_details['price']} key={this.state.piece_details['price']}/>
                                </div>

                                {/* Instagram Link Textbox */}
                                <div className={form_styles.input_container}>
                                    <div className={form_styles.input_label_container}>
                                        <div className={form_styles.input_label}>Instagram</div>
                                    </div>
                                    <input id="instagram" className={form_styles.input_textbox} defaultValue={this.state.piece_details['instagram']} key={this.state.piece_details['instagram']}/>
                                </div>

                                {/* Split Container For real_width / real_height */}
                                <div className={form_styles.input_container_split_container}>         
                                    <div className={`${form_styles.input_container_split} ${form_styles.split_left}`}>
                                        <div className={`${form_styles.input_label_container} ${form_styles.input_label_split}`}>
                                            <div className={form_styles.input_label}>Width</div>
                                        </div>
                                        <input className={`${form_styles.input_textbox} ${form_styles.input_split}`} id="width" defaultValue={this.state.piece_details['real_width']} key={this.state.piece_details['real_width']}/>
                                    </div> 
                                    <div className={`${form_styles.input_container_split} ${form_styles.split_right}`}>
                                        <div className={`${form_styles.input_label_container} ${form_styles.input_label_split}`}>
                                            <div className={form_styles.input_label}>Height</div>
                                        </div>
                                        <input className={`${form_styles.input_textbox} ${form_styles.input_split}`} id="height" defaultValue={this.state.piece_details['real_height']} key={this.state.piece_details['real_height']}/>
                                    </div> 
                                </div>

                                <div className={form_styles.submit_container}>
                                    <button type="button" className={form_styles.upload_button} onClick={this.showFileUpload} >Upload</button>
                                    <input type="file" ref={this.file_input_ref} className={form_styles.upload_file_input} onChange={this.onFileChange} />

                                    <button type="submit" className={form_styles.submit_button}>Submit</button>
                                    <div className={form_styles.loader_container}>
                                        {loader_jsx}
                                    </div>
                                </div>
                            </form>
                        </div>


                    </div>
                </div>
            </PageLayout>
        )
    }
}

export default EditPage;
