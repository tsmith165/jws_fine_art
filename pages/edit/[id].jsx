import logger from '@/lib/logger';
import PROJECT_CONSTANTS from '@/lib/constants';

import React from 'react';
import { withRouter } from 'next/router';

import { prisma } from '@/lib/prisma';

import CustomNextImage from '@/components/components/CustomNextImage';

import { fetch_pieces, edit_details, create_piece, upload_image, get_upload_url, updateExtraImagesOrder, deleteExtraImage } from '@/lib/api_calls';

import PageLayout from '@/components/layout/PageLayout';

import InputComponent from '@/components/components/InputComponent';

import mobile_styles from '@/styles/pages/DetailsMobile.module.scss';
import desktop_styles from '@/styles/pages/DetailsDesktop.module.scss';

import edit_details_styles from '@/styles/pages/EditDetails.module.scss';
import form_styles from '@/styles/forms/Form.module.scss';
import title_styles from '@/styles/components/TitleInputTextbox.module.scss';

import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import CircularProgress from '@mui/material/CircularProgress';
import PageviewIcon from '@mui/icons-material/Pageview';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';


class Edit extends React.Component {
    constructor(props) {
        super(props);

        const passed_o_id = this.props.router.query.id;
        logger.section({message: `LOADING EDIT DETAILS PAGE - Piece ID: ${passed_o_id}`});

        const piece_list = this.props.piece_list;
        const num_pieces = piece_list.length;

        logger.extra(`getServerSideProps piece_list length: ${num_pieces} | Piece List Type: ${typeof piece_list} | Data (Next Line):`);
        logger.extra(piece_list);

        var piece_position = 0;

        for (var i = 0; i < piece_list.length; i++) {
            if (piece_list[i]['o_id'].toString() == passed_o_id.toString()) {
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
        var theme  = num_pieces < 1 ? 'None' : current_piece.theme !== undefined ? current_piece.theme == null ? 'None' : current_piece.theme : 'None';
        var framed = num_pieces < 1 ? 'False' : current_piece.framed == true || current_piece.framed.toString().toLowerCase() == 'true' ? 'True' : 'False';
        var sold   = num_pieces < 1 ? 'False' : current_piece.sold == true || current_piece.sold.toString().toLowerCase() == 'true' ? 'True' : 'False';
        var available   = num_pieces < 1 ? '' : current_piece.available == true || current_piece.available.toString().toLowerCase() == 'true' ? 'True' : 'False';
        var piece_type  = num_pieces < 1 ? '' : current_piece.piece_type !== undefined ? current_piece.piece_type : piece_type;
        var comments    = num_pieces < 1 ? '' : current_piece.comments !== undefined ? current_piece.comments : '';
        var description = num_pieces < 1 ? '' : current_piece.description !== undefined ? current_piece.description.split('<br>').join('\n') : '';
        var real_width  = num_pieces < 1 ? '' : current_piece.real_width !== undefined ? current_piece.real_width : '';
        var real_height = num_pieces < 1 ? '' : current_piece.real_height !== undefined ? current_piece.real_height : '';
        var instagram   = num_pieces < 1 ? '' : current_piece.instagram !== undefined ? current_piece.instagram : '';

        var image_path  = num_pieces < 1 ? '' : current_piece.image_path === undefined ? '' : 
                                                current_piece.image_path.includes(PROJECT_CONSTANTS.AWS_BUCKET_URL) ? current_piece.image_path : 
                                                `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${current_piece.image_path}`;


        // Extra Images
        var extra_images = [undefined, null, ''].includes(current_piece.extra_images) ? [] : current_piece.extra_images;
        logger.debug(`Edit Page ${passed_o_id} Extra Images: "${extra_images}"`)

        extra_images = typeof extra_images === 'string' ? JSON.parse(extra_images) : extra_images;
        extra_images  = num_pieces < 1 ? [] : [undefined, null, ''].includes(extra_images) ? [] : extra_images
        logger.debug(`Using Extra Images: "${extra_images}"`)

        // Progress Images
        var progress_images = [undefined, null, ''].includes(current_piece.progress_images) ? [] : current_piece.progress_images;
        logger.debug(`Edit Page ${passed_o_id} Progress Images: "${progress_images}"`)
        
        progress_images = typeof progress_images === 'string' ? JSON.parse(progress_images) : progress_images;
        progress_images  = num_pieces < 1 ? [] : [undefined, null, ''].includes(progress_images) ? [] : progress_images
        logger.debug(`Using Progress Images: "${progress_images}"`)
        /* prettier-ignore-end */

        var theme_options = [{ value: theme, label: theme }];
        if (theme != 'None' && theme.includes(', ')) {
            // logger.extra(`Splitting theme string: ${theme}`);
            theme_options = [];
            theme.split(', ').forEach(function (theme_string) {
                if (theme_string.length > 1) {
                    // logger.extra(`Adding theme string ${theme_string} to options...`);
                    theme_options.push({ value: theme_string, label: theme_string });
                }
            });
        }

        var image_array = [];

        logger.extra(`Setting initial state theme to: ${theme} | options (Next line):`);
        logger.extra(theme_options);

        this.state = {
            window_width: null,
            window_height: null,
            styles: desktop_styles,
            url_o_id: passed_o_id,
            piece_list: piece_list,
            image_array: image_array,
            extra_images: extra_images,
            progress_images: progress_images,
            current_piece: current_piece,
            piece_position: piece_position,
            db_id: db_id,
            o_id: o_id,
            image_path: image_path,
            piece_type: piece_type,
            description: description,
            title: title,
            available: available,
            sold: sold,
            price: price,
            instagram: instagram,
            theme: theme,
            theme_options: theme_options,
            width: width,
            height: height,
            real_width: real_width,
            real_height: real_height,
            framed: framed,
            comments: comments,
            next_oid:
                piece_position + 1 > num_pieces - 1 // if next piece is out of bounds (greater than piece list length), set to first piece
                    ? piece_list[0]['o_id']
                    : piece_list[piece_position + 1]['o_id'],
            last_oid:
                piece_position - 1 < 0 // if last piece is out of bounds (less than 0), set to last piece
                    ? piece_list[num_pieces - 1]['o_id']
                    : piece_list[piece_position - 1]['o_id'],
            loading: true,
            updating: false,
            resizing: false,
            uploading: false,
            updated: false,
            uploaded: false,
            upload_error: false,
            uploaded_image_path: '',
            file_upload_type: 'cover',
            error: false,
            staging_db_id: -2,
            selected_gallery_image: 0
        };
        this.create_image_array = this.create_image_array.bind(this);
        this.get_piece_from_path_o_id = this.get_piece_from_path_o_id.bind(this);
        this.handle_multi_select_change = this.handle_multi_select_change.bind(this);
        this.update_field_value = this.update_field_value.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.create_blank_piece = this.create_blank_piece.bind(this);

        // File Upload
        this.showFileUpload = this.showFileUpload.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onFileChange = this.onFileChange.bind(this);
        this.refresh_data = this.refresh_data.bind(this);
        this.load_changed_images = this.load_changed_images.bind(this);
        this.load_image_arrays = this.load_image_arrays.bind(this);
        this.resizeImage = this.resizeImage.bind(this);

        // Refrences
        this.file_input_ref = React.createRef(null);
        this.text_area_ref = React.createRef(null);
    }


    async componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);

        this.update_state({
            staging_db_id: -2,
        });
    }

