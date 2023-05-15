import logger from '@/lib/logger';
import PROJECT_CONSTANTS from '@/lib/constants';

import React from 'react';
import { withRouter } from 'next/router';

import { prisma } from '@/lib/prisma';

import NextImage from 'next/image';
import Link from 'next/link';

import { handleButtonLabelClickGTagEvent } from '@/lib/analytics';

import PageLayout from '@/components/layout/PageLayout';
import PieceSpecificationTable from '@/components/components/PieceSpecificationTable';
import TitleComponent from '@/components/components/TitleComponent';

import mobile_styles from '@/styles/pages/DetailsMobile.module.scss';
import desktop_styles from '@/styles/pages/DetailsDesktop.module.scss';

import CircularProgress from '@mui/material/CircularProgress';

class Details extends React.Component {
    constructor(props) {
        super(props);

        const passed_o_id = this.props.router.query.id;
        logger.section({message: `LOADING DETAILS PAGE - Piece ID: ${passed_o_id}`});

        const piece_list = this.props.piece_list;
        const num_pieces = piece_list == undefined || piece_list == null ? 0 : piece_list.length;

        var piece_position = 0;

        for (var i = 0; i < piece_list.length; i++) {
            if (piece_list[i]['o_id'].toString() == passed_o_id.toString()) {
                piece_position = i;
            }
        }

        var current_piece = piece_list[piece_position];

        var description_raw = current_piece.description == undefined ? '' : current_piece.description.length > 2 ? current_piece.description : '';

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
        var available   = num_pieces < 1 ? '' : current_piece.available == true || current_piece.sold.toString().toLowerCase() == 'true' ? 'True' : 'False';
        var piece_type  = num_pieces < 1 ? '' : current_piece.piece_type !== undefined ? current_piece.piece_type : piece_type;
        var comments    = num_pieces < 1 ? '' : current_piece.comments !== undefined ? current_piece.comments : '';
        var description = num_pieces < 1 ? '' : description_raw !== undefined ? description_raw.split('<br>').join('\n') : '';
        var real_width  = num_pieces < 1 ? '' : current_piece.real_width !== undefined ? current_piece.real_width : '';
        var real_height = num_pieces < 1 ? '' : current_piece.real_height !== undefined ? current_piece.real_height : '';
        var image_path  = num_pieces < 1 ? '' : current_piece.image_path !== undefined ? `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${current_piece.image_path}` : '';
        var instagram   = num_pieces < 1 ? '' : current_piece.instagram !== undefined ? current_piece.instagram : '';

        logger.debug(`Piece Type: "${piece_type}"`)

        logger.debug(`Edit Page ${passed_o_id} Extra Images: "${current_piece.extra_images}"`)
        var extra_images  = num_pieces < 1 ? [] : [undefined, null, ''].includes(current_piece.extra_images) ? [] : current_piece.extra_images.includes(', ') ? current_piece.extra_images.split(', ') : current_piece.extra_images.length > 2 ? current_piece.extra_images : []
        logger.debug(`Using Extra Images: "${extra_images}"`)

        logger.debug(`Edit Page ${passed_o_id} Progress Images: "${current_piece.extra_images}"`)
        var progress_images  = num_pieces < 1 ? [] : [undefined, null, ''].includes(current_piece.progress_images) ? [] : current_piece.progress_images.includes(', ') ? current_piece.progress_images.split(', ') : current_piece.progress_images.length > 2 ? current_piece.progress_images : []
        logger.debug(`Using Progress Images: "${progress_images}"`)
        /* prettier-ignore-end */

        description = description.includes('<br>') ? description.split('<br>').join('\n') : description;
        console.log(`Description (Next Line):\n${description}`)

        var image_array = [];

        this.state = {
            window_width: null,
            window_height: null,
            debug: false,
            loading: true,
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
            description: description,
            title: title,
            piece_type: piece_type,
            available: available,
            sold: sold,
            price: price,
            instagram: instagram,
            theme: theme,
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
            selected_gallery_image: 0,
        };

        this.update_current_piece = this.update_current_piece.bind(this);
        this.get_piece_from_path_o_id = this.get_piece_from_path_o_id.bind(this);
        this.create_image_array = this.create_image_array.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }

