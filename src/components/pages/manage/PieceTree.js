import React from 'react';
import Link from 'next/link';
import Image from 'next/image'

import styles from '../../../../styles/pages/Manage.module.scss'

import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';

import { change_order, delete_piece } from '../../../../lib/api_calls'

const SITE_BASE_URL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

class PieceTree extends React.Component {
    constructor(props) {
        super(props);

    }

    async componentDidMount() {

    }

    render() {
        console.log("Generating Piece Tree - Data Next Line")
        console.log(this.props.piece_tree_data)
    
        var list_items = [];
    
        for (var i = 0; i < this.props.piece_tree_data.length; i++) {
            const piece_data = this.props.piece_tree_data[i];
            const pieces_length = this.props.piece_tree_data.length;
            console.log(`Piece Data Length ${pieces_length} | Output (Next Line):`);
            console.log(piece_data);
            
            const curr_id = piece_data['id']
            const last_id = (i + 1 > pieces_length - 1) ? this.props.piece_tree_data[0]['id']                 : this.props.piece_tree_data[i + 1]['id'];
            const next_id = (i - 1 < 0)                 ? this.props.piece_tree_data[pieces_length - 1]['id'] : this.props.piece_tree_data[i - 1]['id'];
        
            const curr_o_id = piece_data['o_id']
            const last_o_id = (i + 1 > pieces_length - 1) ? this.props.piece_tree_data[0]['o_id']                 : this.props.piece_tree_data[i + 1]['o_id'];
            const next_o_id = (i - 1 < 0)                 ? this.props.piece_tree_data[pieces_length - 1]['o_id'] : this.props.piece_tree_data[i - 1]['o_id'];
    
            const next_id_list = [next_id, next_o_id]
            const last_id_list = [last_id, last_o_id]
            const curr_id_list = [curr_id, curr_o_id]
    
            console.log(`Curr o_d: ${curr_o_id} | Next o_id: ${next_o_id} | Last o_id: ${last_o_id}`)
    
            const list_item_jsx = (
                <div className={styles.tree_list_item}>
                    <div className={styles.list_item_image_container}>
                        <Image className={styles.list_item_image} src={`${SITE_BASE_URL}${piece_data['image_path']}`} layout="fill" object-fit="contain" />
                    </div>
    
                    <div className={styles.list_item_stacked_container}>
                        <div className={styles.stack_inner_container}>
                            <ArrowForwardIosRoundedIcon className={`${styles.stacked_arrow} ${styles.stacked_up}`} onClick={(e) => { e.preventDefault(); change_order(curr_id_list, next_id_list, this.props.refresh_data) }}  />
                            <ArrowForwardIosRoundedIcon className={`${styles.stacked_arrow} ${styles.stacked_down}`} onClick={(e) => { e.preventDefault(); change_order(curr_id_list, last_id_list, this.props.refresh_data) }}  />
                        </div>
                    </div>
    
                    <Link href={`/edit/${curr_id}`}>
                        <div className={styles.list_item_icon_container}>
                            <EditIcon className={`${styles.list_item_icon} ${styles.edit_button}`} />
                        </div>
                    </Link>
    
                    <div className={styles.list_item_icon_container}>
                        <DeleteForeverIcon className={`${styles.list_item_icon} ${styles.delete_button}`} onClick={(e) => { e.preventDefault(); delete_piece(curr_id, this.props.refresh_data) }}  />
                    </div>
    
                    <div className={`${styles.list_item_title_container}`}>
                        <b className={`${styles.list_item_title}`}>{piece_data['title']}</b>
                    </div>
                </div>
            );
    
            list_items.push(list_item_jsx)
        }
    
        return (
            <div className={styles.piece_tree_body}>
                <div className={styles.tree_list_item_container}>
                    {list_items}
                </div>
            </div>
        )
    }
}

export default PieceTree;