    async componentDidMount() {
        var image_array = [];
        var extra_image_array = [];
        const num_pieces = this.state.piece_list.length;
        if (num_pieces > 0) {
            image_array = await this.create_image_array(this.state.piece_list, this.state.piece_position, this.state.staging_db_id, true);

            extra_image_array = await this.create_extra_image_array(this.state.extra_images, this.state.selected_gallery_image);
        }
       
        logger.extra(`Setting state with Piece Position: ${this.state.piece_position} | piece list length: ${num_pieces}`);
        this.update_state({
            loading: false,
            window_width: window.innerWidth,
            window_height: window.innerHeight,
            image_array: image_array,
            extra_image_array: extra_image_array,
            next_oid:
                this.state.piece_position + 1 > num_pieces - 1
                    ? this.state.piece_list[0]['o_id']
                    : this.state.piece_list[this.state.piece_position + 1]['o_id'],
            last_oid:
                this.state.piece_position - 1 < 0
                    ? this.state.piece_list[num_pieces - 1]['o_id']
                    : this.state.piece_list[this.state.piece_position - 1]['o_id']
        });

        window.addEventListener("resize", this.handleResize); // Add event listener
    }

    async update_state_with_callback(state, callback) {
        logger.debug(`Updating state with object (Next Line):`);
        logger.debug(state);

        this.setState(prevState => ({ ...prevState, ...state }), () => { 
            logger.debug(`Updated state (Next Line):`);
            logger.debug(this.state);

            callback();
        });
    }

    update_state(state) {
        logger.debug(`Updating state with object (Next Line):`);
        logger.debug(state);
    
        this.setState(prevState => ({ ...prevState, ...state }), () => { 
            logger.debug(`Updated state (Next Line):`);
            logger.debug(this.state);
        });
    }

    async update_field_value(field, new_value_object) {
        const key_name = field.toLowerCase();
        const new_value = typeof new_value_object === "string" ? new_value_object : new_value_object.value;
        logger.debug(`Setting state on key: ${key_name} | Value: ${new_value}`);

        this.setState(prevState => ({ ...prevState, [key_name]: new_value }), () => { 
            logger.debug(`Updated key value: ${this.state[key_name]}`) 
        });
    }

    handleResize() {
        logger.debug(`Window Width: ${window.innerWidth} | Height: ${window.innerHeight}`);
        this.update_state({
            window_width: window.innerWidth,
            window_height: window.innerHeight
        });
    }

    async fetch_pieces_from_api(type = 'none') {
        logger.section({message: `Fetching Initial Server List`});
        this.update_state({ loading: true, updated: false });

        const piece_list = await fetch_pieces();
        piece_list.sort((a, b) => a['o_id'] - b['o_id']);

        // Add AWS bucket URL to the image_path if not exists
        piece_list.forEach((piece) => {
            piece.image_path = piece.image_path.includes(PROJECT_CONSTANTS.AWS_BUCKET_URL) ? piece.image_path : `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${piece.image_path}`;
        });

        logger.extra('Pieces fetched in state (Next Line):');
        logger.extra(piece_list);

        const state = type == 'none' ?  { piece_list: piece_list, loading: false } : { 
            piece_list: piece_list, 
            loading: false, 
            updating: false, 
            uploading: false,
            updated: type == 'updated' ? true : false,
            uploaded: type == 'uploaded' ? true : false,
            staging_db_id: type == 'updated' ? -2 : this.state.staging_db_id,
        };
        logger.extra(`Setting state with type: ${type} (Next Line):`);
        logger.extra(state)
        this.update_state_with_callback(state, async () => {
            await this.update_current_piece(this.state.piece_list, this.state.url_o_id, type == 'none' ? false : true);
        });
    }

