import logger from '@/lib/logger';
import PROJECT_CONSTANTS from '@/lib/constants';

import React from 'react';
import { withRouter } from 'next/router';

import { prisma } from '@/lib/prisma';

import NextImage from 'next/image';

import { fetch_pieces, edit_details, create_piece, upload_image, get_upload_url } from '@/lib/api_calls';

import PageLayout from '@/components/layout/PageLayout';

import mobile_styles from '@/styles/pages/DetailsMobile.module.scss';
import desktop_styles from '@/styles/pages/DetailsDesktop.module.scss';

import edit_details_styles from '@/styles/pages/EditDetails.module.scss';
import form_styles from '@/styles/forms/Form.module.scss';
import title_styles from '@/styles/components/TitleInputTextbox.module.scss';

import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import CircularProgress from '@mui/material/CircularProgress';
import PageviewIcon from '@mui/icons-material/Pageview';
import InputComponent from '@/components/components/InputComponent';

class Edit extends React.Component {
    constructor(props) {
        super(props);

        logger.section({message: `LOADING EDIT DETAILS PAGE`});

        logger.debug(`ID PROP: ${this.props.id}`);
        const passed_o_id = this.props.router.query.id;

        const piece_list = this.props.piece_list;
        const num_pieces = piece_list.length;

        logger.debug(`getServerSideProps piece_list length: ${num_pieces} | Data (Next Line):`);
        logger.debug(piece_list);

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
        var image_path  = num_pieces < 1 ? '' : current_piece.image_path !== undefined ? `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${current_piece.image_path}` : '';
        var instagram   = num_pieces < 1 ? '' : current_piece.instagram !== undefined ? current_piece.instagram : '';
        /* prettier-ignore-end */

        var theme_options = [{ value: theme, label: theme }];
        if (theme != 'None' && theme.includes(', ')) {
            logger.debug(`Splitting theme string: ${theme}`);
            theme_options = [];
            theme.split(', ').forEach(function (theme_string) {
                if (theme_string.length > 1) {
                    logger.debug(`Adding theme string ${theme_string} to options...`);
                    theme_options.push({ value: theme_string, label: theme_string });
                }
            });
        }

        var image_array = [];

        logger.debug(`Setting initial state theme to: ${theme} | options (Next line):`);
        logger.debug(theme_options);

        this.state = {
            window_width: null,
            window_height: null,
            styles: desktop_styles,
            debug: false,
            loading: true,
            url_o_id: passed_o_id,
            piece_list: piece_list,
            image_array: image_array,
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
            loader_visable: false,
            loading: false,
            submitted: false,
            error: false,
            uploaded: false,
            upload_error: false,
        };
        this.create_image_array = this.create_image_array.bind(this);
        this.get_piece_from_path_o_id = this.get_piece_from_path_o_id.bind(this);
        this.handle_multi_select_change = this.handle_multi_select_change.bind(this);
        this.update_field_value = this.update_field_value.bind(this);
        this.handleResize = this.handleResize.bind(this);

        // File Upload
        this.showFileUpload = this.showFileUpload.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onFileChange = this.onFileChange.bind(this);
        this.refresh_data = this.refresh_data.bind(this);

        // Refrences
        this.file_input_ref = React.createRef(null);
        this.text_area_ref = React.createRef(null);
    }


