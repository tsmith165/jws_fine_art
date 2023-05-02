import logger from '@/lib/logger';
import PROJECT_CONSTANTS from '@/lib/constants';

import React from 'react';
import { withRouter } from 'next/router';

import { prisma } from '@/lib/prisma';

import Image from 'next/image';
import Link from 'next/link';

import PageLayout from '@/components/layout/PageLayout';
import PieceSpecificationTable from '@/components/components/PieceSpecificationTable';
import TitleComponent from '@/components/components/TitleComponent';

import mobile_styles from '@/styles/pages/DetailsMobile.module.scss';
import desktop_styles from '@/styles/pages/DetailsDesktop.module.scss';

import CircularProgress from '@mui/material/CircularProgress';

class Details extends React.Component {
    constructor(props) {
        super(props);

        logger.section({message: `LOADING DETAILS PAGE`});

        const passed_o_id = this.props.router.query.id;

        const piece_list = this.props.piece_list;
        const num_pieces = piece_list == undefined || piece_list == null ? 0 : piece_list.length;

        var piece_position = 0;

        for (var i = 0; i < piece_list.length; i++) {
            if (piece_list[i]['o_id'].toString() == passed_o_id.toString()) {
                piece_position = i;
            }
        }

        var current_piece = piece_list[piece_position];

        const description_raw = current_piece.description == undefined ? '' : current_piece.description.length > 2 ? current_piece.description : '';

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
        /* prettier-ignore-end */

        var image_array = [];

        this.state = {
            window_width: null,
            window_height: null,
            user: this.props.user,
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
            description: description,
            title: title,
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
        logger.debug(`Window Width: ${window.innerWidth} | Height: ${window.innerHeight} | Setting Styles ${window.innerWidth < 769 ? 'Mobile' : 'Desktop'}`);
        this.setState({
            window_width: window.innerWidth,
            window_height: window.innerHeight,
        });
    }


    async update_current_piece(piece_list, o_id) {
        const previous_url_o_id = this.state.url_o_id;
        const num_pieces = piece_list.length;

        logger.debug(`Piece Count: ${num_pieces} | Searching for URL_O_ID: ${o_id}`);
        const [piece_position, current_piece] = await this.get_piece_from_path_o_id(piece_list, o_id);
        const current_db_id = current_piece['id'];
        const current_o_id = current_piece['o_id'];

        logger.debug(`Piece Position: ${piece_position} | Piece DB ID: ${current_db_id} | Data (Next Line):`);
        logger.debug(current_piece);

        const next_oid = piece_position + 1 > num_pieces - 1 ? piece_list[0].o_id : piece_list[piece_position + 1].o_id;
        const last_oid = piece_position - 1 < 0 ? piece_list[num_pieces - 1].o_id : piece_list[piece_position - 1].o_id;

        logger.debug(
            `Updating to new selected piece with Postition: ${piece_position} | ` + 
            `DB ID: ${current_db_id} | O_ID: ${current_o_id} | NEXT_O_ID: ${next_oid} | LAST_O_ID: ${last_oid}`
        );

        const image_array = await this.create_image_array(this.state.piece_list, piece_position);

        this.setState(
            {
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
                description: current_piece['description'].split('<br>').join('\n'),
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
                description: current_piece.description,
                sold: current_piece.sold,
                available: current_piece.available,
                price: current_piece.price,
                
            },
            async () => {
                if (previous_url_o_id != o_id) {
                    this.props.router.push(`/details/${o_id}`);
                }
            },
        );
    }

    async create_image_array(piece_list, piece_position) {
        logger.debug(`Current window width: ${ window.innerWidth} | piece position: ${piece_position}`)

        const styles = window.innerWidth < 769 ? mobile_styles : desktop_styles;

        var image_array = [];
        for (var i = 0; i < piece_list.length; i++) {
            let piece = piece_list[i];
            image_array.push(
                <div key={`image_${i}`} className={
                    (i == piece_position) ? styles.details_image_container : styles.details_image_container_hidden
                }>
                    <Image
                        id={`details_image_${i}`}
                        className={styles.details_image}
                        src={`${PROJECT_CONSTANTS.AWS_BUCKET_URL}${piece.image_path}`}
                        alt={piece.title}
                        // height={this.state.height}
                        priority={i > piece_position - 3 && i < piece_position + 3 ? true : false}
                        quality={100}
                        layout="fill"
                        objectFit='contain'
                    />
                </div>
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

    render() {
        logger.debug(`is Admin: ${this.state.user != undefined ? this.state.user.publicMetadata.role : 'NOT ADMIN'}`);

        const title = this.state.title != null ? this.state.title : '';
        const styles = this.state.window_width < 769 ? mobile_styles : desktop_styles;

        // Gallery Loader Container JSX
        const loader_container = (
            <div className={styles.loader_container}>
                <div>Loading Gallery</div>
                <CircularProgress color="inherit" className={styles.loader} />
            </div>
        );
        
        // Main Image Container JSX
        const image_container = (
            <div className={styles.details_image_outer_container}>
                {this.state.loading == true ? ( loader_container ) : ( this.state.image_array )}
            </div>
        );
        
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
            <Link href={`/checkout/${this.state.url_o_id}`} className={styles.price_wrapper} >
                <div className={styles.price_label_wrapper}>
                    <Image
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
                    <Image
                        className={styles.instagram_link_image}
                        src="/instagram_icon_100.png"
                        alt="Instagram Link"
                        priority={true}
                        layout="fill"
                        objectFit="contain"
                    />
                </div>
            </Link>
        ) : null;
        
        // Edit Piece Button JSX
        const edit_piece_button_jsx = (this.state.user !== undefined && this.state.user !== null && this.state.user.publicMetadata.role == 'ADMIN') ? (
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

        if (this.state.window_width < 769) {
            return (
                <PageLayout page_title={title == '' ? `` : `Piece Details - ${title}`}>
                    <div className={styles.details_container}>

                        {image_container /* Image Container */}
                        {title_container /* Title Container */}
                        {details_form /* Details Form Container */}
                    </div>
                </PageLayout>
            );
        }

        return (
            <PageLayout page_title={title == '' ? `` : `Piece Details - ${title}`}>
                <div className={styles.details_container}>
                    <div className={styles.details_container_left}>
                        {image_container}
                    </div>
                    <div className={styles.details_container_right}>
                        {title_container}
                        {details_form}
                    </div>
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
