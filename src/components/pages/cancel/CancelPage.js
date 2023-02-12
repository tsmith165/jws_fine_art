import React from 'react';
import Image from 'next/image'
import Link from 'next/link'

import styles from '../../../../styles/pages/Details.module.scss'

import PageLayout from '../../../../src/components/layout/PageLayout'
import { fetch_pieces } from '../../../../lib/api_calls';

import { CircularProgress } from '@material-ui/core';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

class CancelPage extends React.Component {
    constructor(props) {
        super(props);

        this.router = props.router

        console.log(`ID PROP: ${props.id}`)

        console.log(`getServerSideProps Pieces (Next Line):`)
        console.log(this.props.pieces)

        const pieces = this.props.pieces
        const pieces_length = this.props.pieces.length
        console.log(`Pieces Length: ${pieces_length}`)

        var image_array = [];
        
        var current_piece = null;
        var piece_position = 0;
        var piece_db_id = null;

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

        if (pieces_length > 0) {
            const current_piece = this.props.pieces[piece_position]

            title =       (current_piece['title']       !== undefined) ? current_piece['title'] : ''
            type =        (current_piece['type']        !== undefined) ? current_piece['type'] : 'Oil On Canvas'
            sold =        (current_piece['sold']        !== undefined) ? current_piece['sold'] : 'False'
            description = (current_piece['description'] !== undefined) ? current_piece['description'] : ''
            price =       (current_piece['price']       !== undefined) ? current_piece['price'] : ''
            width =       (current_piece['width']       !== undefined) ? current_piece['width'] : ''
            height =      (current_piece['height']      !== undefined) ? current_piece['height'] : ''
            real_width =  (current_piece['real_width']  !== undefined) ? current_piece['real_width'] : ''
            real_height = (current_piece['real_height'] !== undefined) ? current_piece['real_height'] : ''
            image_path =  (current_piece['image_path']  !== undefined) ? `${baseURL}${current_piece['image_path']}` : ''
            instagram =   (current_piece['instagram']   !== undefined) ? current_piece['instagram'] : ''
        }

        this.state = {
            debug: false,
            loading: true,
            url_o_id: props.id,
            pieces: pieces,
            image_array: image_array,
            current_piece: current_piece,
            piece_position: piece_position,
            piece_db_id: piece_db_id,
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
            }
        }

        this.update_current_piece = this.update_current_piece.bind(this);
        this.get_piece_from_path_o_id = this.get_piece_from_path_o_id.bind(this);
        this.create_image_array = this.create_image_array.bind(this);
    }

    async componentDidMount() {
        await this.update_current_piece(this.state.pieces, this.state.url_o_id)
    }

    async update_current_piece(pieces, o_id) {
        const pieces_length = pieces.length;

        console.log(`Piece Count: ${pieces_length} | Searching for URL_O_ID: ${o_id}`)
        const [piece_position, current_piece] = await this.get_piece_from_path_o_id(pieces, o_id);
        const piece_db_id = current_piece['id']

        console.log(`Piece Position: ${piece_position} | Piece DB ID: ${piece_db_id} | Data (Next Line):`)
        console.log(current_piece)
        
        console.log(`Updating to new selected piece with Postition: ${piece_position} | DB ID: ${piece_db_id} | O_ID: ${o_id}`)

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

        const image_array = await this.create_image_array(this.state.pieces, piece_position);

        console.log("CURRENT PIECE DETAILS (Next Line):")
        console.log(piece_details)

        const previous_url_o_id = this.state.url_o_id
        this.setState({
            loading: false,
            url_o_id: o_id,
            pieces: pieces,
            image_array: image_array,
            piece_position: piece_position,
            piece_db_id: piece_db_id, 
            piece: current_piece, 
            piece_details: piece_details
        }, async () => {
            if (previous_url_o_id != o_id) {
                this.router.push(`/checkout/cancel/${o_id}`) 
            }
        })
    }

    async create_image_array(pieces, piece_position) {
        var image_array = [];
        for (var i=0; i < pieces.length; i++) {
            let piece = pieces[i];
            image_array.push((
                <div className={(i == piece_position) ? styles.details_image_container : styles.details_image_container_hidden}>
                    <Image
                        id={`details_image_${i}`}
                        className={styles.details_image}
                        src={`${baseURL}${piece['image_path']}`}
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

    async get_piece_from_path_o_id(pieces, o_id) {
        for (var i=0; i < pieces.length; i++) {
            if (pieces[i]['o_id'].toString() == o_id.toString()) {
                return [i, pieces[i]]
            }
        }
    }

    render() {
        console.log("CURRENT PIECE DETAILS (Next Line):")
        console.log(this.state.piece_details)

        const title = (this.state.piece_details['title'] != null) ? (this.state.piece_details['title']) : ('')
        return (
            <PageLayout page_title={ (title == '') ? (``) : (`Checkout Cancel - ${title}`) }>
                <div className={styles.details_container}>
                    <div className={styles.details_container_left}>
                        <div className={styles.details_image_outer_container}>
                            <div className={styles.details_image_container}>
                                { (this.state.loading == true) ? ( 
                                    <div className={styles.loader_container}>
                                        <div>Loading Gallery</div>
                                        <CircularProgress color="inherit" className={styles.loader}/>
                                    </div>
                                ) : (
                                    this.state.image_array
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={styles.details_container_right}>
                        <div className={styles.title_container}>
                            <b className={styles.title}>{ (title == '') ? (``) : (`"${title}"`) }</b>
                        </div>
                        <div className={styles.checkout_return_message_container}>
                            <div className={styles.checkout_return_message}>
                                {`Purchase Unsuccessful!` }
                            </div>
                            <div className={styles.checkout_return_message}>
                                {`Try reloading the home page and selecting the piece again.` }
                            </div>
                            <div className={styles.checkout_return_message}>
                                {`If problems persist, feel free to reach out at jwsfineart@gmail.com` }
                            </div>
                        </div>
                    </div>
                </div>
            </PageLayout>
        )
    }
}

export default CancelPage;
