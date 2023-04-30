import PROJECT_CONSTANTS from '@/lib/constants';

import React from 'react';

import Image from 'next/image';

import mobile_styles from '@/styles/pages/DetailsMobile.module.scss';
import desktop_styles from '@/styles/pages/DetailsDesktop.module.scss';

import checkout_styles from '@/styles/pages/CheckoutReturn.module.scss'

import PageLayout from '@/components/layout/PageLayout';

import CircularProgress from '@mui/material/CircularProgress';

class SuccessPage extends React.Component {
    constructor(props) {
        super(props);

        this.router = props.router;

        console.log(`ID PROP: ${this.props.id}`);
        console.log(`ID PROP: ${this.props.id}`);
        const passed_o_id = this.props.id;

        const piece_list = this.props.piece_list;
        const num_pieces = piece_list.length;

        console.log(`getServerSideProps piece_list length: ${num_pieces} | Data (Next Line):`);
        console.log(piece_list);

        var piece_position = 0;
        for (var i = 0; i < piece_list.length; i++) {
            if (piece_list[i]['o_id'].toString() == passed_o_id.toString()) {
                console.log(
                    `Found piece at position ${i} | o_id: ${piece_list[i]['o_id']} | passed_o_id: ${passed_o_id}`,
                );
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
        var piece_type  = num_pieces < 1 ? '' : current_piece.piece_type !== undefined ? current_piece.piece_type : piece_type;
        var real_width  = num_pieces < 1 ? '' : current_piece.real_width !== undefined ? current_piece.real_width : '';
        var real_height = num_pieces < 1 ? '' : current_piece.real_height !== undefined ? current_piece.real_height : '';
        var image_path  = num_pieces < 1 ? '' : current_piece.image_path !== undefined ? `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${current_piece.image_path}` : '';
        var instagram   = num_pieces < 1 ? '' : current_piece.instagram !== undefined ? current_piece.instagram : '';
        /* prettier-ignore-end */

        this.state = {
            window_width: null,
            window_height: null,
            debug: false,
            loading: true,
            url_o_id: passed_o_id,
            piece_list: piece_list,
            current_piece: current_piece,
            piece_position: piece_position,
            db_id: db_id,
            o_id: o_id,
            image_jsx: null,
            title: title,
            price: price,
            instagram: instagram,
            price: price,
            address: '',
            international: null,
            error: '',
            error_found: false,
        };
    }

    async componentDidMount() {
        const styles = this.state.window_width < 769 ? mobile_styles : desktop_styles;
        const piece_position = this.state.piece_position;
        const image_path  = this.state.current_piece.image_path !== undefined ? `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${this.state.current_piece.image_path}` : '';

        var image_jsx = piece_position < 0 ? null : (
            <div key={`image_${piece_position}`} className={styles.details_image_container}>
                <Image
                    id={`details_image_${piece_position}`}
                    className={styles.details_image}
                    src={image_path}
                    alt={this.state.title}
                    priority={true}
                    layout="fill"
                    objectFit="contain"
                    quality={100}
                />
            </div>
        )
       
        console.log(`Setting state with Piece Position: ${this.state.piece_position}`);
        this.setState({
            loading: false,
            window_width: window.innerWidth,
            window_height: window.innerHeight,
            image_jsx: image_jsx,
         });

        window.addEventListener("resize", this.handleResize); // Add event listener
    }

    handleResize() {
        console.log(`Window Width: ${window.innerWidth} | Height: ${window.innerHeight}`);
        this.setState({
            window_width: window.innerWidth,
            window_height: window.innerHeight
        });
    }

    render() {
        const styles = this.state.window_width < 769 ? mobile_styles : desktop_styles;

        const image_container = (
            <div className={styles.details_image_outer_container}>
                <div className={styles.details_image_container}>{this.state.image_jsx}</div>
            </div>
        )

        // Title Container JSX
        const title_container = (
            <div className={checkout_styles.checkout_title_container}>
                <div className={checkout_styles.title}>{this.state.title == '' ? `` : `"${this.state.title}"`}</div>
            </div>
        );

        const title = this.state.title != null ? this.state.title : '';

        if (this.state.window_width > 768) {
            return (
                <PageLayout page_title={title == '' ? `` : `Checkout Cancel - ${title}`}>
                    <div className={styles.details_container}>
                        <div className={styles.details_container_left}>
                            {image_container}
                        </div>
                        <div className={styles.details_container_right}>
                            {title_container}
                            <div className={checkout_styles.checkout_return_message_container}>
                                <div className={checkout_styles.checkout_return_message}>{`Purchase Unsuccessful!`}</div>
                                <div className={checkout_styles.checkout_return_message}>
                                    {`Try reloading the home page and selecting the piece again.`}
                                </div>
                                <div className={checkout_styles.checkout_return_message}>
                                    {`If problems persist, feel free to reach out at ${PROJECT_CONSTANTS.CONTACT_EMAIL}`}
                                </div>
                            </div>
                        </div>
                    </div>
                </PageLayout>
            );
        }

        return (
            <PageLayout page_title={title == '' ? `` : `Checkout Cancel - ${title}`}>
                <div className={styles.details_container}>
                    {image_container}
                    {title_container}
                    <div className={checkout_styles.checkout_return_message_container}>
                        <div className={checkout_styles.checkout_return_message}>{`Purchase Unsuccessful!`}</div>
                        <div className={checkout_styles.checkout_return_message}>
                            {`Try reloading the home page and selecting the piece again.`}
                        </div>
                        <div className={checkout_styles.checkout_return_message}>
                            {`If problems persist, feel free to reach out at ${PROJECT_CONSTANTS.CONTACT_EMAIL}`}
                        </div>
                    </div>
                </div>
            </PageLayout>
        );
    }
}

export default SuccessPage;