    async update_current_piece(piece_list, o_id, preserve_submit_state = false) {
        this.update_state({ loading: true });

        const num_pieces = piece_list.length;

        logger.section(`Updating Current Piece to o_id: ${o_id}`);
        const piece_from_path_o_id = await this.get_piece_from_path_o_id(piece_list, o_id);
        const [piece_position, current_piece] = piece_from_path_o_id;
        const current_db_id = current_piece.id;
        const current_o_id = current_piece.o_id;

        logger.extra(`Piece Position: ${piece_position} | Current DB ID: ${current_db_id} | Data (Next Line):`);
        logger.extra(current_piece);

        const next_oid = piece_position + 1 > num_pieces - 1 ? piece_list[0].o_id : piece_list[piece_position + 1].o_id;
        const last_oid = piece_position - 1 < 0 ? piece_list[num_pieces - 1].o_id : piece_list[piece_position - 1].o_id;

        var theme = current_piece.theme == null || current_piece.theme == undefined ? 'None' : current_piece.theme;
        var theme_options = [{ value: theme, label: theme }];

        if (theme != 'None' && theme.includes(', ')) {
            theme_options = [];
            theme.split(', ').forEach(function (theme_string) {
                if (theme_string.length > 1) {
                    logger.extra(`Adding theme string ${theme_string} to options...`);
                    theme_options.push({ value: theme_string, label: theme_string });
                }
            });
        }

        logger.extra(`Setting theme to: ${theme} | framed: ${current_piece.framed} | options (Next line):`);
        logger.extra(theme_options);

        const image_array = await this.create_image_array(this.state.piece_list, piece_position, this.state.staging_db_id, true);

        // Extra Images
        var extra_images = [undefined, null, ''].includes(current_piece.extra_images) ? [] : current_piece.extra_images;
        logger.debug(`Current Piece Extra Images: "${extra_images}"`)

        extra_images = typeof extra_images === 'string' ? JSON.parse(extra_images) : extra_images;
        extra_images  = num_pieces < 1 ? [] : [undefined, null, ''].includes(extra_images) ? [] : extra_images
        logger.debug(`Using Extra Images: "${extra_images}"`)

        // Progress Images
        var progress_images = [undefined, null, ''].includes(current_piece.progress_images) ? [] : current_piece.progress_images;
        logger.debug(`Current Piece Progress Images: "${progress_images}"`)
        
        progress_images = typeof progress_images === 'string' ? JSON.parse(progress_images) : progress_images;
        progress_images  = num_pieces < 1 ? [] : [undefined, null, ''].includes(progress_images) ? [] : progress_images
        logger.debug(`Using Progress Images: "${progress_images}"`)

        const extra_image_array = await this.create_extra_image_array(extra_images, this.state.selected_gallery_image);

        const previous_url_o_id = this.state.url_o_id;
        this.update_state(
            {
                url_o_id: current_o_id,
                piece_list: piece_list,
                image_array: image_array,
                extra_image_array: extra_image_array,
                piece_position: piece_position,
                db_id: current_db_id,
                o_id: current_o_id,
                current_piece: current_piece,
                next_oid: next_oid,
                last_oid: last_oid,
                title: current_piece.title,
                piece_type: current_piece.piece_type,
                description: current_piece.description.split('<br>').join('\n'),
                price: current_piece.price,
                width: current_piece.width,
                height: current_piece.height,
                real_width: current_piece.real_width,
                real_height: current_piece.real_height,
                image_path: current_piece.image_path.includes(PROJECT_CONSTANTS.AWS_BUCKET_URL) ? current_piece.image_path : `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${current_piece.image_path}`,
                instagram: current_piece.instagram,
                available: current_piece.available == true || current_piece.available.toString().toLowerCase() == 'true' ? 'True' : 'False',
                sold: current_piece.sold == true || current_piece.sold.toString().toLowerCase() == 'true' ? 'True' : 'False',
                framed: current_piece.framed == true || current_piece.framed.toString().toLowerCase() == 'true' ? 'True' : 'False',
                comments: current_piece.comments,
                theme: theme,
                theme_options: theme_options,
                loading: false,
                updating: false,
                uploading: false,
                updated: false,
                error: false,
                updated: preserve_submit_state == true ? this.state.updated : false,
                uploaded: preserve_submit_state == true ? this.state.uploaded : false,
                upload_error: false,
                extra_images: extra_images,
                progress_images: progress_images,
                selected_gallery_image: 0,
            },
            async () => {
                if (previous_url_o_id != o_id) {
                    this.props.router.push(`/edit/${o_id}`);
                }
            },
        );
    }

    async create_image_array(piece_list, piece_position, db_id, only_load_cover = false) {
        const styles = window.innerWidth === undefined ? desktop_styles : window.innerWidth > 1800 ? desktop_styles : mobile_styles;

        var image_array = [];
        for (var i = 0; i < piece_list.length; i++) {
            let piece = piece_list[i];
            if (i == piece_position) {
                logger.debug(`Staging DB ID: ${db_id} | Current index: ${piece.id}`)
            } else {
                if (only_load_cover == true) {
                    continue
                }
            }

            image_array.push(
                <div key={`image_${i}`} className={i == piece_position ? styles.centered_image_container : styles.centered_image_container_hidden}>
                    { (db_id == -1) ? (null) : (db_id != piece.id) ? null : (
                        <div className={styles.centered_image_staging}>Staging</div>
                    )}
                    <CustomNextImage
                        id={`centered_image_${i}`}
                        className={styles.centered_image}
                        src={piece.image_path}
                        alt={piece['title']}
                        priority={i > piece_position - 3 && i < piece_position + 3 ? true : false}
                        width={piece.width}
                        height={piece.height}
                        quality={100}
                    />
                </div>
            );
        }
        return image_array;
    }

    async create_extra_image_array(extra_images, selected_image_index) {
        const styles = window.innerWidth === undefined ? desktop_styles : window.innerWidth > 1800 ? desktop_styles : mobile_styles;

        var using_extra_images = typeof extra_images === 'string' ? JSON.parse(extra_images) : extra_images;

        var extra_image_array = [];
        using_extra_images.map((image, index) => {
            extra_image_array.push(
                <div key={`extra_image_${index}`} className={index == (selected_image_index) ? styles.centered_image_container : styles.centered_image_container_hidden}>
                    <CustomNextImage
                        id={`extra_image_${index}`}
                        className={styles.centered_image}
                        src={image.image_path}
                        alt={image.image_path}
                        priority={true}
                        width={300}
                        height={300}
                        quality={100}
                    />
                </div>
            );
        });
        
        return extra_image_array;
    }