    async componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    async componentDidMount() {
        var image_array = [];
        const num_pieces = this.state.piece_list.length;
        if (num_pieces > 0) {
            image_array = await this.create_image_array(this.state.piece_list, this.state.piece_position);
        }
       
        logger.debug(`Setting state with Piece Position: ${this.state.piece_position} | piece list length: ${num_pieces}`);
        this.setState({
            loading: false,
            window_width: window.innerWidth,
            window_height: window.innerHeight,
            image_array: image_array,
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

    handleResize() {
        logger.debug(`Window Width: ${window.innerWidth} | Height: ${window.innerHeight}`);
        this.setState({
            window_width: window.innerWidth,
            window_height: window.innerHeight
        });
    }


    async fetch_pieces_from_api(submitted = false) {
        logger.section({message: `Fetching Initial Server List`});

        const piece_list = await fetch_pieces();
        piece_list.sort((a, b) => a['o_id'] - b['o_id']);

        logger.debug('Pieces fetched in state (Next Line):');
        logger.debug(piece_list);

        const state = submitted == true ?  { piece_list: piece_list } : { 
            piece_list: piece_list, 
            loading: false, 
            error: false, 
            submitted: true 
        };
        this.setState(state, async () => {
            await this.update_current_piece(this.state.piece_list, this.state.url_o_id);
        });
    }

    async update_current_piece(piece_list, o_id) {
        const num_pieces = piece_list.length;

        logger.debug(`Piece Count: ${num_pieces} | Searching for URL_O_ID: ${o_id}`);
        const piece_from_path_o_id = await this.get_piece_from_path_o_id(piece_list, o_id);
        const [piece_position, current_piece] = piece_from_path_o_id;
        const current_db_id = current_piece.id;
        const current_o_id = current_piece.o_id;

        logger.debug(`Piece Position: ${piece_position} | Current DB ID: ${current_db_id} | Data (Next Line):`);
        logger.debug(current_piece);

        const next_oid = piece_position + 1 > num_pieces - 1 ? piece_list[0].o_id : piece_list[piece_position + 1].o_id;
        const last_oid = piece_position - 1 < 0 ? piece_list[num_pieces - 1].o_id : piece_list[piece_position - 1].o_id;

        var theme = current_piece.theme == null || current_piece.theme == undefined ? 'None' : current_piece.theme;
        var theme_options = [{ value: theme, label: theme }];

        if (theme != 'None' && theme.includes(', ')) {
            logger.debug(`Splitting theme string: ${theme}`);
            theme_options = [];
            theme.split(', ').forEach(function (theme_string) {
                if (theme_string.length > 1) {
                    logger.debug(`Adding theme string ${theme_string} to options...`);
                    theme_options.push({ value: theme_string, label: theme_string });
                }
            });
        }

        logger.debug(`Setting theme to: ${theme} | framed: ${current_piece.framed} | options (Next line):`);
        logger.debug(theme_options);

        const image_array = await this.create_image_array(this.state.piece_list, piece_position);

        const previous_url_o_id = this.state.url_o_id;
        this.setState(
            {
                loading: false,
                url_o_id: current_o_id,
                piece_list: piece_list,
                image_array: image_array,
                piece_position: piece_position,
                db_id: current_db_id,
                o_id: current_o_id,
                piece: current_piece,
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
                image_path: `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${current_piece.image_path}`,
                instagram: current_piece.instagram,
                available: current_piece.available == true || current_piece.available.toString().toLowerCase() == 'true' ? 'True' : 'False',
                sold: current_piece.sold == true || current_piece.sold.toString().toLowerCase() == 'true' ? 'True' : 'False',
                framed: current_piece.framed == true || current_piece.framed.toString().toLowerCase() == 'true' ? 'True' : 'False',
                comments: current_piece.comments,
                theme: theme,
                theme_options: theme_options
            },
            async () => {
                if (previous_url_o_id != o_id) {
                    this.props.router.push(`/edit/${o_id}`);
                }
            },
        );
    }

    async create_image_array(piece_list, piece_position) {
        const styles = window.innerWidth === undefined ? desktop_styles : window.innerWidth > 768 ? desktop_styles : mobile_styles;

        var image_array = [];
        for (var i = 0; i < piece_list.length; i++) {
            let piece = piece_list[i];
            image_array.push(
                <div
                    key={`image_${i}`}
                    className={
                        i == piece_position ? styles.centered_image_container : styles.centered_image_container_hidden
                    }
                >
                    <NextImage
                        id={`centered_image_${i}`}
                        className={styles.centered_image}
                        src={
                            piece.image_path.includes(PROJECT_CONSTANTS.AWS_BUCKET_URL)
                                ? piece.image_path
                                : `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${piece.image_path}`
                        }
                        alt={piece['title']}
                        priority={i > piece_position - 3 && i < piece_position + 3 ? true : false}
                        width={this.state.width}
                        height={this.state.height}
                        quality={100}
                    />
                </div>,
            );
        }
        return image_array;
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
        this.setState({ loading: true, submitted: false, loader_visable: true });

        if (title) {
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
                });

                logger.debug(`Edit Piece Response (Next Line):`);
                logger.debug(response);

                if (response) {
                    await this.fetch_pieces_from_api(true);
                } else {
                    logger.debug('Edit Piece - No Response - Setting error = true');
                    this.setState({ loading: false, error: true });
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
                    await this.fetch_pieces_from_api(true);
                } else {
                    this.setState({ loading: false, error: true, loader_visable: false });
                }
            }
        } else {
            this.setState({ loading: false, error: true, loader_visable: false });
        }
    }