    async componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    async componentDidMount() {
        var image_array = [];
        var extra_image_array = [];
        const num_pieces = this.state.piece_list.length;
        if (num_pieces > 0) {
            image_array = await this.create_image_array(this.state.piece_list, this.state.piece_position);

            extra_image_array = await this.create_extra_image_array(this.state.selected_gallery_image);
        }
       
        logger.debug(`Setting state with Piece Position: ${this.state.piece_position} | piece list length: ${num_pieces}`);
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

    handleResize() {
        logger.debug(`Window Width: ${window.innerWidth} | Height: ${window.innerHeight} | Setting Styles ${window.innerWidth < 1800 ? 'Desktop' : 'Mobile'}`);
        this.update_state({
            window_width: window.innerWidth,
            window_height: window.innerHeight,
        });
    }

    async update_state(state) {
        logger.debug(`Updating state with object (Next Line):`);
        logger.debug(state);
    
        this.setState(prevState => ({ ...prevState, ...state }), () => { 
            logger.debug(`Updated state (Next Line):`);
            logger.debug(this.state);
        });
    }

    async update_current_piece(piece_list, o_id) {
        this.update_state({ loading: true });

        const previous_url_o_id = this.state.url_o_id;
        const num_pieces = piece_list.length;

        logger.debug(`Piece Count: ${num_pieces} | Searching for URL_O_ID: ${o_id}`);
        const [piece_position, current_piece] = await this.get_piece_from_path_o_id(piece_list, o_id);
        const current_db_id = current_piece['id'];
        const current_o_id = current_piece['o_id'];

        logger.debug(`Piece Position: ${piece_position} | Piece DB ID: ${current_db_id} | Piece O ID: ${current_o_id} | Description (Next Line):`);
        console.log(current_piece.description);

        const next_oid = piece_position + 1 > num_pieces - 1 ? piece_list[0].o_id : piece_list[piece_position + 1].o_id;
        const last_oid = piece_position - 1 < 0 ? piece_list[num_pieces - 1].o_id : piece_list[piece_position - 1].o_id;

        logger.debug(
            `Updating to new selected piece with Postition: ${piece_position} | ` + 
            `DB ID: ${current_db_id} | O_ID: ${current_o_id} | NEXT_O_ID: ${next_oid} | LAST_O_ID: ${last_oid}`
        );

        const image_array = await this.create_image_array(this.state.piece_list, piece_position);

        console.log(`Description type: ${typeof description} | Value (Next Line):\n ${description}`)

        var description = current_piece.description
        description = description.includes('<br>') ? description.split('<br>').join('\n') : description;
        console.log(`Description (Next Line):\n${description}`)

        var extra_images  = num_pieces < 1 ? [] : [undefined, null, ''].includes(current_piece.extra_images) ? [] : current_piece.extra_images.includes(', ') ? current_piece.extra_images.split(', ') : current_piece.extra_images.length > 2 ? current_piece.extra_images : []
        var progress_images  = num_pieces < 1 ? [] : [undefined, null, ''].includes(current_piece.progress_images) ? [] : current_piece.progress_images.includes(', ') ? current_piece.progress_images.split(', ') : current_piece.progress_images.length > 2 ? current_piece.progress_images : []

        this.update_state({
            loading: false,
            url_o_id: o_id,
            piece_list: piece_list,
            image_array: image_array,
            piece_position: piece_position,
            current_piece: current_piece,
            db_id: current_db_id,
            o_id: current_o_id,
            title: current_piece.title,
            piece_type: current_piece.piece_type,
            description: description,
            sold: current_piece.sold,
            price: current_piece.price,
            width: current_piece.width,
            height: current_piece.height,
            real_width: current_piece.real_width,
            real_height: current_piece.real_height,
            image_path: `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${current_piece.image_path}`,
            instagram: current_piece.instagram,
            available: current_piece.available !== undefined ? current_piece.available : false,
            framed: current_piece.framed !== undefined ? current_piece.framed : false,
            comments: current_piece.comments,
            next_oid: next_oid,
            last_oid: last_oid,
            sold: current_piece.sold,
            available: current_piece.available,
            price: current_piece.price,
            extra_images: extra_images,
            progress_images: progress_images,
            selected_gallery_image: 0,
        }, async () => {
            if (previous_url_o_id != o_id) {
                this.props.router.push(`/details/${o_id}`);
            }
        });
    }

    async create_image_array(piece_list, piece_position) {
        logger.debug(`Current window width: ${ window.innerWidth} | piece position: ${piece_position}`)

        const styles = window.innerWidth > 1800 ? desktop_styles : mobile_styles;

        var image_array = [];
        for (var i = 0; i < piece_list.length; i++) {
            let piece = piece_list[i];
            image_array.push(
                <div key={`image_${i}`} className={
                    (i == piece_position) ? styles.centered_image_container : styles.centered_image_container_hidden
                }>
                    <NextImage
                        id={`centered_image_${i}`}
                        className={styles.centered_image}
                        src={`${PROJECT_CONSTANTS.AWS_BUCKET_URL}${piece.image_path}`}
                        alt={piece.title}
                        priority={i > piece_position - 3 && i < piece_position + 3 ? true : false}
                        quality={100}
                        width={this.state.width}
                        height={this.state.height}
                    />
                </div>
            );
        }
        return image_array;
    }

    async create_extra_image_array(selected_image) {
        const styles = window.innerWidth === undefined ? desktop_styles : window.innerWidth > 1800 ? desktop_styles : mobile_styles;

        var using_extra_images = typeof this.state.extra_images === 'string' ? JSON.parse(this.state.extra_images) : this.state.extra_images;
        console.log(`Using Extra Images HERE LENGTH: ${using_extra_images.length} | TYPE: ${typeof using_extra_images} | DATA (NEXT LINE):`)
        console.log(using_extra_images)

        var extra_image_array = [];
        using_extra_images.map((image, index) => {
            console.log(`Path: ${image.image_path} | Width: ${image.width} | Height: ${image.height}`)
            extra_image_array.push(
                <div key={`extra_image_${index}`} className={index == (selected_image) ? styles.centered_image_container : styles.centered_image_container_hidden}>
                    <NextImage
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

    render() {
        logger.debug(`is Admin: ${this.props.user != undefined ? this.props.user.publicMetadata.role : 'NOT ADMIN'}`);

        const title = this.state.title != null ? this.state.title : '';
        const styles = this.state.window_width > 1800 ? desktop_styles : mobile_styles;

        let using_extra_images = null;
        try {
            using_extra_images = typeof this.state.extra_images === 'string' ? JSON.parse(this.state.extra_images) : this.state.extra_images;
        } catch (error) { }

        logger.debug(`using_extra_images type: ${typeof using_extra_images} | data (next line):`);
        logger.debug(using_extra_images)

        // Gallery Loader Container JSX
        const image_loader_container_jsx = (
            <div className={`${styles.loader_container}`}>
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
                        console.log(image)
                        var image_path = image.image_path.split('/').slice(-2).join('/')
                        console.log(`Path: ${image_path} | Width: ${image.width} | Height: ${image.height}`)
                        return (
                            <div className={(this.state.selected_gallery_image === (index + 1)) ? 
                                `${styles.extra_images_gallery_image_container} ${styles.centered_image_container} ${styles.selected_gallery_image}` : 
                                `${styles.extra_images_gallery_image_container} ${styles.centered_image_container}`
                            }>
                                <div className={`${styles.extra_images_gallery_image} ${styles.centered_image_container}`} onClick={ async () => {
                                    const extra_image_array = await this.create_extra_image_array(index)
                                    this.update_state({ selected_gallery_image: index + 1, extra_image_array: extra_image_array });
                                }}>
                                    <NextImage
                                        className={styles.centered_image}
                                        src={`${PROJECT_CONSTANTS.AWS_BUCKET_URL}/${image_path}`}
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
                    `${styles.extra_images_gallery_image_container} ${styles.centered_image_container} ${styles.selected_gallery_image}` : 
                    `${styles.extra_images_gallery_image_container} ${styles.centered_image_container}`
                }>
                    <div className={`${styles.extra_images_gallery_image} ${styles.centered_image_container}`} onClick={() => {
                        this.update_state({'selected_gallery_image': 0})
                    }}>
                        <NextImage
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
        
        // Title Container JSX
        const title_container = (
            <TitleComponent
                title={title == '' ? `` : `${title}`}
                piece_list={this.state.piece_list}
                next_oid={this.state.next_oid}
                last_oid={this.state.last_oid}
                update_current_piece={this.update_current_piece}
            />
        );

        // Sold Label JSX
        const sold_label = ( <div className={styles.piece_sold}>Sold</div> );

        // Unavailable Label JSX
        const unavailable_label = ( <div className={styles.piece_sold}>Not For Sale</div> );

        // Price Label JSX
        const price_label = (
            <Link href={`/checkout/${this.state.url_o_id}`} className={styles.price_wrapper} onClick={() => handleButtonLabelClickGTagEvent(
                'details_checkout_button_click', 'Details Checkout Button', 'Details Checkout Button Clicked')
            }>
                <div className={styles.price_label_wrapper}>
                    <NextImage
                        className={styles.price_label_stripe_image}
                        src="/stripe_checkout_tan-221_50.png"
                        alt="View Stripe Info"
                        priority={true}
                        width={133}
                        height={30}
                    />
                </div>
                <div className={styles.price_text}>{`$${this.state.price}`}</div>
            </Link>
        );
        
        const sold_value = this.state.sold.toString().toLowerCase();
        // Uses sold label if piece sold, unavailable label if piece not for sale, or price label if piece is for sale
        const price_jsx = sold_value == 'true' ? sold_label : 
            this.state.available == false ? unavailable_label : price_label
        
        // Instagram Button JSX
        const instagram_jsx = (this.state.instagram != null &&  this.state.instagram != '' && this.state.instagram.length > 5) ? (
            <Link className={styles.instagram_link_container} href={`https://www.instagram.com/p/${this.state.instagram}`}>
                <div className={styles.instagram_image_container}>
                    <NextImage
                        className={styles.instagram_link_image}
                        src="/instagram_icon_100.png"
                        alt="Instagram Link"
                        priority={true}
                        width={50}
                        height={50}
                    />
                </div>
            </Link>
        ) : null;
        
        // Edit Piece Button JSX
        const edit_piece_button_jsx = (this.props.user !== undefined && this.props.user !== null && this.props.user.publicMetadata.role == 'ADMIN') ? (
            <Link href={`/edit/${this.state.url_o_id}`}>
                <div className={styles.edit_piece_button}>Edit Piece</div>
            </Link>
        ) : null;
        
        // Piece Description Text Block
        const description_jsx = (this.state.description != null && this.state.description.length > 2) ? (
            <div className={styles.details_description_container}>
                <h3 className={styles.details_description}>{this.state.description}</h3>
            </div>
        ) : null;
        
        // Piece Specification Table
        const piece_specification_table = (
            <PieceSpecificationTable
                realWidth={this.state.real_width}
                realHeight={this.state.real_height}
                framed={this.state.framed}
                comments={this.state.comments}
                piece_type={this.state.piece_type}
                with_header={false}
            />
        )

        const details_form = (
            <div className={styles.details_form_container}>
                {piece_specification_table}
                
                <div className={styles.details_navigation_container}>
                    <div className={styles.details_navigation_inner_container}>
                        {price_jsx}
                        {instagram_jsx}
                        {edit_piece_button_jsx}
                    </div>
                </div>
                {description_jsx}
            </div>
        )

        if (this.state.window_width > 1800) {
            return (
                <PageLayout page_title={title == '' ? `` : `Piece Details - ${title}`}>
                    <div className={styles.details_container}>
                        <div className={styles.details_container_left}>
                            {final_image_container_jsx}
                        </div>
                        <div className={styles.details_container_right}>
                            {title_container}
                            {details_form}
                        </div>
                    </div>
                </PageLayout>
            );
        }

        return (
            <PageLayout page_title={title == '' ? `` : `Piece Details - ${title}`}>
                <div className={styles.details_container}>

                    {final_image_container_jsx /* Image Container */}
                    {title_container /* Title Container */}
                    {details_form /* Details Form Container */}
                </div>
            </PageLayout>
        );


    }
}
export default withRouter(Details);

export const getServerSideProps = async (context) => {
    logger.section({message: `Fetching Initial Details Page Server List`});

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