    async get_piece_from_path_o_id(piece_list, o_id) {
        for (var i = 0; i < piece_list.length; i++) {
            if (piece_list[i]['o_id'].toString() == o_id.toString()) {
                return [i, piece_list[i]];
            }
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        this.update_state({ updating: true, updated: false });

        if (!title) {
            this.update_state({ updating: false, error: true });
            return
        }

        logger.section({message: 'Attempting To Edit Piece Details'});
        logger.debug(
            `Editing Piece DB ID: ${this.state.db_id} | Title: ${this.state.title} | Sold: ${this.state.sold} |` + 
            `Framed: ${this.state.framed} | Piece Type: ${this.state.piece_type} | Price: ${this.state.price} |` + 
            `Image Path: ${this.state.image_path} | Description: ${this.state.description} | Instagram: ${this.state.instagram}`,
        );
        if (!this.state.uploaded) {
            const response = await edit_details({
                id: this.state.db_id,
                title: this.state.title,
                description: this.state.description,
                piece_type: this.state.piece_type,
                sold: this.state.sold,
                price: this.state.price,
                instagram: this.state.instagram,
                width: this.state.width,
                height: this.state.height,
                real_width: this.state.real_width,
                real_height: this.state.real_height,
                theme: this.state.theme,
                available: this.state.available,
                framed: this.state.framed,
                comments: this.state.comments,
                image_path: `/${this.state.uploaded_image_path.split('/').slice(-2).join('/')}`,
                extra_images: JSON.stringify(this.state.extra_images),
                progress_images: JSON.stringify(this.state.progress_images),
            });

            logger.debug(`Edit Piece Response (Next Line):`);
            logger.debug(response);

            if (response) {
                await this.fetch_pieces_from_api('updated');
            } else {
                logger.debug('Edit Piece - No Response - Setting error = true');
                this.update_state({ loading: false, error: true });
            }
        } else {
            logger.section({message: 'Attempting To Create New Piece'});
            logger.debug(`Creating piece with Title: ${title} | Sold: ${sold} | Price: ${price} | Image Path: ${this.state.image_path}`);
            const response = await create_piece({
                title: this.state.title,
                description: this.state.description,
                piece_type: this.state.piece_type,
                sold: this.state.sold,
                price: this.state.price,
                instagram: this.state.instagram,
                width: this.state.width,
                height: this.state.height,
                real_width: this.state.real_width,
                real_height: this.state.real_height,
                image_path: this.state.image_path,
                theme: this.state.theme,
                available: this.state.available,
                framed: this.state.framed,
                comments: this.state.comments,
            });
                

            logger.debug(`Create Piece Response (Next Line):`);
            logger.debug(response);

            if (response) {
                await this.fetch_pieces_from_api('uploaded');
            } else {
                this.update_state({ loading: false, updating: false, error: true });
            }
        }
    }

    async onFileChange(event) {
        event.preventDefault();
        this.update_state({ loading: false, uploading: false, resizing: true })

        logger.section({message: 'File Input Change Event Triggered'});

        try {
            var selected_file = event.target.files[0];
            var file_name = selected_file.name.replace(/\s+/g, '_'); // Replace spaces with underscore
            var file_extension = file_name.split(".").pop().toLowerCase();
            var title = this.state.title.toLowerCase().replace().replace(/\s+/g, '_'); // Replace spaces with underscore

            this.update_state({ loading: false, uploading: true, resizing: false })

            if (this.state.file_upload_type === 'extra') {
                let current_index = this.state.extra_images.length < 1 ? 1 : (this.state.extra_images.length + 1);
                file_name = `${title}_extra_${current_index}`;
                selected_file = await this.resizeImage(selected_file, 1200, 1200); 
                logger.debug(`Resized ${this.state.file_upload_type} image: ${selected_file} | Resized Size: ${selected_file.size}`)
            }
            if (this.state.file_upload_type === 'progress') {
                let current_index = this.state.progress_images.length < 1 ? 1 : (this.state.progress_images.length + 1);
                file_name = `${title}_progress_${current_index}`;
                selected_file = await this.resizeImage(selected_file, 1200, 1200); 
                logger.debug(`Resized ${this.state.file_upload_type} image: ${selected_file} | Resized Size: ${selected_file.size}`)
            }
            if (this.state.file_upload_type === 'cover') {
                file_name = `${title}`;
                selected_file = await this.resizeImage(selected_file, 1920, 1920); 
                logger.debug(`Resized ${this.state.file_upload_type} image: ${selected_file} | Resized Size: ${selected_file.size}`)
            }
            
            const pre_update_image_filename = this.state.image_path.split('/').pop();
            logger.debug(`Pre-Update FileName: ${pre_update_image_filename} | Current FileName: ${file_name}`)
            if (pre_update_image_filename.includes(file_name)) {
                var current_index = 1
                if (pre_update_image_filename.includes('update_')) {
                    current_index = parseInt(pre_update_image_filename.split('update_').pop()) + 1
                }
                file_name = `${file_name}-update_${current_index}`
            }

            const file_name_with_extension = `${file_name}.${file_extension}`;

            const s3_upload_url = await get_upload_url(file_name_with_extension, this.state.file_upload_type);
            logger.debug(`Got Upload URL: ${s3_upload_url}`);

            var uploaded_image_path = await upload_image(s3_upload_url, selected_file);
            logger.debug(`Got Upload Reponse: ${uploaded_image_path}`);

            this.update_state({ loading: true, uploading: false, resizing: false })
            this.load_changed_images(uploaded_image_path)

        } catch (err) {
            this.update_state({ uploaded: false, upload_error: true, loading: true, uploading: false, resizing: false });
            logger.error(`S3 Image Upload Error: ${err.message}`);
            return false
        }
    }

    async resizeImage(file, maxWidth, maxHeight) {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = function() {
                let canvas = document.createElement('canvas');
                let ctx = canvas.getContext('2d');
                let scale = Math.min(maxWidth / this.width, maxHeight / this.height);
                canvas.width = this.width * scale;
                canvas.height = this.height * scale;
                ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(resolve, 'image/jpeg', 1);
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }

    showFileUpload(event) {
        event.preventDefault();
        this.file_input_ref.current.click();
    }

    refresh_data() {
        this.props.router.replace(this.props.router.asPath);
    }

    async load_changed_images(uploaded_image_path) {
        if (uploaded_image_path == '') {
            logger.error(`Failed to upload image.  Cannot load file...`);
            return false
        }

        var width = -1; 
        var height = -1;

        try {
            var image = new Image();
            image.src = uploaded_image_path;

            //Validate the File Height and Width.
            image.onload = async () => {
                logger.debug(`WIDTH: ${image.width} | HEIGHT: ${image.height}`);
                width = image.width;
                height = image.height;

                this.load_image_arrays(uploaded_image_path, width, height);
            };
        } catch (err) {
            this.update_state({ uploaded: false, upload_error: true });
            logger.error(`Image Load Error: ${err.message}`);
            return false
        }
    }

    async load_image_arrays(uploaded_image_path, width, height) {
        if ( this.state.file_upload_type.toString().toLowerCase().includes('progress') ) {
            var current_progress_images = [undefined, null, ''].includes(this.state.progress_images) ? [] : this.state.extprogress_imagesra_images;
            current_progress_images = typeof current_progress_images === 'string' ? JSON.parse(current_progress_images) : current_progress_images;

            const updated_progress_images = [...current_progress_images, {image_path: uploaded_image_path, width: width, height: height}];

            logger.debug(`Pre-Update Progress Images (Next Line):`);
            logger.debug(current_progress_images);

            this.update_state_with_callback({
                progress_images: updated_progress_images, 
                uploaded_image_path: uploaded_image_path,
                loading: false,
                uploading: false,
                resizing: false,
            }, async () => {
                logger.debug(`Post-Update Progress Images State (Next Line):`);
                logger.debug(typeof this.state.progress_images === 'string' ? JSON.parse(this.state.progress_images) : this.state.progress_images);
            });
            return true
        }

        if ( this.state.file_upload_type.toString().toLowerCase().includes('extra') ) {
            var current_extra_images = [undefined, null, ''].includes(this.state.extra_images) ? [] : this.state.extra_images;
            current_extra_images = typeof current_extra_images === 'string' ? JSON.parse(current_extra_images) : current_extra_images;
            
            const updated_extra_images = [...current_extra_images, {image_path: uploaded_image_path, width: width, height: height}];

            logger.debug(`Pre-Update Extra Images (Next Line):`);
            logger.debug(current_extra_images);

            this.update_state_with_callback({
                extra_images: updated_extra_images, 
                uploaded_image_path: uploaded_image_path,
                loading: false,
                uploading: false,
                resizing: false,
            }, async () => {
                logger.debug(`Post-Update Extra Images State (Next Line):`);
                logger.debug(typeof this.state.extra_images === 'string' ? JSON.parse(this.state.extra_images) : this.state.extra_images);
            });
            return true
        }
        
        if ( this.state.file_upload_type.toString().toLowerCase().includes('piece') ||
            this.state.file_upload_type.toString().toLowerCase().includes('cover') ) {
            
            var updated_piece = this.state.piece_list[this.state.piece_position];
            updated_piece = {...updated_piece, ...{image_path: uploaded_image_path, width: width, height: height}};
            var updated_piece_list = this.state.piece_list;
            updated_piece_list[this.state.piece_position] = updated_piece;
            const image_array = await this.create_image_array(updated_piece_list, this.state.piece_position, this.state.db_id, true);
            
            logger.debug(`Pre-Update Cover Image (Next Line):`);
            logger.debug(this.state.image_path);
            this.update_state({
                piece_list: updated_piece_list, 
                width: width,
                height: height,
                uploaded_image_path: uploaded_image_path,
                image_path: uploaded_image_path,
                image_array: image_array,
                staging_db_id: this.state.db_id,
                loading: false,
                uploading: false,
                resizing: false,
            });
            return true
        }
        logger.error(`Unknown file upload type: "${this.state.file_upload_type}"`)
        return false
    }

    async create_blank_piece() {
        var new_piece_list = this.state.piece_list;
        new_piece_list.push({
            id: -2,
            o_id: -2,
            class_name: 'temp',
            title: 'temp',
            image_path: '/create_new_piece_primary_secondary.png',
            width: 1200,
            height: 1200,
            description: '',
            piece_type: 'Intaglio On Paper',
            sold: 'True',
            price: 0,
            instagram: '',
            real_width: 0,
            real_height: 0,
            active: 'True',
            framed: 'False',
            comments: '',
            uploaded_image_path: '',
            extra_images: [],
            progress_images: [],
        });

        var new_image_array = await this.create_image_array(new_piece_list, new_piece_list.length - 1, -2, true);

        var blank_piece_state = {
            uploaded: false,
            upload_error: false,
            uploaded_image_path: '',
            image_array: new_image_array,
            extra_images: [],
            progress_images: [],
            piece_list: new_piece_list,
            piece_position: new_piece_list.length - 1,
            title: 'Enter Title...',
            description: 'Enter Description...',
            sold: 'False',
            price: 9999,
            width: 1200,
            height: 1200,
            real_width: 0,
            real_height: 0,
            image_path: '/create_new_piece_primary_secondary.png',
            instagram: '',
            theme: 'None',
            available: 'True',
            framed: 'False',
            comments: '',
            staging_db_id: -2,
        };
        
        logger.debug('Updating state with BLANK piece details (Next Line):');
        logger.debug(blank_piece_state);

        this.update_state(blank_piece_state);
    }

    handle_multi_select_change(new_selected_options) {
        logger.debug(`New theme passed (Next Lines):`);
        //logger.debug(new_selected_options)
        var theme_string = '';
        var final_options = [];
        for (var option_index in new_selected_options) {
            let options = new_selected_options[option_index];
            logger.debug(options);
            if (options.value != 'None') {
                theme_string += `${options.value}, `;
                final_options.push(options);
            }
        }
        theme_string = theme_string == '' ? 'None' : theme_string;
        logger.extra(`Setting theme: ${theme_string}`);
        this.update_state({ theme: theme_string, theme_options: final_options });
    }

    handleImageReorder = async (index, direction, image_type_to_edit) => {
        var using_extra_images = typeof this.state.extra_images === 'string' ? JSON.parse(this.state.extra_images) : this.state.extra_images;
        let newExtraImages = [...using_extra_images];
        let newIndex;
      
        if (direction === 'up') {
            newIndex = index === newExtraImages.length - 1 ? 0 : index + 1;
        } else {
            newIndex = index === 0 ? newExtraImages.length - 1 : index - 1;
        }
      
        let temp = newExtraImages[newIndex];
        newExtraImages[newIndex] = newExtraImages[index];
        newExtraImages[index] = temp;
      
        this.setState({ [image_type_to_edit]: newExtraImages });

        logger.debug(`Updating DB with Extra Images: ${newExtraImages}`)
        
        // Call API to update the extra images order for the specific piece id.
        await updateExtraImagesOrder(this.state.db_id, newExtraImages, image_type_to_edit);
    };
    
    handleImageDelete = async (index, image_type_to_edit) => {
        var using_extra_images = typeof this.state.extra_images === 'string' ? JSON.parse(this.state.extra_images) : this.state.extra_images;
        let newExtraImages = using_extra_images.filter((_, i) => i !== index);
        this.setState({ [image_type_to_edit]: newExtraImages });
    
        logger.debug(`Updating DB with Extra Images: ${newExtraImages}`)

        // Call API to delete the extra image for the specific piece id.
        await updateExtraImagesOrder(this.state.db_id, newExtraImages, image_type_to_edit);
    };

    create_error_message_jsx() {
        logger.extra( `Loading: ${this.state.loading} | updated: ${this.state.updated} | Error: ${this.state.error} | Uploaded: ${this.state.uploaded}`);

        var message_jsx = null;
        var message = '';
        var message_type = null;

        if (this.state.loading == true) {
            message_type = 'Update'
            message_jsx = (
                <div className={form_styles.error_message_container}>
                    <CircularProgress color="inherit" className={form_styles.loader}/>
                    <div className={form_styles.error_message}>{'Re-Loading piece list...'}</div>
                </div>
            );
        } else if (this.state.updating == true) {
            message_type = 'Update'
            message_jsx = (
                <div className={form_styles.error_message_container}>
                    <CircularProgress color="inherit" className={form_styles.loader}/>
                    <div className={form_styles.error_message}>{'Updating piece info in DB...'}</div>
                </div>
            );
        } else if (this.state.resizing == true) {
            message_type = 'Update'
            message_jsx = (
                <div className={form_styles.error_message_container}>
                    <CircularProgress color="inherit" className={form_styles.loader}/>
                    <div className={form_styles.error_message}>{'Resizing Image...'}</div>
                </div>
            );
        } else if (this.state.uploading == true) {
            message_type = 'Update'
            message_jsx = (
                <div className={form_styles.error_message_container}>
                    <CircularProgress color="inherit" className={form_styles.loader}/>
                    <div className={form_styles.error_message}>{'Uploading piece to Amazon S3 Bucket...'}</div>
                </div>
            );
        } else if (this.state.updated == true) {
            message_type = 'Update'
            message = `Piece Details Update was successful!`;
        } else if (this.state.uploaded == true) {
            message_type = 'Update'
            message = `Piece Details Upload was successful!`;
        } else if (this.state.error == true) {
            message_type = 'Error'
            message = `Piece Details Update was NOT successful...`;
        } else if (this.state.upload_error == true) {
            message_type = 'Error'
            message = `Error reached while uploading image...`;
        } else if (
            this.state.width != '' &&
            this.state.height != '' &&
            this.state.width > 1920 &&
            this.state.height > 1920
        ) {
            message_type = 'Warning'
            message = `Image upload successful but image resolution is too high!  Re-Upload with width / height <= 1920px`;
        } else if (
            this.state.width != '' &&
            this.state.height != '' &&
            this.state.width < 800 &&
            this.state.height < 800
        ) {
            message_type = 'Warning'
            message = `Image upload successful but image resolution is low!  Re-Upload with width / height >= 800px`;
        } else if (this.state.uploaded == true) {
            message_type = 'Update'
            message = `Image Upload was successful...`;
        }

        var message_class = message_type == 'Update' ? form_styles.submit_label_update : message_type == 'Warning' ? form_styles.submit_label_warning : form_styles.submit_label_failed

        var error_message_and_label_jsx = message_type == null ? null : (
            <div className={form_styles.error_message_and_label_container}>
                <div className={`${form_styles.error_message_label} ${message_class}`}>
                    {`${message_type}:`}
                </div>
                <div className={`${form_styles.error_message} ${message_class}`}>
                    {message_jsx == null ? message : message_jsx}
                </div>
            </div>
        );

        return error_message_and_label_jsx;
    }

    render() {
        if (!this.props.isLoaded) { return <></>; }
        if (!this.props.isSignedIn) { this.props.router.push('/'); }
        if (this.props.user == null) { this.props.router.push('/'); }

        const role = this.props.user.publicMetadata.role !== undefined ? this.props.user.publicMetadata.role : null;
        if (role !== 'ADMIN') { this.props.router.push('/'); }

        // If to this position, User is signed in with ADMIN role in clerk publicMetadata
        const styles = this.state.window_width > 1800 ? desktop_styles : mobile_styles;

        const using_theme = [undefined, null, ''].includes(this.state.theme) == false ? this.state.theme : 'None';
        logger.extra(`Theme: ${using_theme} | Framed: ${this.state.framed} | Sold: ${this.state.sold}`);

        logger.section(`Creating Initial Image arrays`)
        logger.debug(`Cover Image Path: ${this.state.image_path}`)

        let using_extra_images = null;
        try {
            using_extra_images = typeof this.state.extra_images === 'string' ? JSON.parse(this.state.extra_images) : this.state.extra_images;
        } catch (error) { }

        logger.debug(`using_extra_images type: ${typeof using_extra_images} | data (next line):`);
        logger.debug(using_extra_images)
            
        let using_progress_images = null;
        try {
            using_progress_images = typeof this.state.progress_images === 'string' ? JSON.parse(this.state.progress_images) : this.state.progress_images;
        } catch (error) { }

        logger.debug(`using_progress_images type: ${typeof using_progress_images} | data (next line):`);
        logger.debug(using_progress_images)

        logger.section(`Creating JSX Elements`)
        
        // Gallery Loader Container JSX
        const image_loader_container_jsx = (
            <div className={styles.loader_container}>
                <div>Loading Gallery</div>
                <CircularProgress color="inherit" className={styles.loader} />
            </div>
        );
        
        // Main Image Container JSX
        const image_container_jsx = (
            <div className={styles.centered_image_container}>
                {this.state.loading == true ? ( image_loader_container_jsx ) : this.state.selected_gallery_image === 0 ? this.state.image_array : this.state.extra_image_array}
            </div>
        );
        
        const extra_images_gallery_container_jsx = this.state.loading == true ? null : [null, undefined].includes(using_extra_images) ? null : using_extra_images.length < 1 ? null : (
            <div className={styles.extra_images_gallery_container}>
                {this.state.loading == true ? ( null ) : ( 
                    using_extra_images.map((image, index) => {
                        var image_path = image.image_path.split('/').slice(-2).join('/')
                        logger.extra(`Path: ${image_path} | Width: ${image.width} | Height: ${image.height}`)
                        return (
                            <div className={(this.state.selected_gallery_image === (index + 1)) ? 
                                `${styles.extra_images_gallery_image_container} ${styles.centered_image_container} ${styles.selected_gallery_image}` : 
                                `${styles.extra_images_gallery_image_container} ${styles.centered_image_container}`
                            }>
                                <div className={`${styles.extra_images_gallery_image} ${styles.centered_image_container}`} onClick={ async () => {
                                    const extra_image_array = await this.create_extra_image_array(this.state.extra_images, index)
                                    this.update_state({ selected_gallery_image: index + 1, extra_image_array: extra_image_array });
                                }}>
                                    <CustomNextImage
                                        className={styles.centered_image}
                                        src={image_path.includes(PROJECT_CONSTANTS.AWS_BUCKET_URL) ? image_path : `${PROJECT_CONSTANTS.AWS_BUCKET_URL}/${image_path}`}
                                        alt={``}
                                        width={image.width}
                                        height={image.height}
                                        quality={100}
                                    />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        );

        const main_image_gallery_container_jsx = extra_images_gallery_container_jsx == null ? null : (
            <div className={styles.extra_images_gallery_container}>
                <div className={(this.state.selected_gallery_image === 0) ? 
                    `${styles.extra_images_gallery_image_container} ${styles.selected_gallery_image}` : 
                    `${styles.extra_images_gallery_image_container}`
                }>
                    <div className={`${styles.extra_images_gallery_image} ${styles.centered_image_container}`} onClick={() => {
                        this.update_state({'selected_gallery_image': 0})
                    }}>
                        <CustomNextImage
                            className={styles.centered_image}
                            src={this.state.image_path}
                            alt={``}
                            width={this.state.width}
                            height={this.state.height}
                            quality={100}
                        />
                    </div>
                </div>
            </div>
        )

        const main_image_and_extra_images_gallery_container_jsx = extra_images_gallery_container_jsx == null ? null : (
            <div className={styles.full_gallery_container}>
                {main_image_gallery_container_jsx}

                {extra_images_gallery_container_jsx}
            </div>
        );

        const final_image_container_jsx = extra_images_gallery_container_jsx == null ? ( 
            <div className={styles.main_image_only_container}>
                {image_container_jsx}
            </div>
            
        ) : (
            <div className={styles.main_image_and_extra_images_container}>
                {image_container_jsx}

                {main_image_and_extra_images_gallery_container_jsx}
            </div>
        )
        
        // Backwards Title Arrow JSX
        const backward_title_arrow_jsx = (
            <ArrowForwardIosRoundedIcon className={`${title_styles.title_arrow} ${title_styles.img_hor_vert}`}
                onClick={(e) => {
                    e.preventDefault();
                    this.update_current_piece(this.state.piece_list, this.state.next_oid);
                }}
            />  
        );

        // Forwards Title Arrow JSX
        const forward_title_arrow_jsx = (
            <ArrowForwardIosRoundedIcon className={title_styles.title_arrow}
                onClick={(e) => {
                    e.preventDefault();
                    this.update_current_piece(this.state.piece_list, this.state.last_oid);
                }}
            />
        );

        // Title Input Textbox JSX
        const title_input_textbox_jsx = (
            <input
                type="text"
                className={title_styles.title_input}
                id="title"
                value={this.state.title}
                key={'title'}
                onChange={(e) => {
                    e.preventDefault();
                    this.update_state({ title: e.target.value });
                }}
            />
        );
        
        // Button to go back to Details Page for current piece
        const back_to_details_button_jsx = (
            <div className={title_styles.back_to_details_container}>
                <PageviewIcon className={title_styles.back_to_details_icon}
                    onClick={(e) => {
                        e.preventDefault();
                        this.props.router.push(`/details/${this.state.url_o_id}`);
                    }}
                />
            </div>
        );

        // Full Title Container JSX
        const title_container_jsx = (
            <div className={title_styles.title_container}>
                {backward_title_arrow_jsx}
                {title_input_textbox_jsx}
                {back_to_details_button_jsx}
                {forward_title_arrow_jsx}
            </div>
        );

        const description_text_area_jsx = (
            <div className={form_styles.input_container}>
                <InputComponent input_type={'input_textarea'} split={false} value={this.state.description} name={"Description"} update_field_value={this.update_field_value}/>
            </div>
        )

        const theme_multiselect_jsx = (
            <div className={form_styles.input_container}>
                <InputComponent input_type="input_multiselect" name="Theme" value={this.state.theme_options} handle_multi_select_change={this.handle_multi_select_change} select_options={[
                        ["Water", "Water"],
                        ["Snow", "Snow"],
                        ["Mountains", "Mountains"],
                        ["Landscape", "Landscape"],
                        ["City", "City"],
                        ["Portrait", "Portrait"],
                        ["Black and White", "Black and White"],
                        ["Abstract", "Abstract"],
                        ["None", "None"]
                    ]}
                />
            </div>
        )
        
        const piece_type_select_jsx = (
            <div className={form_styles.input_container}>
                <InputComponent input_type={'input_select'} split={false} value={this.state.piece_type} name={"Type"} id={"piece_type"} update_field_value={this.update_field_value} select_options={[
                    ["Oil On Canvas", "Oil On Canvas"],
                    ["Oil On Cradled Panel", "Oil On Cradled Panel"],
                    ["Intaglio On Paper", "Intaglio On Paper"],
                    ["Linocut On Paper", "Linocut On Paper"],
                    ["Pastel On Paper", "Pastel On Paper"]
                ]}/>
            </div>
        );

        const available_and_sold_container_jsx = (
            <div className={form_styles.input_container}>
                <InputComponent input_type={'input_select'} split={true} value={this.state.available} name={"Available"} update_field_value={this.update_field_value} select_options={[
                    ["True", "True"],
                    ["False", "False"]
                ]}/>
                <InputComponent input_type={'input_select'} split={true} value={this.state.sold} name={"Sold"} update_field_value={this.update_field_value} select_options={[
                    ["True", "Sold"],
                    ["False", "Not Sold"]
                ]}/>
            </div>
        );

        const instagram_and_price_container_jsx = (
            <div className={form_styles.input_container}>
                <InputComponent input_type={'input_textbox'} split={true} value={this.state.instagram} name={"Instagram"} update_field_value={this.update_field_value}/>

                <InputComponent input_type={'input_textbox'} split={true} value={this.state.price} name={"Price"} update_field_value={this.update_field_value}/>
            </div>
        );

        const real_width_and_height_container_jsx = (
            <div className={form_styles.input_container}>
                <InputComponent input_type={'input_textbox'} split={true} value={this.state.real_width} name={"Width"} update_field_value={this.update_field_value}/>

                <InputComponent input_type={'input_textbox'} split={true} value={this.state.real_height} name={"Height"} update_field_value={this.update_field_value}/>
            </div>
        );
        
        const px_width_and_height_container_jsx = (
            <div className={form_styles.input_container}>
                <InputComponent input_type={'input_textbox'} split={true} value={this.state.width} name={"PX Width"} update_field_value={this.update_field_value}/>
                <InputComponent input_type={'input_textbox'} split={true} value={this.state.height} name={"PX Height"} update_field_value={this.update_field_value}/>
            </div>
        );

        const framed_and_comments_container_jsx = (
            <div className={form_styles.input_container}>
                <InputComponent input_type={'input_select'} split={true} value={this.state.framed} name={"Framed"} update_field_value={this.update_field_value} select_options={[
                    ["True", "True"],
                    ["False", "False"]
                ]}/>
                <InputComponent input_type={'input_textarea'} split={true} value={this.state.comments} name={"Comments"} update_field_value={this.update_field_value} rows={2}/>
            </div>
        );

        const file_input_continer = (
            <div className={form_styles.input_container}>
                <InputComponent input_type={'input_file'} split={false} value={this.state.framed} name={"Upload"} id={"upload_type"}
                    update_field_value={this.update_field_value}
                    file_upload_type={this.state.file_upload_type}
                    uploaded_image_path={this.state.uploaded_image_path} 
                    showFileUpload={this.showFileUpload} 
                    onFileChange={this.onFileChange} 
                    file_types={[
                        { value: 'cover', label: 'Cover Image' },
                        { value: 'extra', label: 'Extra Image' },
                        { value: 'progress', label: 'Progress Image' },
                    ]}
                 />
            </div>
        );

        const submit_container_jsx = (
            <div className={form_styles.submit_container}>
                {/* <button type="button" className={form_styles.upload_button} onClick={this.showFileUpload}>Upload</button> */}
                {/* <input type="file" className={form_styles.upload_file_input} onChange={this.onFileChange} ref={this.file_input_ref}/> */}
                <button type="button" className={form_styles.submit_button} onClick={this.handleSubmit}>Submit Changes</button>
                <button type="button" className={form_styles.submit_button} onClick={this.create_blank_piece}>Create New Piece</button>
            </div>
        );

        const error_message_jsx = this.create_error_message_jsx();


        const extra_images_text_jsx = [undefined, null, '', [], ['']].includes(using_extra_images) ? null : using_extra_images.length < 1 ? null : (
            <div className={edit_details_styles.extra_images_container}>
                <div className={edit_details_styles.extra_image_table_header}>Extra Images:</div>
        
                <div className={edit_details_styles.extra_image_table} id={'extra-images'}>
                    {using_extra_images.map((image, index) => {
                        // console.log(image)
                        // console.log(`Image Path: ${image.image_path}`)
                        var image_path = image.image_path.split('/').slice(-2).join('/')
                        return (
                            <div key={index} className={edit_details_styles.image_row}>
                                <div className={edit_details_styles.image_filename}>
                                    {image_path}
                                </div>
                                <div className={edit_details_styles.image_dimensions}>
                                    Width: {image.width}px
                                </div>
                                <div className={edit_details_styles.image_dimensions}>
                                Height: {image.height}px
                                </div>
                                <div className={edit_details_styles.button_container}>
                                    <ArrowForwardIosRoundedIcon
                                        className={edit_details_styles.up_arrow}
                                        onClick={() => this.handleImageReorder(index, 'up', 'extra_images')}
                                    />
                                    <ArrowForwardIosRoundedIcon
                                        className={edit_details_styles.down_arrow}
                                        onClick={() => this.handleImageReorder(index, 'down', 'extra_images')}
                                    />
                                    <DeleteForeverIcon
                                        className={edit_details_styles.delete_icon}
                                        onClick={() => this.handleImageDelete(index, 'extra_images')}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
        

        const progress_images_test_jsx = [undefined, null, '', [], ['']].includes(using_progress_images) ? null : using_progress_images.length < 1 ? null : (
            <div className={edit_details_styles.extra_images_container}>
                <div className={edit_details_styles.extra_image_table_header}>Progress Images:</div>

                <div className={edit_details_styles.extra_image_table} id={'progress-images'}>
                    {using_progress_images.map((image, index) => {
                        var image_path = image.image_path.split('/').slice(-2).join('/')
                        return (
                            <div key={index} className={edit_details_styles.image_row}>
                                <div className={edit_details_styles.image_filename}>
                                    {image_path}
                                </div>
                                <div className={edit_details_styles.image_dimensions}>
                                    Width: {image.width}px
                                </div>
                                <div className={edit_details_styles.image_dimensions}>
                                    Height: {image.height}px
                                </div>
                                <div className={edit_details_styles.button_container}>
                                    <ArrowForwardIosRoundedIcon
                                        className={edit_details_styles.up_arrow}
                                        onClick={() => this.handleImageReorder(index, 'up', 'extra_images')}
                                    />
                                    <ArrowForwardIosRoundedIcon
                                        className={edit_details_styles.down_arrow}
                                        onClick={() => this.handleImageReorder(index, 'down', 'extra_images')}
                                    />
                                    <DeleteForeverIcon
                                        className={edit_details_styles.delete_icon}
                                        onClick={() => this.handleImageDelete(index, 'extra_images')}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
        
        if (this.state.window_width > 1800) {
            return (
                <PageLayout page_title={this.state.title == '' ? `Edit Details` : `Edit Details - ${this.state.title}`}>
                    <div className={styles.details_container}>
                        <div className={styles.details_container_left}>
                            {final_image_container_jsx}
                        </div>
                        <div className={styles.details_container_right}>
                            <div className={edit_details_styles.edit_details_form_container}>
                                <form>

                                    {title_container_jsx /* Title Container */}

                                    {file_input_continer /* File Input Container */}

                                    {submit_container_jsx}

                                    {error_message_jsx}

                                    {piece_type_select_jsx /* Piece Type Select */}
                                
                                    {theme_multiselect_jsx /* Theme Multiselect */}

                                    {available_and_sold_container_jsx /* Split Container For Available / sold */}

                                    {instagram_and_price_container_jsx /* Split Container For Instagram Link / Available */}
                                    
                                    {real_width_and_height_container_jsx /* Split Container For real_width / real_height */}

                                    {px_width_and_height_container_jsx /* Split Container For image pixel width / pixel height */}

                                    {framed_and_comments_container_jsx /* Split Container For framed / comments */}

                                    {description_text_area_jsx /* Description Text Area */}

                                    {extra_images_text_jsx}

                                    {progress_images_test_jsx}
                                </form>
                            </div>
                        </div>
                    </div>
                </PageLayout>
            );
        }
        return (
            <PageLayout page_title={this.state.title == '' ? `Edit Details` : `Edit Details - ${this.state.title}`}>
                <div className={styles.details_container}>

                    {final_image_container_jsx}

                    <div className={edit_details_styles.edit_details_form_container}>
                        <form>

                            {title_container_jsx /* Title Container */}

                            {file_input_continer /* File Input Container */}

                            {submit_container_jsx}

                            {error_message_jsx}

                            {piece_type_select_jsx /* Piece Type Select */}

                            {theme_multiselect_jsx /* Theme Multiselect */}

                            {available_and_sold_container_jsx /* Split Container For Available / sold */}

                            {instagram_and_price_container_jsx /* Split Container For Instagram Link / Available */}

                            {real_width_and_height_container_jsx /* Split Container For real_width / real_height */}

                            {px_width_and_height_container_jsx /* Split Container For image pixel width / pixel height */}

                            {framed_and_comments_container_jsx /* Split Container For framed / comments */}

                            {description_text_area_jsx /* Description Text Area */}

                            {extra_images_text_jsx}

                            {progress_images_test_jsx}
                        </form>
                    </div>
                </div>
            </PageLayout>
        );
    }
}

export default withRouter(Edit);

export const getServerSideProps = async (context) => {
    logger.section({message: `Fetching Initial Edit Details Page  Server List`});

    var piece_list = await prisma.piece.findMany();
    piece_list.sort((a, b) => a['o_id'] - b['o_id']);

    // Add AWS bucket URL to the image_path if not exists
    piece_list.forEach((piece) => {
        piece.image_path = piece.image_path.includes(PROJECT_CONSTANTS.AWS_BUCKET_URL) ? piece.image_path : `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${piece.image_path}`;
    });

    // logger.extra(`Passing piece list (Next Line):`)
    // logger.extra(piece_list)

    return {
        props: { // will be passed to the page component as props
            piece_list: piece_list, 
            most_recent_id: piece_list[piece_list.length - 1]['id'] 
        }, 
    };
};