    async onFileChange(event) {
        event.preventDefault();
        logger.section({message: 'File Input Change Event Triggered'});

        var uploaded_image_path = '';
        try {
            var selected_file = event.target.files[0];
            const fileName = selected_file.name.replace(/\s+/g, '_'); // Replace spaces with underscore

            logger.debug(`Selected File: ${fileName} | Size: ${selected_file.size}`);

            const s3_upload_url = await get_upload_url(fileName.toLowerCase());
            logger.debug(`Got Upload URL: ${s3_upload_url}`);

            uploaded_image_path = await upload_image(s3_upload_url, selected_file);
            logger.debug(`Got Upload Reponse: ${uploaded_image_path}`);
        } catch (err) {
            this.setState({ uploaded: false, upload_error: true });
            logger.error(`S3 Image Upload Error: ${err.message}`);
            return;
        }

        if (uploaded_image_path == '') {
            logger.error(`Failed to upload image.  Cannot load file...`);
            return;
        }

        try {
            var image = new Image();
            image.src = uploaded_image_path;

            //Validate the File Height and Width.
            image.onload = async () => {
                logger.debug(`WIDTH: ${image.width} | HEIGHT: ${image.height}`);

                logger.debug(`Creating piece with image path: ${uploaded_image_path}`);

                var new_piece_list = this.state.piece_list;
                new_piece_list.push({
                    id: -1,
                    o_id: -1,
                    class_name: 'temp',
                    title: 'temp',
                    image_path: uploaded_image_path,
                    width: 0,
                    height: 0,
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
                });

                const new_image_array = await this.create_image_array(new_piece_list, new_piece_list.length - 1);

                const uploaded_piece_state = {
                    loader_visable: true,
                    uploaded: true,
                    upload_error: false,
                    image_array: new_image_array,
                    piece_list: new_piece_list,
                    piece_position: new_piece_list.length - 1,
                    title: 'Enter Title...',
                    description: 'Enter Description...',
                    sold: 'False',
                    price: 9999,
                    width: image.width,
                    height: image.height,
                    real_width: 0,
                    real_height: 0,
                    image_path: uploaded_image_path,
                    instagram: '',
                    theme: 'None',
                    available: 'True',
                    framed: 'False',
                    comments: '',
                };
                logger.debug('Updating state with uploaded piece details (Next Line):');
                logger.debug(uploaded_piece_details);

                this.setState({uploaded_piece_state});
            };
        } catch (err) {
            this.setState({ uploaded: false, upload_error: true, loader_visable: false });
            logger.error(`Image Load Error: ${err.message}`);
            return;
        }
    }

    showFileUpload(event) {
        event.preventDefault();
        this.file_input_ref.current.click();
    }

