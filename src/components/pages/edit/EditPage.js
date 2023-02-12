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
        const passed_o_id = this.props.id;

        const piece_list = this.props.piece_list;

        console.log(`getServerSideProps Pieces (Next Line):`)
        console.log(piece_list)

        const piece_list_length = piece_list.length
        console.log(`Pieces Length: ${piece_list_length}`)

        var image_array = [];
        
        var current_piece = null;
        var piece_position = 0;
        var piece_db_id = null;
        var piece_o_id = null;

        for (var i=0; i < piece_list.length; i++) {
            if (piece_list[i]['o_id'].toString() == passed_o_id.toString()) {
                piece_position = i
            }
        }

        var title = '';
        var type = 'Oil On Canvas';
        var description = '';
        var sold = false;
        var price = 9999;
        var width = 0;
        var height = 0;
        var real_width = '';
        var real_height = '';
        var image_path = '';
        var instagram = 'p/';
        var theme = 'None';
        var available = true;

        if (piece_list_length > 0) {
            const current_piece = piece_list[piece_position]

            piece_db_id = (current_piece['id']          !== undefined) ? current_piece['id'] : ''
            piece_o_id =  (current_piece['o_id']        !== undefined) ? current_piece['o_id'] : ''
            title =       (current_piece['title']       !== undefined) ? current_piece['title'] : ''
            type =        (current_piece['type']        !== undefined) ? current_piece['type'] : 'Oil On Canvas'
            sold =        (current_piece['sold']        !== undefined) ? current_piece['sold'] : 'False'
            title =       (current_piece['title']       !== undefined) ? current_piece['title'] : ''
            description = (current_piece['description'] !== undefined) ? current_piece['description'] : ''
            price =       (current_piece['price']       !== undefined) ? current_piece['price'] : ''
            width =       (current_piece['width']       !== undefined) ? current_piece['width'] : ''
            height =      (current_piece['height']      !== undefined) ? current_piece['height'] : ''
            real_width =  (current_piece['real_width']  !== undefined) ? current_piece['real_width'] : ''
            real_height = (current_piece['real_height'] !== undefined) ? current_piece['real_height'] : ''
            image_path =  (current_piece['image_path']  !== undefined) ? `${baseURL}${current_piece['image_path']}` : ''
            instagram =   (current_piece['instagram']   !== undefined) ? current_piece['instagram'] : ''
            theme =       (current_piece['theme']       !== undefined) ? ((current_piece['theme'] == null) ? "None" : current_piece['theme']) : "None"
            available =   (current_piece['available']   !== undefined) ? current_piece['available'] : ''

            for (var i=0; i < piece_list.length; i++) {
                let piece = piece_list[i];
                image_array.push((
                    <div key={`image_${i}`} className={(i == piece_position) ? styles.details_image_container : styles.details_image_container_hidden}>
                        <NextImage
                            id={`details_image_${i}`}
                            className={styles.details_image}
                            src={(piece['image_path'].includes(baseURL)) ? piece['image_path'] : `${baseURL}${piece['image_path']}`}
                            alt={piece['title']}
                            // width={this.state.piece_details['width']}
                            // height={this.state.piece_details['height']}
                            priority={true}
                            layout='fill'
                            objectFit='contain'
                            quality={100}
                            onClick={(e) => {e.preventDefault(); this.setState({full_screen: !this.state.full_screen})}}
                        />
                    </div>
                ))
            }
        }

        this.state = {
            debug: false,
            loading: true,
            url_o_id: passed_o_id,
            piece_list: piece_list,
            image_array: image_array,
            current_piece: current_piece,
            piece_position: piece_position,
            piece_db_id: piece_db_id,
            piece_o_id: piece_o_id,
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
                theme: theme,
                available: available,
            },
            next_oid: (piece_position + 1 > piece_list_length - 1) ? piece_list[0]['o_id'] : piece_list[piece_position + 1]['o_id'],
            last_oid: (piece_position - 1 < 0) ? piece_list[piece_list_length - 1]['o_id'] : piece_list[piece_position - 1]['o_id'],
            description: description,
            title: title,
            available: available,
            sold: sold,
            price: price,
            theme: theme,
            width: width,
            height: height,
            real_width: real_width,
            real_height: real_height,
            loading: false,
            submitted: false,
            error: false,
            uploaded: false,
            upload_error: false
        }
        this.create_image_array = this.create_image_array.bind(this);

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
        // await this.update_current_piece(this.state.piece_list, this.state.url_o_id)
        // this.setState({loading: false})
    }

    async fetch_pieces_from_api(submitted=false) {
        console.log(`-------------- Fetching Initial Server List --------------`)
        const piece_list = await fetch_pieces();

        console.log('Pieces fetched in state (Next Line):')
        console.log(piece_list)
        
        var state = {piece_list: piece_list}
        if (submitted) {
            state = {piece_list: piece_list, loading: false, error: false, submitted: true}
        }
        this.setState(state, async () => {await this.update_current_piece(this.state.piece_list, this.state.url_o_id)})
    }

    async update_current_piece(piece_list, o_id) {
        const piece_list_length = piece_list.length;

        console.log(`Piece Count: ${piece_list_length} | Searching for URL_O_ID: ${o_id}`)
        const [piece_position, current_piece] = await this.get_piece_from_path_o_id(piece_list, o_id);
        const piece_db_id = current_piece['id']
        const piece_o_id = current_piece['o_id']

        console.log(`Piece Position: ${piece_position} | Piece DB ID: ${piece_db_id} | Data (Next Line):`)
        console.log(current_piece)

        const next_oid = (piece_position + 1 > piece_list_length - 1) ? piece_list[0]['o_id']                 : piece_list[piece_position + 1]['o_id'];
        const last_oid = (piece_position - 1 < 0)                 ? piece_list[piece_list_length - 1]['o_id'] : piece_list[piece_position - 1]['o_id'];

        // console.log(`Updating to new selected piece with Postition: ${piece_position} | DB ID: ${piece_db_id} | O_ID: ${o_id} | NEXT_O_ID: ${next_oid} | LAST_O_ID: ${last_oid}`)
        console.log("CURRENT PIECE (Next Line):")
        console.log(current_piece)

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
            instagram:   current_piece['instagram'],
            theme:       current_piece['theme'],
            available:   current_piece['available'],
        }

        const description = current_piece['description'].split('<br>').join("\n");

        const image_array = await this.create_image_array(this.state.piece_list, piece_position);

        const previous_url_o_id = this.state.url_o_id
        this.setState({
            loading: false,
            url_o_id: o_id,
            piece_list: piece_list,
            image_array: image_array,
            piece_position: piece_position,
            piece_db_id: piece_db_id, 
            piece_o_id: piece_o_id,
            piece: current_piece, 
            piece_details: piece_details, 
            next_oid: next_oid, 
            last_oid: last_oid, 
            description: description, 
            title: piece_details['title'],
            price: piece_details['price'],
            sold: (piece_details['sold'] == true) ? "True" : "False", 
            type: piece_details['type'],
            theme: (piece_details['theme'] == null) ? "None" : piece_details['theme'],
            available: (piece_details['available'] == true) ? "True" : "False", 
            instagram: piece_details['instagram'],
            width: piece_details['width'],
            height: piece_details['height'],
            real_width: piece_details['real_width'],
            real_height: piece_details['real_height']
        }, async () => {
            if (previous_url_o_id != o_id) {
                this.router.push(`/edit/${o_id}`) 
            }
        })
    }

    async create_image_array(piece_list, piece_position) {
        var image_array = [];
        for (var i=0; i < piece_list.length; i++) {
            let piece = piece_list[i];
            image_array.push((
                <div key={`image_${i}`} className={(i == piece_position) ? styles.details_image_container : styles.details_image_container_hidden}>
                    <NextImage
                        id={`details_image_${i}`}
                        className={styles.details_image}
                        src={(piece['image_path'].includes(baseURL)) ? piece['image_path'] : `${baseURL}${piece['image_path']}`}
                        alt={piece['title']}
                        // width={this.state.piece_details['width']}
                        // height={this.state.piece_details['height']}
                        priority={true}
                        layout='fill'
                        objectFit='contain'
                        quality={100}
                        onClick={(e) => {e.preventDefault(); this.setState({full_screen: !this.state.full_screen})}}
                    />
                </div>
            ))
        }
        return image_array
    }

    async get_piece_from_path_o_id(piece_list, o_id) {
        for (var i=0; i < piece_list.length; i++) {
            if (piece_list[i]['o_id'].toString() == o_id.toString()) {
                return [i, piece_list[i]]
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
        const theme       = event.target.elements.theme.value;
        const available   = event.target.elements.available.value;
    
        if (title) {
            console.log("--------------- Attempting To Edit Piece Details ---------------")
            console.log(`Editing Piece DB ID: ${this.state.piece_db_id} | Title: ${title} | Sold: ${sold}`)
            if (!this.state.uploaded) {
                const response = await edit_details(this.state.piece_db_id, title, this.state.description, type, sold, price, instagram, this.state.piece_details['width'], this.state.piece_details['height'], real_width, real_height, theme, available)
    
                console.log(`Edit Piece Response (Next Line):`)
                console.log(response)
    
                if (response) { await this.fetch_pieces_from_api(true) }
                else { 
                    console.log('Edit Piece - No Response - Setting error = true')
                    this.setState({loading: false, error: true}); 
                }
            }
            else {
                console.log("--------------- Attempting To Create New Piece ---------------")
                console.log(`Creating piece with Title: ${title} | Sold: ${sold} | Price: ${price} | Image Path: ${this.state.piece_details['image_path']}`)
                const response = await create_piece(title, this.state.description, type, sold, price, instagram, this.state.piece_details["width"], this.state.piece_details["height"], real_width, real_height, this.state.piece_details['image_path'], theme, available);
    
                console.log(`Create Piece Response (Next Line):`)
                console.log(response)
    
                if (response) { await this.fetch_pieces_from_api(true)}
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
            image.onload = async () => {
                console.log(`WIDTH: ${image.width} | HEIGHT: ${image.height}`)

                console.log(`Creating piece with image path: ${uploaded_image_path}`)

                var new_piece_list = this.state.piece_list
                new_piece_list.push({
                    "id": -1,
                    "o_id": -1,
                    "class_name": "temp",
                    "title": "temp",
                    "image_path": uploaded_image_path,
                    "width": 0,
                    "height": 0,
                    "description": "",
                    "type": "Intaglio On Paper",
                    "sold": 'True',
                    "price": 0,
                    "instagram": "",
                    "real_width": 0,
                    "real_height": 0,
                    "active": true
                })

                const new_image_array = await this.create_image_array(new_piece_list, new_piece_list.length - 1)
        
                const uploaded_piece_details = {
                    title: 'Enter Title...',
                    description: 'Enter Description...',
                    sold: false,
                    price: 9999,
                    width: image.width,
                    height: image.height,
                    real_width: 0,
                    real_height: 0,
                    image_path: uploaded_image_path,
                    instagram: 'p/',
                    theme: 'None',
                    available: true
                }
                console.log("Updating state with uploaded piece details (Next Line):")
                console.log(uploaded_piece_details)
                
                this.setState({
                    uploaded: true, 
                    upload_error: false, 
                    image_array: new_image_array, 
                    piece_list: new_piece_list,
                    piece_position: new_piece_list.length - 1,
                    piece_details: uploaded_piece_details, 
                    description: uploaded_piece_details['description'],
                    title: uploaded_piece_details['title'],
                    available: uploaded_piece_details['available'],
                    sold: uploaded_piece_details['sold'],
                    price: uploaded_piece_details['price'],
                    theme: uploaded_piece_details['theme'],
                    instagram: uploaded_piece_details['instagram'],
                    width: uploaded_piece_details['width'],
                    height: uploaded_piece_details['height'],
                    real_width: uploaded_piece_details['real_width'],
                    real_height: uploaded_piece_details['real_height'],
                });
            }
        }  catch (err) {
            this.setState({uploaded: false, upload_error: true});
            console.error(`Image Load Error: ${err.message}`)
            return;
        }
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
        } else if ( (this.state.piece_details.width != '' && this.state.piece_details.height != '') && (this.state.piece_details.width > 1500 && this.state.piece_details.height > 1500 ) ) {
            if (this.state.uploaded == true) {
                loader_jsx = ( <div className={form_styles.submit_label_warning}>{`Image upload successful but image resolution is too high!  Re-Upload with width / height < 1500px`}</div> );
            } else {
                loader_jsx = ( <div className={form_styles.submit_label_warning}>{`Uploaded image resolution is too high!  Re-Upload with width / height < 1500px`}</div> );
            }
        } else if ( (this.state.piece_details.width != '' && this.state.piece_details.height != '') && (this.state.piece_details.width < 1000 && this.state.piece_details.height < 1000 ) ) {
            if (this.state.uploaded == true) {
                loader_jsx = ( <div className={form_styles.submit_label_warning}>{`Image upload successful but image resolution is low!  Re-Upload with width / height > 1000px`}</div> );
            } else {
                loader_jsx = ( <div className={form_styles.submit_label_warning}>{`Uploaded image resolution is low!  Re-Upload with width / height > 1000px`}</div> );
            }
        } else if (this.state.uploaded == true) {
            loader_jsx = ( <div className={form_styles.submit_label}>Image Upload was successful...</div> );
        }  else if (this.state.upload_error == true) {
            loader_jsx = ( <div className={form_styles.submit_label_failed}>Image Upload was NOT successful...</div> );
        }

        return (
            <PageLayout page_title={ (this.state.title == '') ? (`Edit Details`) : (`Edit Details - ${this.state.title}`) }>
                <div className={styles.details_container}>
                    <div className={styles.details_container_left}>
                        <div className={styles.details_image_outer_container}>
                            {this.state.image_array}
                        </div>
                    </div>
                    <div className={styles.details_container_right}>
                        <div className={form_styles.edit_details_form_container}>
                            <form method="post" onSubmit={this.handleSubmit}>
                                <div className={form_styles.title_container}>
                                    <ArrowForwardIosRoundedIcon className={`${form_styles.title_arrow} ${form_styles.img_hor_vert}`} onClick={(e) => { e.preventDefault(); this.update_current_piece(this.state.piece_list, this.state.last_oid)}} />
                                    <input type="text" className={form_styles.title_input} id="title" value={ this.state.title } key={ "title" } onChange={ (e) => {e.preventDefault(); this.setState({title: e.target.value}); }}/>
                                    <ArrowForwardIosRoundedIcon className={form_styles.title_arrow} onClick={(e) => { e.preventDefault(); this.update_current_piece(this.state.piece_list, this.state.next_oid)}}/>
                                </div>

                                <div className={form_styles.edit_details_description_container}>
                                    <textarea 
                                        className={form_styles.edit_details_description_textarea} 
                                        ref={this.text_area_ref} 
                                        id="description" 
                                        value={this.state.description }
                                        key={'description'}
                                        onChange={(e) => { e.preventDefault(); this.setState({ description: e.target.value.split('<br>').join("\n") }) }}
                                    />
                                </div>

                                {/* Piece Type Select */}
                                <div className={form_styles.input_container}>
                                    <div className={form_styles.input_label_container}>
                                        <div className={form_styles.input_label}>Type</div>
                                    </div>
                                    <select id="type" className={form_styles.input_select} value={ this.state.type } key={'type'} onChange={ (e) => {e.preventDefault(); this.setState({type: e.target.value}); } }>
                                        <option value="Oil On Canvas">Oil On Canvas</option>
                                        <option value="Oil On Cradled Panel">Oil On Cradled Panel</option>
                                        <option value="Intaglio On Paper">Intaglio On Paper</option>
                                        <option value="Linocut On Paper">Linocut On Paper</option>
                                        <option value="Pastel On Paper">Pastel On Paper</option>
                                    </select>
                                </div>

                                {/* Instagram Link Textbox */}
                                <div className={form_styles.input_container}>
                                    <div className={form_styles.input_label_container}>
                                        <div className={form_styles.input_label}>Instagram</div>
                                    </div>
                                    <input id="instagram" className={form_styles.input_textbox} value={ this.state.instagram } key={'instagram'} onChange={ (e) => {e.preventDefault(); this.setState({instagram: e.target.value}); }}/>
                                </div>


                                {/* Split Container For Available / sold */}
                                <div className={form_styles.input_container_split_container}>         
                                    <div className={`${form_styles.input_container_split} ${form_styles.split_left}`}>
                                        <div className={`${form_styles.input_label_container} ${form_styles.input_label_split}`}>
                                            <div className={form_styles.input_label}>Available</div>
                                        </div>
                                        <select id="available" className={form_styles.input_select} value={ this.state.available } key={'available'} onChange={ (e) => {e.preventDefault(); this.setState({available: e.target.value}); } }>
                                            <option value="True">True</option>
                                            <option value="False">False</option>
                                        </select>
                                    </div>  
                                    <div className={`${form_styles.input_container_split} ${form_styles.split_right}`}>
                                        <div className={`${form_styles.input_label_container} ${form_styles.input_label_split}`}>
                                            <div className={form_styles.input_label}>Sold</div>
                                        </div>
                                        <select id="sold" className={form_styles.input_select} value={ this.state.sold } key={'sold'} onChange={ (e) => {e.preventDefault(); this.setState({sold: e.target.value}); } }>
                                            <option value="True">Sold</option>
                                            <option value="False">Not Sold</option>
                                            {/*<option defaultValue="NFS">Not For Sale</option>*/}
                                        </select>
                                    </div> 
                                </div>

                                {/* Split Container For Theme / Available */}
                                <div className={form_styles.input_container_split_container}>         
                                    <div className={`${form_styles.input_container_split} ${form_styles.split_left}`}>
                                        <div className={`${form_styles.input_label_container} ${form_styles.input_label_split}`}>
                                            <div className={form_styles.input_label}>Theme</div>
                                        </div>
                                        <select id="theme" className={form_styles.input_select} value={ this.state.theme } key={'theme'} onChange={ (e) => {e.preventDefault(); this.setState({theme: e.target.value}); } }>
                                            <option value="Ocean">Ocean</option>
                                            <option value="Snow">Snow</option>
                                            <option value="Landscape">Landscape</option>
                                            <option value="Black and White">Black and White</option>
                                            <option value="None">None</option>
                                        </select>
                                    </div>
                                    <div className={`${form_styles.input_container_split} ${form_styles.split_right}`}>
                                        <div className={`${form_styles.input_label_container} ${form_styles.input_label_split}`}>
                                            <div className={form_styles.input_label}>Price</div>
                                        </div>
                                        <input id="price" className={form_styles.input_textbox} value={this.state.price} key={'price'} onChange={ (e) => {e.preventDefault(); this.setState({price: e.target.value}); }}/>
                                    </div>
                                </div>

                                {/* Split Container For real_width / real_height */}
                                <div className={form_styles.input_container_split_container}>         
                                    <div className={`${form_styles.input_container_split} ${form_styles.split_left}`}>
                                        <div className={`${form_styles.input_label_container} ${form_styles.input_label_split}`}>
                                            <div className={form_styles.input_label}>Width</div>
                                        </div>
                                        <input className={`${form_styles.input_textbox} ${form_styles.input_split}`} id="width" value={this.state.real_width} key={'real_width'} onChange={ (e) => {e.preventDefault(); this.setState({real_width: e.target.value}); }}/>
                                    </div> 
                                    <div className={`${form_styles.input_container_split} ${form_styles.split_right}`}>
                                        <div className={`${form_styles.input_label_container} ${form_styles.input_label_split}`}>
                                            <div className={form_styles.input_label}>Height</div>
                                        </div>
                                        <input className={`${form_styles.input_textbox} ${form_styles.input_split}`} id="height" value={this.state.real_height} key={'real_height'} onChange={ (e) => {e.preventDefault(); this.setState({real_height: e.target.value}); }}/>
                                    </div> 
                                </div>

                                {/* Split Container For image pixel width / pixel height */}
                                <div className={form_styles.input_container_split_container}>         
                                    <div className={`${form_styles.input_container_split} ${form_styles.split_left}`}>
                                        <div className={`${form_styles.input_label_container} ${form_styles.input_label_split}`}>
                                            <div className={form_styles.input_label}>Pixel Width</div>
                                        </div>
                                        <input className={`${form_styles.input_textbox} ${form_styles.input_split}`} id="pixel_width" value={this.state.width} key={'width'} onChange={ (e) => {e.preventDefault(); this.setState({width: e.target.value}); }}/>
                                    </div> 
                                    <div className={`${form_styles.input_container_split} ${form_styles.split_right}`}>
                                        <div className={`${form_styles.input_label_container} ${form_styles.input_label_split}`}>
                                            <div className={form_styles.input_label}>Pixel Height</div>
                                        </div>
                                        <input className={`${form_styles.input_textbox} ${form_styles.input_split}`} id="pixel_height" value={this.state.height} key={'height'} onChange={ (e) => {e.preventDefault(); this.setState({height: e.target.value}); }}/>
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
