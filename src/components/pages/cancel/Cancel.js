import PROJECT_CONSTANTS from '@/lib/constants';

import React from 'react';
import Image from 'next/image';

import styles from '@/styles/pages/CheckoutReturn.module.scss';

import PageLayout from '@/components/layout/PageLayout';

class Cancel extends React.Component {
    constructor(props) {
        super(props);

        this.router = props.router;

        console.log(`ID PROP: ${this.props.id}`);
        const passed_o_id = this.props.id;

        const piece_list = this.props.piece_list;
        const piece_list_length = piece_list.length;

        console.log(`getServerSideProps piece_list length: ${piece_list_length} | Data (Next Line):`);
        console.log(piece_list);

        var current_piece = null;
        var piece_position = -1;
        var piece_db_id = null;
        var piece_o_id = null;

        for (var i = 0; i < piece_list.length; i++) {
            if (piece_list[i]['o_id'].toString() == passed_o_id.toString()) {
                piece_position = i;
            }
        }

        var title = '';
        var type = '';
        var description = '';
        var sold = false;
        var price = 9999;
        var width = '';
        var height = '';
        var real_width = '';
        var real_height = '';
        var image_path = '';
        var instagram = '';
        var image_jsx = null;

        if (piece_position > 0) {
            const current_piece = piece_list[piece_position];

            piece_db_id = current_piece['id'] !== undefined ? current_piece['id'] : '';
            piece_o_id = current_piece['o_id'] !== undefined ? current_piece['o_id'] : '';
            title = current_piece['title'] !== undefined ? current_piece['title'] : '';
            type = current_piece['type'] !== undefined ? current_piece['type'] : 'Oil On Canvas';
            sold = current_piece['sold'] !== undefined ? current_piece['sold'] : 'False';
            description = current_piece['description'] !== undefined ? current_piece['description'] : '';
            price = current_piece['price'] !== undefined ? current_piece['price'] : '';
            width = current_piece['width'] !== undefined ? current_piece['width'] : '';
            height = current_piece['height'] !== undefined ? current_piece['height'] : '';
            real_width = current_piece['real_width'] !== undefined ? current_piece['real_width'] : '';
            real_height = current_piece['real_height'] !== undefined ? current_piece['real_height'] : '';
            image_path =
                current_piece['image_path'] !== undefined
                    ? `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${current_piece['image_path']}`
                    : '';
            instagram = current_piece['instagram'] !== undefined ? current_piece['instagram'] : '';

            image_jsx = (
                <div key={`image_${i}`} className={styles.details_image_container}>
                    <Image
                        id={`details_image_${i}`}
                        className={styles.details_image}
                        src={`${PROJECT_CONSTANTS.AWS_BUCKET_URL}${current_piece['image_path']}`}
                        alt={current_piece['title']}
                        // height={this.state.piece_details['height']}
                        priority={i > piece_position - 3 && i < piece_position + 3 ? true : false}
                        layout="fill"
                        objectFit="contain"
                        quality={100}
                        onClick={(e) => {
                            e.preventDefault();
                            this.setState({ full_screen: !this.state.full_screen });
                        }}
                    />
                </div>
            );
        }

        this.state = {
            debug: false,
            loading: true,
            url_o_id: passed_o_id,
            piece_list: piece_list,
            image_jsx: image_jsx,
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
            },
        };
    }

    async componentDidMount() {}

    render() {
        console.log('CURRENT PIECE DETAILS (Next Line):');
        console.log(this.state.piece_details);

        const title = this.state.piece_details['title'] != null ? this.state.piece_details['title'] : '';
        return (
            <PageLayout page_title={title == '' ? `` : `Checkout Cancel - ${title}`}>
                <div className={styles.details_container}>
                    <div className={styles.details_container_left}>
                        <div className={styles.details_image_outer_container}>
                            <div className={styles.details_image_container}>{this.state.image_jsx}</div>
                        </div>
                    </div>
                    <div className={styles.details_container_right}>
                        <div className={styles.title_container}>
                            <b className={styles.title}>{title == '' ? `` : `"${title}"`}</b>
                        </div>
                        <div className={styles.checkout_return_message_container}>
                            <div className={styles.checkout_return_message}>{`Purchase Unsuccessful!`}</div>
                            <div className={styles.checkout_return_message}>
                                {`Try reloading the home page and selecting the piece again.`}
                            </div>
                            <div className={styles.checkout_return_message}>
                                {`If problems persist, feel free to reach out at ${PROJECT_CONSTANTS.CONTACT_EMAIL}`}
                            </div>
                        </div>
                    </div>
                </div>
            </PageLayout>
        );
    }
}

export default Cancel;