    refresh_data() {
        this.props.router.replace(this.props.router.asPath);
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
        logger.debug(`Setting theme: ${theme_string}`);
        this.setState({ theme: theme_string, theme_options: final_options });
    }

    create_loader_jsx() {
        logger.debug(
            `Loading: ${this.state.loading} | Submitted: ${this.state.submitted} | Error: ${this.state.error} | Uploaded: ${this.state.uploaded}`,
        );

        var loader_jsx = null;
        var class_name = null;
        var loader_message = '';

        if (this.state.loading == true) {
            loader_jsx = <CircularProgress color="inherit" className={form_styles.loader} />;
        } else if (this.state.submitted == true) {
            class_name = form_styles.submit_label;
            loader_message = `Piece Details Update was successful...`;
        } else if (this.state.error == true) {
            class_name = form_styles.submit_label_failed;
            loader_message = `Piece Details Update was NOT successful...`;
        } else if (this.state.upload_error == true) {
            class_name = form_styles.submit_label_failed;
            loader_message = `Image Upload was NOT successful...`;
        } else if (this.state.uploaded == false) {
            class_name = form_styles.submit_label_failed;
            loader_message = `Image Upload was NOT successful...`;
        } else if (
            this.state.width != '' &&
            this.state.height != '' &&
            this.state.width > 1500 &&
            this.state.height > 1500
        ) {
            class_name = form_styles.submit_label_warning;
            loader_message = `Image upload successful but image resolution is too high!  Re-Upload with width / height < 1500px`;
        } else if (
            this.state.width != '' &&
            this.state.height != '' &&
            this.state.width < 1000 &&
            this.state.height < 1000
        ) {
            class_name = form_styles.submit_label_warning;
            loader_message = `Image upload successful but image resolution is low!  Re-Upload with width / height > 1000px`;
        } else if (this.state.uploaded == true) {
            class_name = form_styles.submit_label;
            loader_message = `Image Upload was successful...`;
        }

        loader_jsx = <div className={class_name == null ? form_styles.submit_label : class_name}>{loader_message}</div>;

        return loader_jsx;
    }

    async update_field_value(field, new_value_object) {
        const key_name = field.toLowerCase();
        const new_value = typeof new_value_object === "string" ? new_value_object : new_value_object.value;
        logger.debug(`Setting state on key: ${key_name} | Value: ${new_value}`);

        this.setState(prevState => ({ ...prevState, [key_name]: new_value }), () => logger.debug(`Updated key value: ${this.state[key_name]}`));
    }

