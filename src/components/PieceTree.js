import Link from 'next/link';
import Image from 'next/image'

import styles from '../../styles/PieceTree.module.scss'

import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import EditIcon from '@material-ui/icons/Edit';

import { change_order, delete_piece } from '../../lib/api_calls'

const baseURL = "https://jwsfineart.s3.us-west-1.amazonaws.com";

const PieceTree = ({piece_tree_data, refresh_data}) => {

    console.log("Generating Piece Tree - Data Next Line")
    console.log(piece_tree_data)

    var list_items = [];

    for (var i = 0; i < piece_tree_data.length; i++) {
        const piece_data = piece_tree_data[i];
        const pieces_length = piece_tree_data.length;
        console.log(`Piece Data Length ${pieces_length} | Output (Next Line):`);
        console.log(piece_data);

        const curr_id = piece_data['id']
        const last_id = (i + 1 > pieces_length - 1) ? piece_tree_data[0]['id']                 : piece_tree_data[i + 1]['id'];
        const next_id = (i - 1 < 0)                 ? piece_tree_data[pieces_length - 1]['id'] : piece_tree_data[i - 1]['id'];
    
        const curr_o_id = piece_data['o_id']
        const last_o_id = (i + 1 > pieces_length - 1) ? piece_tree_data[0]['o_id']                 : piece_tree_data[i + 1]['o_id'];
        const next_o_id = (i - 1 < 0)                 ? piece_tree_data[pieces_length - 1]['o_id'] : piece_tree_data[i - 1]['o_id'];

        const next_id_list = [next_id, next_o_id]
        const last_id_list = [last_id, last_o_id]
        const curr_id_list = [curr_id, curr_o_id]

        console.log(`Curr o_d: ${curr_o_id} | Next o_id: ${next_o_id} | Last o_id: ${last_o_id}`)

        const list_item_jsx = (
            <div className={styles.tree_list_item}>
                <div className={styles.list_item_image_container}>
                    <Image className={styles.list_item_image} src={`${baseURL}${piece_data['image_path']}`} layout="fill" object-fit="contain" />
                </div>

                <div className={styles.list_item_stacked_container}>
                    <div className={styles.stack_inner_container}>
                        <ArrowForwardIosRoundedIcon className={`${styles.stacked_arrow} ${styles.stacked_up}`} onClick={() => {change_order(curr_id_list, next_id_list, refresh_data)}}  />
                        <ArrowForwardIosRoundedIcon className={`${styles.stacked_arrow} ${styles.stacked_down}`} onClick={() => {change_order(curr_id_list, last_id_list, refresh_data)}}  />
                    </div>
                </div>

                <Link href={`/edit/${curr_id}`} passHref={true}>
                    <div className={styles.list_item_icon_container}>
                        <EditIcon className={`${styles.list_item_icon} ${styles.edit_button}`} />
                    </div>
                </Link>

                <div className={styles.list_item_icon_container}>
                    <DeleteForeverIcon className={`${styles.list_item_icon} ${styles.delete_button}`} onClick={() => {delete_piece(curr_id, refresh_data)}}  />
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

export default PieceTree;