    render() {
        if (!this.props.isLoaded) {
            return <></>;
        }
        if (!this.props.isSignedIn) {
            this.props.router.push('/');
        }
        if (this.props.user == null) {
            this.props.router.push('/');
        }

        const role = this.props.user.publicMetadata.role !== undefined ? this.props.user.publicMetadata.role : null;
        logger.debug(`USER ROLE: ${role}`);

        if (role !== 'ADMIN') {
            this.props.router.push('/');
        }

        logger.debug(`Using window width: ${this.state.window_width}`)
        const styles = this.state.window_width > 768 ? desktop_styles : mobile_styles;

        // If to this position, User is signed in with ADMIN role in clerk publicMetadata
        var loader_jsx = this.state.loader_visable == true ? this.create_loader_jsx() : null;

        const using_theme =
            this.state.theme !== undefined || this.state.theme !== null || this.state.theme !== ''
                ? this.state.theme
                : 'None';
        logger.debug(`Theme: ${using_theme} | Framed: ${this.state.framed} | Sold: ${this.state.sold}`);

        // Gallery Loader Container JSX
        const loader_container_jsx = (
            <div className={styles.loader_container}>
                <div>Loading Gallery</div>
                <CircularProgress color="inherit" className={styles.loader} />
            </div>
        );
        
        // Main Image Container JSX
        const image_container_jsx = (
            <div className={styles.centered_image_outer_container}>
                {this.state.loading == true ? ( loader_container_jsx ) : ( this.state.image_array )}
            </div>
        );

        const backward_arrow_jsx = (
            <ArrowForwardIosRoundedIcon className={`${title_styles.title_arrow} ${title_styles.img_hor_vert}`}
                onClick={(e) => {
                    e.preventDefault();
                    this.update_current_piece(this.state.piece_list, this.state.next_oid);
                }}
            />  
        );
        const forward_arrow_jsx = (
            <ArrowForwardIosRoundedIcon className={title_styles.title_arrow}
                onClick={(e) => {
                    e.preventDefault();
                    this.update_current_piece(this.state.piece_list, this.state.last_oid);
                }}
            />
        );
        const title_input_jsx = (
            <input
                type="text"
                className={title_styles.title_input}
                id="title"
                value={this.state.title}
                key={'title'}
                onChange={(e) => {
                    e.preventDefault();
                    this.setState({ title: e.target.value });
                }}
            />
        );        
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
        const title_container_jsx = (
            <div className={title_styles.title_container}>
                {backward_arrow_jsx}
                {title_input_jsx}
                {back_to_details_button_jsx}
                {forward_arrow_jsx}
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

        const submit_container_jsx = (
            <div className={form_styles.submit_container}>
                <button type="button" className={form_styles.upload_button} onClick={this.showFileUpload}>Upload</button>
                <input type="file" className={form_styles.upload_file_input} onChange={this.onFileChange} ref={this.file_input_ref}/>
                <button type="button" className={form_styles.submit_button} onClick={this.handleSubmit}>Submit</button>
                <div className={form_styles.loader_container}>{loader_jsx}</div>
            </div>
        );
        
        if (this.state.window_width > 768) {
            return (
                <PageLayout page_title={this.state.title == '' ? `Edit Details` : `Edit Details - ${this.state.title}`}>
                    <div className={styles.details_container}>
                        <div className={styles.details_container_left}>
                            {image_container_jsx}
                        </div>
                        <div className={styles.details_container_right}>
                            <div className={edit_details_styles.edit_details_form_container}>
                                <form>

                                    {title_container_jsx /* Title Container */}

                                    {description_text_area_jsx /* Description Text Area */}

                                    {piece_type_select_jsx /* Piece Type Select */}
                                
                                    {theme_multiselect_jsx /* Theme Multiselect */}

                                    {available_and_sold_container_jsx /* Split Container For Available / sold */}

                                    {instagram_and_price_container_jsx /* Split Container For Instagram Link / Available */}
                                    
                                    {real_width_and_height_container_jsx /* Split Container For real_width / real_height */}

                                    {px_width_and_height_container_jsx /* Split Container For image pixel width / pixel height */}

                                    {framed_and_comments_container_jsx /* Split Container For framed / comments */}

                                    {submit_container_jsx}
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
                    {image_container_jsx}
                    <div className={edit_details_styles.edit_details_form_container}>
                        <form>

                            {title_container_jsx /* Title Container */}

                            {description_text_area_jsx /* Description Text Area */}

                            {piece_type_select_jsx /* Piece Type Select */}
                        
                            {theme_multiselect_jsx /* Theme Multiselect */}

                            {available_and_sold_container_jsx /* Split Container For Available / sold */}

                            {instagram_and_price_container_jsx /* Split Container For Instagram Link / Available */}
                            
                            {real_width_and_height_container_jsx /* Split Container For real_width / real_height */}

                            {px_width_and_height_container_jsx /* Split Container For image pixel width / pixel height */}

                            {framed_and_comments_container_jsx /* Split Container For framed / comments */}

                            {submit_container_jsx}
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

    // logger.debug(`Passing piece list (Next Line):`)
    // logger.debug(piece_list)

    return {
        props: { // will be passed to the page component as props
            piece_list: piece_list, 
            most_recent_id: piece_list[piece_list.length - 1]['id'] 
        }, 
    };
};
